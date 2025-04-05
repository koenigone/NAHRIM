const db = require("../config/db");
const axios = require("axios");
const cron = require('node-cron');
const { mapLocations } = require('../helpers/mapsLocations');

/*
  fetchAndInsertWindyData structure PLEASE READ
  Penang's latitude and longitue
  API usage and data extraction
  data standardizing (timestamps, temps conversion etc..)
  inserting standardized data in the table

  with loads of error handling in between
*/
const fetchAndInsertWindyData = async (req, res) => {
  const latitude = 5.285153;
  const longitude = 100.456238;
  const windyAPIURL = "https://api.windy.com/api/point-forecast/v2";

  try {
    const windyAPIRequestBody = {
      lat: latitude,
      lon: longitude,
      model: "gfs",
      parameters: ["temp"],
      levels: ["surface"],
      key: process.env.WINDY_API_KEY,
    };

    // fetching data from Windy API
    const windyResponse = await axios.post(windyAPIURL, windyAPIRequestBody);
    const windyWeatherData = windyResponse.data;

    // Validate the API response
    if (!windyWeatherData.ts || !windyWeatherData["temp-surface"]) {
      return res.status(500).json({ errMessage: "Invalid API response" });
    }

    // extracting timestamp and temperature data from windyWeather object
    const { ts, "temp-surface": tempSurface } = windyWeatherData; // renaming temp-surface
    let temperatureData = {};

    // Get the current date and calculate the date 7 days from now
    const currentDate = new Date();
    const sevenDaysLater = new Date(currentDate);
    sevenDaysLater.setDate(currentDate.getDate() + 7);

    // Process the API data
    ts.forEach((timestamp, index) => {
      const date = new Date(timestamp);
      if (date >= currentDate && date <= sevenDaysLater) {
        const dateString = date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
        const tempCelsius = tempSurface[index] - 273.15;     // Convert from Kelvin to Celsius

        // Checks if the date (dateString) already exists as a key in the temperatureData object
        // If not, initializes it as an empty array
        if (!temperatureData[dateString]) {
          temperatureData[dateString] = [];
        }
        temperatureData[dateString].push(tempCelsius);       // Group temperatures by date
      }
    });

    // Insert or update data in the database
    for (const date in temperatureData) {
      const temps = temperatureData[date];
      const minTemp = Math.round(Math.min(...temps)); // round min temp
      const maxTemp = Math.round(Math.max(...temps)); // round max temp
      const currentTemp = Math.round(temps[0]);       // round current temp

      // Check if the date already exists in the database
      const selectWindyTableSql = `SELECT Win_Min, Win_Max FROM Windy WHERE Win_Date = ?`;
      db.get(selectWindyTableSql, [date], (err, dataRow) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        let finalMinTemp = minTemp;
        let finalMaxTemp = maxTemp;

        if (dataRow) { // calculate the average if the date already exists
          finalMinTemp = Math.round((parseFloat(dataRow.Win_Min) + parseFloat(minTemp)) / 2);
          finalMaxTemp = Math.round((parseFloat(dataRow.Win_Max) + parseFloat(maxTemp)) / 2);
        }

        // Insert or update the database
        const insertWindyDataQuery = `
          INSERT INTO Windy (Win_Date, Win_Min, Win_Max, Win_Current) 
          VALUES (?, ?, ?, ?)
          ON CONFLICT(Win_Date) 
          DO UPDATE SET 
              Win_Min = excluded.Win_Min, 
              Win_Max = excluded.Win_Max,
              Win_Current = excluded.Win_Current;`;

        db.run(insertWindyDataQuery, [date, finalMinTemp, finalMaxTemp, currentTemp], function (err) {
          if (err) {
            res.status(500).json({ errMessage: err.message });
          }
        });
      });
    }
    res.json({ message: "Windy data inserted" });
  } catch (error) {
    res.status(500).json({ errMessage: error.message });
  }
};

// schedule the task to run daily at 12 am
cron.schedule('0 0 * * *', async () => {
  console.log("Running daily data update for Windy...");
  await fetchAndInsertWindyData();
});

// retrieve the daily data from the database
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

// retrieve the weekly data from the database
const getWindyDataForSevenDaysChart = (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 5);

  const getWindDataQuery = "SELECT * FROM Windy WHERE Win_Date BETWEEN ? AND ? ORDER BY Win_Date ASC;";

  db.all(getWindDataQuery, [today, sevenDaysLater.toISOString().split("T")[0]], (err, dataRow) => {
    if (err) {
      return res.status(500).json({ errMessage: err.message });
    }
    res.json({ data: dataRow });
  });
};

const getWindyDataForMap = async (req, res) => {
  try {
    const windyAPIURL = "https://api.windy.com/api/point-forecast/v2";

    const results = await Promise.all(
      mapLocations.map(async (location) => {
        const response = await axios.post(windyAPIURL,
          {
            lat: location.lat,
            lon: location.lon,
            model: "gfs",
            parameters: ["temp"],
            levels: ["surface"],
            key: process.env.WINDY_API_KEY
          }
        );

        if (response.status !== 200 || !response.data["temp-surface"]) {
          return { ...location, temperature: null };
        }

        // convert from kelvin to celsius
        const temperatures = response.data["temp-surface"].map(temp => temp - 273.15);
        const avgTemp = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;

        return {
          name: location.name,
          lat: location.lat,
          lon: location.lon,
          temperature: avgTemp.toFixed(2),             // avg temp in celsius
          date: new Date().toISOString().split("T")[0] // current date
        };
      })
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ errMessage: error.message });
  }
};

module.exports = { fetchAndInsertWindyData, getWindyDataForToday, getWindyDataForSevenDaysChart, getWindyDataForMap };