'use strict';

const User = require('../models/User');
const Household = require('../models/Household');
const InventoryItem = require('../models/InventoryItem');
const ShoppingListItem = require('../models/ShoppingListItem');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

// ── System Stats ──────────────────────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalHouseholds,
      totalInventory,
      totalShopping,
      totalActivity,
      newUsersToday,
    ] = await Promise.all([
      User.countDocuments(),
      Household.countDocuments(),
      InventoryItem.countDocuments(),
      ShoppingListItem.countDocuments(),
      ActivityLog.countDocuments(),
      User.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    const recentActivity = await ActivityLog.find()
      .populate('userId', 'name email avatarInitials')
      .sort({ createdAt: -1 })
      .limit(10);

    return sendSuccess(res, 200, 'Admin stats fetched.', {
      stats: {
        totalUsers,
        totalHouseholds,
        totalInventory,
        totalShopping,
        totalActivity,
        newUsersToday,
      },
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

// ── Users ─────────────────────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (role) filter.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .populate('householdId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Users fetched.', {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) throw new AppError('User not found.', 404);

    await ActivityLog.create({
      userId: req.user._id,
      householdId: req.user.householdId,
      action: 'admin_user_updated',
      itemId: user._id,
      itemModel: 'User',
      description: `Admin updated user "${user.email}".`,
    });

    return sendSuccess(res, 200, 'User updated.', { user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === String(req.user._id)) {
      throw new AppError('You cannot delete your own account.', 400);
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new AppError('User not found.', 404);

    await ActivityLog.create({
      userId: req.user._id,
      householdId: req.user.householdId,
      action: 'admin_user_deleted',
      description: `Admin deleted user "${user.email}".`,
    });

    return sendSuccess(res, 200, 'User deleted.');
  } catch (error) {
    next(error);
  }
};

// ── Households ────────────────────────────────────────────────────────────────
const getHouseholds = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [households, total] = await Promise.all([
      Household.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Household.countDocuments(filter),
    ]);

    // Attach inventory count per household
    const inventoryCounts = await InventoryItem.aggregate([
      { $group: { _id: '$householdId', count: { $sum: 1 } } },
    ]);
    const invMap = Object.fromEntries(inventoryCounts.map(c => [String(c._id), c.count]));

    const enriched = households.map(h => ({
      ...h,
      inventoryCount: invMap[String(h._id)] ?? 0,
    }));

    return sendSuccess(res, 200, 'Households fetched.', {
      households: enriched,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteHousehold = async (req, res, next) => {
  try {
    const household = await Household.findByIdAndDelete(req.params.id);
    if (!household) throw new AppError('Household not found.', 404);

    await ActivityLog.create({
      userId: req.user._id,
      householdId: req.user.householdId,
      action: 'admin_household_deleted',
      description: `Admin deleted household "${household.name}".`,
    });

    return sendSuccess(res, 200, 'Household deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getUsers, updateUser, deleteUser, getHouseholds, deleteHousehold };
