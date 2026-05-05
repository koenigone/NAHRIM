const db = require("../config/db");
const axios = require("axios");
const { mapLocations } = require("../helpers/mapsLocations");

const getDb = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, dataRow) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(dataRow);
    });
  });

const runDb = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this);
    });
  });

/*
  syncWindyData structure PLEASE READ
  Penang's latitude and longitue
  API usage and data extraction
  data standardizing (timestamps, temps conversion etc..)
  inserting standardized data in the table

  with loads of error handling in between
*/
const syncWindyData = async () => {
  const latitude = 5.285153;
  const longitude = 100.456238;
  const windyAPIURL = "https://api.windy.com/api/point-forecast/v2";

  const windyAPIRequestBody = {
    lat: latitude,
    lon: longitude,
    model: "gfs",
    parameters: ["temp"],
    levels: ["surface"],
    key: process.env.WINDY_API_KEY,
  };

  const windyResponse = await axios.post(windyAPIURL, windyAPIRequestBody);
  const windyWeatherData = windyResponse.data;

  if (!windyWeatherData.ts || !windyWeatherData["temp-surface"]) {
    throw new Error("Invalid API response");
  }

  const { ts, "temp-surface": tempSurface } = windyWeatherData;
  const temperatureData = {};

  const currentDate = new Date();
  const sevenDaysLater = new Date(currentDate);
  sevenDaysLater.setDate(currentDate.getDate() + 7);

  ts.forEach((timestamp, index) => {
    const date = new Date(timestamp);
    if (date >= currentDate && date <= sevenDaysLater) {
      const dateString = date.toISOString().split("T")[0];
      const tempCelsius = tempSurface[index] - 273.15;

      if (!temperatureData[dateString]) {
        temperatureData[dateString] = [];
      }

      temperatureData[dateString].push(tempCelsius);
    }
  });

  const dates = Object.keys(temperatureData);
  if (dates.length === 0) {
    throw new Error("No Windy forecast data extracted.");
  }

  for (const date of dates) {
    const temps = temperatureData[date];
    const minTemp = Math.round(Math.min(...temps));
    const maxTemp = Math.round(Math.max(...temps));
    const currentTemp = Math.round(temps[0]);

    const existingRow = await getDb(
      "SELECT Win_Min, Win_Max FROM Windy WHERE Win_Date = ?",
      [date]
    );

    let finalMinTemp = minTemp;
    let finalMaxTemp = maxTemp;

    if (existingRow) {
      finalMinTemp = Math.round((parseFloat(existingRow.Win_Min) + minTemp) / 2);
      finalMaxTemp = Math.round((parseFloat(existingRow.Win_Max) + maxTemp) / 2);
    }

    await runDb(
      `INSERT INTO Windy (Win_Date, Win_Min, Win_Max, Win_Current)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(Win_Date)
       DO UPDATE SET
         Win_Min = excluded.Win_Min,
         Win_Max = excluded.Win_Max,
         Win_Current = excluded.Win_Current;`,
      [date, finalMinTemp, finalMaxTemp, currentTemp]
    );
  }

  return {
    source: "Windy",
    inserted: dates.length,
    dates,
  };
};

const fetchAndInsertWindyData = async (req, res) => {
  try {
    const result = await syncWindyData();
    res.json({
      message: "Windy data inserted",
      result,
    });
  } catch (error) {
    res.status(500).json({ errMessage: error.message });
  }
};

const getWindyDataForToday = (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const getWindDataQuery = "SELECT * FROM Windy WHERE Win_Date = ?;";

  db.all(getWindDataQuery, [today], (err, dataRow) => {
    if (err) {
      return res.status(500).json({ errMessage: err.message });
    }

    res.json({ data: dataRow });
  });
};

const getWindyDataForSevenDaysChart = (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 5);

  const getWindDataQuery =
    "SELECT * FROM Windy WHERE Win_Date BETWEEN ? AND ? ORDER BY Win_Date ASC;";

  db.all(
    getWindDataQuery,
    [today, sevenDaysLater.toISOString().split("T")[0]],
    (err, dataRow) => {
      if (err) {
        return res.status(500).json({ errMessage: err.message });
      }

      res.json({ data: dataRow });
    }
  );
};

const getWindyDataForMap = async (req, res) => {
  try {
    const windyAPIURL = "https://api.windy.com/api/point-forecast/v2";

    const results = await Promise.all(
      mapLocations.map(async (location) => {
        const response = await axios.post(windyAPIURL, {
          lat: location.lat,
          lon: location.lon,
          model: "gfs",
          parameters: ["temp"],
          levels: ["surface"],
          key: process.env.WINDY_API_KEY,
        });

        if (response.status !== 200 || !response.data["temp-surface"]) {
          return { ...location, temperature: null };
        }

        const temperatures = response.data["temp-surface"].map(
          (temp) => temp - 273.15
        );
        const avgTemp =
          temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;

        return {
          name: location.name,
          lat: location.lat,
          lon: location.lon,
          temperature: avgTemp.toFixed(2),
          date: new Date().toISOString().split("T")[0],
        };
      })
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ errMessage: error.message });
  }
};

module.exports = {
  syncWindyData,
  fetchAndInsertWindyData,
  getWindyDataForToday,
  getWindyDataForSevenDaysChart,
  getWindyDataForMap,
};
