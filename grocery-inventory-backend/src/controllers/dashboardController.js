'use strict';

const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/apiResponse');

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats(req.user._id);
    return sendSuccess(res, 200, 'Dashboard stats fetched.', stats);
  } catch (error) {
    next(error);
  }
};

const getCategoryDistribution = async (req, res, next) => {
  try {
    const data = await dashboardService.getCategoryDistribution(req.user._id);
    return sendSuccess(res, 200, 'Category distribution fetched.', { distribution: data });
  } catch (error) {
    next(error);
  }
};

const getTopItems = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const items = await dashboardService.getTopItems(req.user._id, limit);
    return sendSuccess(res, 200, 'Top items fetched.', { items });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getCategoryDistribution, getTopItems };
