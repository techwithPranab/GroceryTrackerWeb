'use strict';

const { body } = require('express-validator');

const inventoryItemValidator = [
  body('itemName')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ min: 1, max: 150 }).withMessage('Item name must be between 1 and 150 characters'),

  body('categoryId')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),

  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isFloat({ min: 0 }).withMessage('Quantity must be a non-negative number'),

  body('unitSize')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Unit size must be a non-negative number'),

  body('unit')
    .notEmpty().withMessage('Unit is required')
    .isIn(['pcs', 'kg', 'g', 'lbs', 'oz', 'liters', 'ml', 'bottles', 'cans', 'boxes', 'bags', 'packs', 'dozen'])
    .withMessage('Invalid unit'),

  body('minimumThreshold')
    .notEmpty().withMessage('Minimum threshold is required')
    .isFloat({ min: 0 }).withMessage('Threshold must be a non-negative number'),

  body('expirationDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid expiration date format'),

  body('locationId')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid location ID'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),

  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Brand cannot exceed 100 characters'),
];

const updateQuantityValidator = [
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isFloat({ min: 0 }).withMessage('Quantity must be a non-negative number'),
];

module.exports = { inventoryItemValidator, updateQuantityValidator };
