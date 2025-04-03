const db = require("../config/db");
const axios = require("axios");
const cron = require('node-cron');
const { mapLocations } = require('../helpers/mapsLocations');

const fetchAndInsertOWMData = async (req, res) => {
  const latitude = 5.285153;
  const longitude = 100.456238;
  const apiKey = process.env.OWM_API_KEY;
  const owmAPIURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

  try {
    const owmResponse = await axios.get(owmAPIURL);
    const owmWeatherData = owmResponse.data;

    if (!owmWeatherData?.list) {
      return res.status(500).json({ errMessage: "Invalid API response" });
    }

    const currentDate = new Date();
    const sevenDaysLater = new Date(currentDate);
    sevenDaysLater.setDate(currentDate.getDate() + 7);

    // Process data exactly like Windy
    let temperatureData = {};
    owmWeatherData.list.forEach(forecast => {
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

    for (const date in temperatureData) {
      const temps = temperatureData[date];
      const minTemp = Math.round(Math.min(...temps));
      const maxTemp = Math.round(Math.max(...temps));
      const currentTemp = Math.round(temps[temps.length - 1]); // Most recent temp

      const selectSql = `SELECT OWM_Min, OWM_Max FROM OpenWeatherMap WHERE OWM_Date = ?`;
      db.get(selectSql, [date], (err, dataRow) => {
        if (err) return res.status(500).json({ error: err.message });

        let finalMinTemp = minTemp;
        let finalMaxTemp = maxTemp;
        let finalCurrentTemp = currentTemp;

        if (dataRow) {
          finalMinTemp = Math.round((parseFloat(dataRow.OWM_Min) + minTemp) / 2);
          finalMaxTemp = Math.round((parseFloat(dataRow.OWM_Max) + maxTemp) / 2);
          finalCurrentTemp = Math.round((parseFloat(dataRow.OWM_Current) + currentTemp) / 2);
        }

        const upsertSql = `
          INSERT INTO OpenWeatherMap (OWM_Date, OWM_Min, OWM_Max, OWM_Current)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(OWM_Date) 
          DO UPDATE SET 
            OWM_Min = excluded.OWM_Min,
            OWM_Max = excluded.OWM_Max,
            OWM_Current = excluded.OWM_Current`;

        db.run(upsertSql, [date, finalMinTemp, finalMaxTemp, finalCurrentTemp], (err) => {
          if (err) return res.status(500).json({ error: err.message });
        });
      });
    }
    res.json({ message: "OpenWeatherMap data inserted" });
  } catch (error) {
    console.error("Error in fetchAndInsertOWMData:", error);
    res.status(500).json({ errMessage: error.message });
  }
};

// schedule the task to run daily at 12 am
cron.schedule('0 0 * * *', async () => {
  console.log("Running daily data update for Windy...");
  await fetchAndInsertOWMData();
});

// retrieve the daily data from the database
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

// retrieve the weekly data from the database
const getOWMDataForSevenDaysChart = (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 5);

  const getOWMDataQuery = "SELECT * FROM OpenWeatherMap WHERE OWM_Date BETWEEN ? AND ? ORDER BY OWM_Date ASC;";

  db.all(getOWMDataQuery, [today, sevenDaysLater.toISOString().split("T")[0]], (err, dataRow) => {
    if (err) {
      return res.status(500).json({ errMessage: err.message });
    }
    res.json({ data: dataRow });
  });
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
              date: new Date().toISOString().split("T")[0]
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
            date: new Date().toISOString().split("T")[0]
          };
        } catch (error) {
          console.error(`Error fetching OWM data for ${location.name}:`, error.message);
          return {
            name: location.name,
            lat: location.lat,
            lon: location.lon,
            temperature: null,
            humidity: null,
            windSpeed: null,
            date: new Date().toISOString().split("T")[0]
          };
        }
      })
    );

    res.json(results);
  } catch (error) {
    console.error("Error in getOWMDataForMap:", error);
    res.status(500).json({ errMessage: error.message });
  }
};

module.exports = { fetchAndInsertOWMData, getOWMDataForToday, getOWMDataForSevenDaysChart, getOWMDataForMap }