'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * @route  POST /api/auth/register
 * @desc   Register new user
 * @access Public
 */
router.post('/register', authLimiter, registerValidator, validate, authController.register);

/**
 * @route  POST /api/auth/login
 * @desc   Login user
 * @access Public
 */
router.post('/login', authLimiter, loginValidator, validate, authController.login);

/**
 * @route  GET /api/auth/me
 * @desc   Get current user profile
 * @access Private
 */
router.get('/me', authenticate, authController.getProfile);

/**
 * @route  PUT /api/auth/me
 * @desc   Update profile
 * @access Private
 */
router.put('/me', authenticate, authController.updateProfile);

/**
 * @route  PUT /api/auth/change-password
 * @desc   Change password
 * @access Private
 */
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;
