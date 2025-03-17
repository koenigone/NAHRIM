const express = require('express');
const router = express.Router();
const windyController = require('../controllers/windyController');

router.post('/fetch-and-insert', windyController.fetchAndInsertWindyData);
router.get('/windyDailyData', windyController.getWindyDataForToday);
router.get('/windyWeeklyData', windyController.getWindyDataForSevenDaysChart);

module.exports = router;