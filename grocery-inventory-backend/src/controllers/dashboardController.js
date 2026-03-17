'use strict';

const dashboardService = require('../services/dashboardService');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

const getStats = async (req, res, next) => {
  try {
    if (!req.user.householdId) {
      throw new AppError('You must belong to a household to view dashboard stats.', 400);
    }
    const stats = await dashboardService.getStats(req.user.householdId);
    return sendSuccess(res, 200, 'Dashboard stats fetched.', stats);
  } catch (error) {
    next(error);
  }
};

const getCategoryDistribution = async (req, res, next) => {
  try {
    if (!req.user.householdId) {
      throw new AppError('You must belong to a household.', 400);
    }
    const data = await dashboardService.getCategoryDistribution(req.user.householdId);
    return sendSuccess(res, 200, 'Category distribution fetched.', { distribution: data });
  } catch (error) {
    next(error);
  }
};

const getTopItems = async (req, res, next) => {
  try {
    if (!req.user.householdId) {
      throw new AppError('You must belong to a household.', 400);
    }
    const limit = parseInt(req.query.limit, 10) || 10;
    const items = await dashboardService.getTopItems(req.user.householdId, limit);
    return sendSuccess(res, 200, 'Top items fetched.', { items });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getCategoryDistribution, getTopItems };
