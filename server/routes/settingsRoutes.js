const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.post('/verify-passcode', settingsController.verifyPasscode);
router.post('/change-passcode', settingsController.changePasscode);
router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);

module.exports = router;
