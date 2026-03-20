'use strict';

const User = require('../models/User');
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
      totalInventory,
      totalShopping,
      totalActivity,
      newUsersToday,
    ] = await Promise.all([
      User.countDocuments(),
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
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    // Attach inventory count per user
    const inventoryCounts = await InventoryItem.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const invMap = Object.fromEntries(inventoryCounts.map(c => [String(c._id), c.count]));

    const enriched = users.map(u => ({
      ...u,
      inventoryCount: invMap[String(u._id)] ?? 0,
    }));

    return sendSuccess(res, 200, 'Users fetched.', {
      users: enriched,
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
      action: 'admin_user_deleted',
      description: `Admin deleted user "${user.email}".`,
    });

    return sendSuccess(res, 200, 'User deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getUsers, updateUser, deleteUser };
