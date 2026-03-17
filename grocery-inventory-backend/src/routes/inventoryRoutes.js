'use strict';

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { inventoryItemValidator, updateQuantityValidator } = require('../validators/inventoryValidators');

router.use(authenticate);

/**
 * @route  GET /api/inventory
 * @desc   Get all inventory items (with filters/pagination)
 * @access Private
 */
router.get('/', inventoryController.getAll);

/**
 * @route  GET /api/inventory/expiring
 * @desc   Get expiring items
 * @access Private
 */
router.get('/expiring', inventoryController.getExpiring);

/**
 * @route  GET /api/inventory/:id
 * @desc   Get single item
 * @access Private
 */
router.get('/:id', inventoryController.getById);

/**
 * @route  POST /api/inventory
 * @desc   Add new inventory item
 * @access Private
 */
router.post('/', inventoryItemValidator, validate, inventoryController.create);

/**
 * @route  PUT /api/inventory/:id
 * @desc   Update inventory item
 * @access Private
 */
router.put('/:id', inventoryController.update);

/**
 * @route  PATCH /api/inventory/:id/quantity
 * @desc   Update item quantity
 * @access Private
 */
router.patch('/:id/quantity', updateQuantityValidator, validate, inventoryController.updateQuantity);

/**
 * @route  DELETE /api/inventory/:id
 * @desc   Delete inventory item
 * @access Private
 */
router.delete('/:id', inventoryController.remove);

module.exports = router;
