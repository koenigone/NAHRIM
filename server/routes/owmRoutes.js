const express = require('express');
const owmRouter = express.Router();
const owmController = require('../controllers/owmController');

owmRouter.post('/insertOWMData', owmController.fetchAndInsertOWMData);
owmRouter.get('/owmDailyData', owmController.getOWMDataForToday);
owmRouter.get('/owmWeeklyData', owmController.getOWMDataForSevenDaysChart);
owmRouter.get('/owmMapData', owmController.getOWMDataForMap);

module.exports = owmRouter;