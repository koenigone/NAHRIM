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
  syncOWMData structure PLEASE READ
  Penang's latitude and longitue
  API usage and data extraction
  data standardizing (timestamps, temps conversion etc..)
  inserting standardized data in the table

  with loads of error handling in between
*/
const syncOWMData = async () => {
  const latitude = 5.285153;
  const longitude = 100.456238;
  const apiKey = process.env.OWM_API_KEY;
  const owmAPIURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

  const owmResponse = await axios.get(owmAPIURL);
  const owmWeatherData = owmResponse.data;

  if (!owmWeatherData?.list) {
    throw new Error("Invalid API response");
  }

  const currentDate = new Date();
  const sevenDaysLater = new Date(currentDate);
  sevenDaysLater.setDate(currentDate.getDate() + 7);

  const temperatureData = {};

  owmWeatherData.list.forEach((forecast) => {
    const date = new Date(forecast.dt * 1000);
    if (date >= currentDate && date <= sevenDaysLater) {
      const dateString = date.toISOString().split("T")[0];
      const tempCelsius = forecast.main.temp;

      if (!temperatureData[dateString]) {
        temperatureData[dateString] = [];
      }

      temperatureData[dateString].push(tempCelsius);
    }
  });

  const dates = Object.keys(temperatureData);
  if (dates.length === 0) {
    throw new Error("No OpenWeatherMap forecast data extracted.");
  }

  for (const date of dates) {
    const temps = temperatureData[date];
    const minTemp = Math.round(Math.min(...temps));
    const maxTemp = Math.round(Math.max(...temps));
    const currentTemp = Math.round(temps[temps.length - 1]);

    const existingRow = await getDb(
      "SELECT OWM_Min, OWM_Max, OWM_Current FROM OpenWeatherMap WHERE OWM_Date = ?",
      [date]
    );

    let finalMinTemp = minTemp;
    let finalMaxTemp = maxTemp;
    let finalCurrentTemp = currentTemp;

    if (existingRow) {
      finalMinTemp = Math.round((parseFloat(existingRow.OWM_Min) + minTemp) / 2);
      finalMaxTemp = Math.round((parseFloat(existingRow.OWM_Max) + maxTemp) / 2);
      finalCurrentTemp = Math.round(
        (parseFloat(existingRow.OWM_Current) + currentTemp) / 2
      );
    }

    await runDb(
      `INSERT INTO OpenWeatherMap (OWM_Date, OWM_Min, OWM_Max, OWM_Current)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(OWM_Date)
       DO UPDATE SET
         OWM_Min = excluded.OWM_Min,
         OWM_Max = excluded.OWM_Max,
         OWM_Current = excluded.OWM_Current`,
      [date, finalMinTemp, finalMaxTemp, finalCurrentTemp]
    );
  }

  return {
    source: "OpenWeatherMap",
    inserted: dates.length,
    dates,
  };
};

const fetchAndInsertOWMData = async (req, res) => {
  try {
    const result = await syncOWMData();
    res.json({
      message: "OpenWeatherMap data inserted",
      result,
    });
  } catch (error) {
    res.status(500).json({ errMessage: error.message });
  }
};

const getOWMDataForToday = (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const getOWMDataQuery = "SELECT * FROM OpenWeatherMap WHERE OWM_Date = ?;";

  db.all(getOWMDataQuery, [today], (err, dataRow) => {
    if (err) {
      return res.status(500).json({ errMessage: err.message });
    }

    res.json({ data: dataRow });
  });
};

const getOWMDataForSevenDaysChart = (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 5);

  const getOWMDataQuery =
    "SELECT * FROM OpenWeatherMap WHERE OWM_Date BETWEEN ? AND ? ORDER BY OWM_Date ASC;";

  db.all(
    getOWMDataQuery,
    [today, sevenDaysLater.toISOString().split("T")[0]],
    (err, dataRow) => {
      if (err) {
        return res.status(500).json({ errMessage: err.message });
      }

      res.json({ data: dataRow });
    }
  );
};

const getOWMDataForMap = async (req, res) => {
  try {
    const apiKey = process.env.OWM_API_KEY;
    const results = await Promise.all(
      mapLocations.map(async (location) => {
        const owmAPIURL = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${apiKey}`;

        try {
          const response = await axios.get(owmAPIURL);

          if (response.status !== 200 || !response.data.main) {
            return {
              name: location.name,
              lat: location.lat,
              lon: location.lon,
              temperature: null,
              humidity: null,
              windSpeed: null,
              date: new Date().toISOString().split("T")[0],
            };
          }

          return {
            name: location.name,
            lat: location.lat,
            lon: location.lon,
            temperature: response.data.main.temp.toFixed(2),
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind?.speed?.toFixed(2) || null,
            weatherCondition: response.data.weather[0]?.main || null,
            date: new Date().toISOString().split("T")[0],
          };
        } catch (error) {
          return {
            name: location.name,
            lat: location.lat,
            lon: location.lon,
            temperature: null,
            humidity: null,
            windSpeed: null,
            date: new Date().toISOString().split("T")[0],
          };
        }
      })
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ errMessage: error.message });
  }
};

module.exports = {
  syncOWMData,
  fetchAndInsertOWMData,
  getOWMDataForToday,
  getOWMDataForSevenDaysChart,
  getOWMDataForMap,
};
