const express = require('express');
const windyRouter = express.Router();
const windyController = require('../controllers/windyController');

windyRouter.post('/insertWindyData', windyController.fetchAndInsertWindyData);
windyRouter.get('/windyDailyData', windyController.getWindyDataForToday);
windyRouter.get('/windyWeeklyData', windyController.getWindyDataForSevenDaysChart);
windyRouter.get('/windyMapData', windyController.getWindyDataForMap);

module.exports = windyRouter;