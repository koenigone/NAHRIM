const db = require("../config/db");
const axios = require("axios");
const cheerio = require("cheerio");

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
  syncMETMalaysiaData structure PLEASE READ
  Penang's latitude and longitue
  API usage and data extraction
  data standardizing (timestamps, temps conversion etc..)
  inserting standardized data in the table

  with loads of error handling in between
*/
const syncMETMalaysiaData = async () => {
  const url = "https://www.met.gov.my/en/forecast/weather/district/Ds014/";
  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36",
    },
  });

  const $ = cheerio.load(html);
  const forecastTable = $("table.table-zebra tbody");

  if (!forecastTable.length) {
    throw new Error("Forecast table not found.");
  }

  const temperatureData = [];
  const currentDate = new Date();

  forecastTable.find("tr").each((index, row) => {
    if (index >= 6) {
      return false;
    }

    const cells = $(row).find("td");
    if (cells.length < 3) {
      return;
    }

    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + index);

    const forecastText = $(cells[2]).text().trim();
    const minMatch = forecastText.match(/Min:\s*(\d+)/);
    const maxMatch = forecastText.match(/Max:\s*(\d+)/);

    if (minMatch && maxMatch) {
      const minTemp = parseInt(minMatch[1], 10);
      const maxTemp = parseInt(maxMatch[1], 10);
      const avgTemp = Math.round((minTemp + maxTemp) / 2);

      temperatureData.push({
        date: date.toISOString().split("T")[0],
        min: minTemp,
        max: maxTemp,
        avg: avgTemp,
      });
    }
  });

  if (temperatureData.length === 0) {
    throw new Error("No temperature data extracted.");
  }

  for (const { date, min, max, avg } of temperatureData) {
    await runDb(
      `INSERT INTO METMalaysia (MM_Date, MM_Min, MM_Max, MM_Current)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(MM_Date)
       DO UPDATE SET
         MM_Min = excluded.MM_Min,
         MM_Max = excluded.MM_Max,
         MM_Current = excluded.MM_Current`,
      [date, min, max, avg]
    );
  }

  return {
    source: "METMalaysia",
    inserted: temperatureData.length,
    dates: temperatureData.map((entry) => entry.date),
  };
};

const fetchAndInsertMETMalaysiaData = async (req, res) => {
  try {
    const result = await syncMETMalaysiaData();
    res.json({
      message: "METMalaysia data inserted successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch METMalaysia data",
      details: error.message,
    });
  }
};

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

const getMMDataForSevenDaysChart = (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 5);

  const getMMDataQuery =
    "SELECT * FROM METMalaysia WHERE MM_Date BETWEEN ? AND ? ORDER BY MM_Date ASC;";

  db.all(
    getMMDataQuery,
    [today, sevenDaysLater.toISOString().split("T")[0]],
    (err, dataRow) => {
      if (err) {
        return res.status(500).json({ errMessage: err.message });
      }

      res.json({ data: dataRow });
    }
  );
};

module.exports = {
  syncMETMalaysiaData,
  fetchAndInsertMETMalaysiaData,
  getMMDataForToday,
  getMMDataForSevenDaysChart,
};
