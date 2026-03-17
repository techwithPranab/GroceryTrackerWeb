'use strict';

const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { shoppingItemValidator, updateShoppingItemValidator } = require('../validators/shoppingValidators');

router.use(authenticate);

router.get('/', shoppingListController.getAll);
router.post('/', shoppingItemValidator, validate, shoppingListController.addItem);
router.delete('/clear-purchased', shoppingListController.clearPurchased);
router.put('/:id', updateShoppingItemValidator, validate, shoppingListController.updateItem);
router.delete('/:id', shoppingListController.deleteItem);

module.exports = router;
