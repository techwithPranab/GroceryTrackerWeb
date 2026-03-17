'use strict';

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require authentication + superadmin role
router.use(authenticate);
router.use(authorize('superadmin'));

router.get('/stats',               adminController.getStats);
router.get('/users',               adminController.getUsers);
router.put('/users/:id',           adminController.updateUser);
router.delete('/users/:id',        adminController.deleteUser);
router.get('/households',          adminController.getHouseholds);
router.delete('/households/:id',   adminController.deleteHousehold);

module.exports = router;
