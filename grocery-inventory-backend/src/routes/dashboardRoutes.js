'use strict';

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/category-distribution', dashboardController.getCategoryDistribution);
router.get('/top-items', dashboardController.getTopItems);

module.exports = router;
