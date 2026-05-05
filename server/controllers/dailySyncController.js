const { syncMETMalaysiaData } = require("./mmController");
const { syncOWMData } = require("./owmController");
const { syncWindyData } = require("./windyController");

const hasValidCronSecret = (req) => {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return false;
  }

  const authorizationHeader = req.get("authorization") || "";
  const bearerToken = authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.slice(7).trim()
    : "";
  const headerSecret = req.get("x-cron-secret") || "";

  return bearerToken === expectedSecret || headerSecret === expectedSecret;
};

const runDailySync = async (req, res) => {
  if (!process.env.CRON_SECRET) {
    return res.status(500).json({
      error: "CRON_SECRET is not configured on the server.",
    });
  }

  if (!hasValidCronSecret(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const jobs = [
    { name: "METMalaysia", run: syncMETMalaysiaData },
    { name: "OpenWeatherMap", run: syncOWMData },
    { name: "Windy", run: syncWindyData },
  ];

  const startedAt = new Date().toISOString();
  const results = [];

  for (const job of jobs) {
    try {
      console.log(`Starting ${job.name} daily sync...`);
      const result = await job.run();
      results.push({
        source: job.name,
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(`${job.name} daily sync failed:`, error.message);
      results.push({
        source: job.name,
        success: false,
        error: error.message,
      });
    }
  }

  const hasFailures = results.some((result) => !result.success);
  const finishedAt = new Date().toISOString();

  return res.status(hasFailures ? 500 : 200).json({
    message: hasFailures
      ? "One or more daily sync jobs failed."
      : "Daily sync completed successfully.",
    startedAt,
    finishedAt,
    results,
  });
};

module.exports = { runDailySync };
