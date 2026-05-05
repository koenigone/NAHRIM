const express = require("express");
const dailySyncRouter = express.Router();
const dailySyncController = require("../controllers/dailySyncController");

dailySyncRouter.post("/internal/daily-sync", dailySyncController.runDailySync);

module.exports = dailySyncRouter;
