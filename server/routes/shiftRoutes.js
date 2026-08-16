const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');

router.get('/', shiftController.getShifts);
router.post('/', shiftController.createOrUpdateShift);
router.post('/batch', shiftController.batchSaveDayShifts);
router.get('/:id', shiftController.getShiftById);
router.put('/:id', shiftController.updateShiftById);
router.delete('/:id', shiftController.deleteShift);

module.exports = router;
