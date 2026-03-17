'use strict';

const InventoryItem = require('../models/InventoryItem');
const ShoppingListItem = require('../models/ShoppingListItem');
const ActivityLog = require('../models/ActivityLog');
const Category = require('../models/Category');

const getStats = async (householdId) => {
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
    InventoryItem.countDocuments({ householdId }),
    InventoryItem.countDocuments({
      householdId,
      $expr: { $lte: ['$quantity', '$minimumThreshold'] },
    }),
    InventoryItem.countDocuments({
      householdId,
      expirationDate: { $ne: null, $lt: now },
    }),
    InventoryItem.countDocuments({
      householdId,
      expirationDate: { $ne: null, $gte: now, $lte: threeDays },
    }),
    InventoryItem.countDocuments({
      householdId,
      expirationDate: { $ne: null, $gte: now, $lte: sevenDays },
    }),
    ShoppingListItem.countDocuments({ householdId, status: 'pending' }),
    ShoppingListItem.countDocuments({ householdId, status: 'purchased' }),
    ActivityLog.find({ householdId })
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

const getCategoryDistribution = async (householdId) => {
  const distribution = await InventoryItem.aggregate([
    { $match: { householdId: require('mongoose').Types.ObjectId.createFromHexString(householdId.toString()) } },
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

const getTopItems = async (householdId, limit = 10) => {
  const items = await ActivityLog.aggregate([
    {
      $match: {
        householdId: require('mongoose').Types.ObjectId.createFromHexString(householdId.toString()),
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

module.exports = { getStats, getCategoryDistribution, getTopItems };
