const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');

// GET current salary cycle and due status
router.get('/status', salaryController.getSalaryStatus);

// GET salary payment history
router.get('/history', salaryController.getSalaryHistory);

// POST toggle paid status
router.post('/toggle-paid', salaryController.toggleSalaryPaid);

// PUT update salary details
router.put('/:id', salaryController.updateSalaryRecord);

module.exports = router;
