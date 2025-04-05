const express = require('express');
const mmRouter = express.Router();
const mmController = require('../controllers/mmController');

mmRouter.get("/insertMMData", mmController.fetchAndInsertMETMalaysiaData);
mmRouter.get('/mmDailyData', mmController.getMMDataForToday);
mmRouter.get('/mmWeeklyData', mmController.getMMDataForSevenDaysChart);

module.exports = mmRouter;