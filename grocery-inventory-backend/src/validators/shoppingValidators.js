'use strict';

const { body } = require('express-validator');

const shoppingItemValidator = [
  body('itemName')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ min: 1, max: 150 }).withMessage('Item name must be between 1 and 150 characters'),

  body('quantityNeeded')
    .notEmpty().withMessage('Quantity needed is required')
    .isFloat({ min: 1 }).withMessage('Quantity must be at least 1'),

  body('unit')
    .optional()
    .trim(),

  body('categoryId')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid category ID'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Notes cannot exceed 300 characters'),
];

const updateShoppingItemValidator = [
  body('status')
    .optional()
    .isIn(['pending', 'purchased']).withMessage('Status must be pending or purchased'),

  body('quantityNeeded')
    .optional()
    .isFloat({ min: 1 }).withMessage('Quantity must be at least 1'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
];

module.exports = { shoppingItemValidator, updateShoppingItemValidator };
