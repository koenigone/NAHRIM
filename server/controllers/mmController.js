const db = require("../config/db");
const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");

/*
  fetchAndInsertMETMalaysiaData structure PLEASE READ
  Penang's latitude and longitue
  API usage and data extraction
  data standardizing (timestamps, temps conversion etc..)
  inserting standardized data in the table

  with loads of error handling in between
*/
const fetchAndInsertMETMalaysiaData = async (req, res) => {
  const url = "https://www.met.gov.my/en/forecast/weather/district/Ds014/";

  try {
    const { data: html } = await axios.get(url, { // fetch the webpage content
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36",
      },
    });

    const $ = cheerio.load(html);
    const forecastTable = $("table.table-zebra tbody");

    if (!forecastTable.length) {
      return res.status(500).json({ error: "Forecast table not found." });
    }

    const temperatureData = [];
    const currentDate = new Date();

    forecastTable.find("tr").each((index, row) => {
      if (index >= 6) return false;                   // fetch 6 days data

      const cells = $(row).find("td");
      if (cells.length < 3) return;

      // extract date
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + index);
      const dateString = date.toISOString().split("T")[0];

      // extract Min and Max temperatures using regex
      const forecastText = $(cells[2]).text().trim();
      const minMatch = forecastText.match(/Min:\s*(\d+)/);
      const maxMatch = forecastText.match(/Max:\s*(\d+)/);

      if (minMatch && maxMatch) {
        const minTemp = parseInt(minMatch[1], 10);
        const maxTemp = parseInt(maxMatch[1], 10);
        const avgTemp = Math.round((minTemp + maxTemp) / 2); // calculate average

        temperatureData.push({ date: dateString, min: minTemp, max: maxTemp, avg: avgTemp });
      }
    });

    if (temperatureData.length === 0) {
      return res.status(500).json({ error: "No temperature data extracted." });
    }

    // insert/update data in the METMalaysia database
    for (const { date, min, max, avg } of temperatureData) {
      try {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO METMalaysia (MM_Date, MM_Min, MM_Max, MM_Current)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(MM_Date) 
             DO UPDATE SET 
               MM_Min = excluded.MM_Min,
               MM_Max = excluded.MM_Max,
               MM_Current = excluded.MM_Current`,
            [date, min, max, avg],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });

      } catch (dbError) {
        res.status(500).json(`Database error for ${date}:`, dbError);
      }
    }

    res.json({ message: "METMalaysia data inserted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch METMalaysia data", details: error.message });
  }
};

// Schedule task to run daily at 12 AM
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily data update for METMalaysia...");
  await fetchAndInsertMETMalaysiaData();
});

// retrieve the daily data from the database
const getMMDataForToday = (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const getMMDataQuery = "SELECT * FROM METMalaysia WHERE MM_Date = ?;";

  db.all(getMMDataQuery, [today], (err, dataRow) => {
    if (err) {
      return res.status(500).json({ errMessage: err.message });
    }
    res.json({ data: dataRow });
  });
};

// retrieve the weekly data from the database
const getMMDataForSevenDaysChart = (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 5);

  const getMMDataQuery = "SELECT * FROM METMalaysia WHERE MM_Date BETWEEN ? AND ? ORDER BY MM_Date ASC;";

  db.all(getMMDataQuery, [today, sevenDaysLater.toISOString().split("T")[0]], (err, dataRow) => {
    if (err) {
      return res.status(500).json({ errMessage: err.message });
    }
    res.json({ data: dataRow });
  });
};

module.exports = { fetchAndInsertMETMalaysiaData, getMMDataForToday, getMMDataForSevenDaysChart };