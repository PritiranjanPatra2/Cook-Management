const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/month', reportController.getMonthReport);
router.get('/day', reportController.getDayReport);
router.get('/week', reportController.getWeekReport);
router.get('/food-analysis', reportController.getFoodAnalysis);

module.exports = router;
