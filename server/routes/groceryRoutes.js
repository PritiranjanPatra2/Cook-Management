const express = require('express');
const router = express.Router();
const groceryController = require('../controllers/groceryController');

router.get('/', groceryController.getGroceries);
router.get('/what-can-we-make', groceryController.whatCanWeMake);
router.post('/', groceryController.createGrocery);
router.put('/:id', groceryController.updateGrocery);
router.patch('/:id/toggle', groceryController.toggleGroceryStatus);
router.delete('/:id', groceryController.deleteGrocery);

module.exports = router;
