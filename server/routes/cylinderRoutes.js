const express = require('express');
const router = express.Router();
const cylinderController = require('../controllers/cylinderController');

router.get('/current', cylinderController.getCurrentCylinder);
router.get('/history', cylinderController.getCylinderHistory);
router.post('/connect', cylinderController.connectNewCylinder);
router.put('/:id', cylinderController.updateCylinder);
router.delete('/:id', cylinderController.deleteCylinder);

module.exports = router;
