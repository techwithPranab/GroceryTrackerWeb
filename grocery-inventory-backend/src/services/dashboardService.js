'use strict';

const InventoryItem = require('../models/InventoryItem');
const ShoppingListItem = require('../models/ShoppingListItem');
const ActivityLog = require('../models/ActivityLog');
const Category = require('../models/Category');

const getStats = async (userId) => {
  const now = new Date();
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalInventory,
    lowStockItems,
    expiredItems,
    expiringIn3Days,
    expiringIn7Days,
    pendingShoppingItems,
    purchasedShoppingItems,
    recentActivity,
  ] = await Promise.all([
    InventoryItem.countDocuments({ userId }),
    InventoryItem.countDocuments({
      userId,
      $expr: { $lte: ['$quantity', '$minimumThreshold'] },
    }),
    InventoryItem.countDocuments({
      userId,
      expirationDate: { $ne: null, $lt: now },
    }),
    InventoryItem.countDocuments({
      userId,
      expirationDate: { $ne: null, $gte: now, $lte: threeDays },
    }),
    InventoryItem.countDocuments({
      userId,
      expirationDate: { $ne: null, $gte: now, $lte: sevenDays },
    }),
    ShoppingListItem.countDocuments({ userId, status: 'pending' }),
    ShoppingListItem.countDocuments({ userId, status: 'purchased' }),
    ActivityLog.find({ userId })
      .populate('userId', 'name avatarInitials')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  return {
    totalInventory,
    lowStockItems,
    expiringItems: {
      expired: expiredItems,
      expiringIn3Days,
      expiringIn7Days,
    },
    shoppingList: {
      pending: pendingShoppingItems,
      purchased: purchasedShoppingItems,
      total: pendingShoppingItems + purchasedShoppingItems,
    },
    recentActivity,
  };
};

const getCategoryDistribution = async (userId) => {
  const distribution = await InventoryItem.aggregate([
    { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()) } },
    {
      $group: {
        _id: '$categoryId',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmpty: true } },
    {
      $project: {
        categoryName: { $ifNull: ['$category.name', 'Uncategorized'] },
        color: { $ifNull: ['$category.color', '#6366f1'] },
        count: 1,
        totalQuantity: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);
  return distribution;
};

const getTopItems = async (userId, limit = 10) => {
  const items = await ActivityLog.aggregate([
    {
      $match: {
        userId: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()),
        action: { $in: ['quantity_updated', 'shopping_item_purchased'] },
        itemId: { $ne: null },
      },
    },
    {
      $group: {
        _id: '$itemId',
        activityCount: { $sum: 1 },
      },
    },
    { $sort: { activityCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'inventoryitems',
        localField: '_id',
        foreignField: '_id',
        as: 'item',
      },
    },
    { $unwind: { path: '$item', preserveNullAndEmpty: true } },
    {
      $project: {
        itemName: { $ifNull: ['$item.itemName', 'Unknown Item'] },
        quantity: { $ifNull: ['$item.quantity', 0] },
        unit: { $ifNull: ['$item.unit', 'pcs'] },
        activityCount: 1,
      },
    },
  ]);
  return items;
};

const getActivity = async (userId, page = 1, limit = 30) => {
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    ActivityLog.find({ userId })
      .populate('userId', 'name avatarInitials')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ActivityLog.countDocuments({ userId }),
  ]);
  return { logs, total, page, limit };
};

module.exports = { getStats, getCategoryDistribution, getTopItems, getActivity };
