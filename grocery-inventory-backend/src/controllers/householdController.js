'use strict';

const householdService = require('../services/householdService');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

const createHousehold = async (req, res, next) => {
  try {
    const { name } = req.body;
    const household = await householdService.createHousehold(name, req.user._id);
    return sendSuccess(res, 201, 'Household created.', { household });
  } catch (error) {
    next(error);
  }
};

const getHousehold = async (req, res, next) => {
  try {
    if (!req.user.householdId) {
      // Not an error — user simply hasn't created a household yet
      return sendSuccess(res, 200, 'No household yet.', { household: null });
    }
    const household = await householdService.getHousehold(req.user.householdId);
    return sendSuccess(res, 200, 'Household fetched.', { household });
  } catch (error) {
    next(error);
  }
};

const getMembers = async (req, res, next) => {
  try {
    if (!req.user.householdId) {
      // Not an error — user simply hasn't created a household yet
      return sendSuccess(res, 200, 'No household yet.', { members: [] });
    }
    const members = await householdService.getMembers(req.user.householdId);
    return sendSuccess(res, 200, 'Members fetched.', { members });
  } catch (error) {
    next(error);
  }
};

const inviteMember = async (req, res, next) => {
  try {
    if (!req.user.householdId) {
      throw new AppError('You must belong to a household before inviting members.', 400);
    }
    const { email } = req.body;
    const result = await householdService.inviteMember(
      email,
      req.user.householdId,
      req.user._id
    );
    return sendSuccess(res, 200, result.joined ? 'Member added.' : 'Invitation created.', result);
  } catch (error) {
    next(error);
  }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;
    const household = await householdService.updateMemberRole(
      memberId,
      role,
      req.user.householdId
    );
    return sendSuccess(res, 200, 'Member role updated.', { household });
  } catch (error) {
    next(error);
  }
};

const getActivityLog = async (req, res, next) => {
  try {
    if (!req.user.householdId) {
      throw new AppError('You must belong to a household.', 400);
    }
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [logs, total] = await Promise.all([
      ActivityLog.find({ householdId: req.user.householdId })
        .populate('userId', 'name avatarInitials')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      ActivityLog.countDocuments({ householdId: req.user.householdId }),
    ]);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHousehold,
  getHousehold,
  getMembers,
  inviteMember,
  updateMemberRole,
  getActivityLog,
};
