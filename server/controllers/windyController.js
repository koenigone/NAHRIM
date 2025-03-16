const db = require("../config/db");
const axios = require("axios");
const cron = require('node-cron');

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

  try {
    const windyAPIURL = "https://api.windy.com/api/point-forecast/v2";
    const windyAPIRequestBody = {
      lat: latitude,
      lon: longitude,
      model: "gfs",
      parameters: ["temp"],
      levels: ["surface"],
      key: "RfmPqSUA1c49ZDDLdEZtufV4FwGjSifw",
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
      const minTemp = Math.min(...temps).toFixed(1); // Calculate min temperature
      const maxTemp = Math.max(...temps).toFixed(1); // Calculate max temperature

      // Check if the date already exists in the database
      const selectWindyTableSql = `SELECT Win_Min, Win_Max FROM Windy WHERE Win_Date = ?`;
      db.get(selectWindyTableSql, [date], (err, dataRow) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        let finalMinTemp = minTemp;
        let finalMaxTemp = maxTemp;

        if (dataRow) { // Calculate the average if the date already exists
          finalMinTemp = ((parseFloat(dataRow.Win_Min) + parseFloat(minTemp)) / 2).toFixed(1);
          finalMaxTemp = ((parseFloat(dataRow.Win_Max) + parseFloat(maxTemp)) / 2).toFixed(1);
        }

        // Insert or update the database
        const insertWindyDataQuery = `
          INSERT INTO Windy (Win_Date, Win_Min, Win_Max) 
          VALUES (?, ?, ?)
          ON CONFLICT(Win_Date) DO UPDATE 
          SET Win_Min = excluded.Win_Min, 
              Win_Max = excluded.Win_Max;`;

        db.run(insertWindyDataQuery, [date, finalMinTemp, finalMaxTemp], function (err) {
          if (err) {
            res.status(500).json({ errMessage: err.message });
          }
        });
      });
    }

    res.json({ message: "Windy data inserted" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// schedule the task to run daily at 12 am
cron.schedule('0 0 * * *', async () => {
  console.log("Running daily data update for Windy...");
  await fetchAndInsertWindyData();
});

// retrieve the data from the table to display it using the frontend
const getWindyDataForSevenDaysChart = (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 6);

  const getWindDataQuery = "SELECT * FROM Windy WHERE Win_Date BETWEEN ? AND ? ORDER BY Win_Date ASC;";

  db.all(getWindDataQuery, [today, sevenDaysLater.toISOString().split("T")[0]], (err, dataRow) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: dataRow });
  });
};

module.exports = { fetchAndInsertWindyData, getWindyDataForSevenDaysChart };