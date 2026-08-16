const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');

router.get('/', dishController.getDishes);
router.post('/', dishController.createDish);
router.put('/:id', dishController.updateDish);
router.patch('/:id/toggle', dishController.toggleDishActive);
router.delete('/:id', dishController.deleteDish);

module.exports = router;
