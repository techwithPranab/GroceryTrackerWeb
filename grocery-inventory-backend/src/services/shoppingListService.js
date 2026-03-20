'use strict';

const ShoppingListItem = require('../models/ShoppingListItem');
const InventoryItem = require('../models/InventoryItem');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');

const getAllItems = async (userId, query = {}) => {
  const { status, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = query;

  const filter = { userId };
  if (status) filter.status = status;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const sortDir = sortOrder === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    ShoppingListItem.find(filter)
      .populate('categoryId', 'name color icon')
      .populate('addedBy', 'name avatarInitials')
      .populate('purchasedBy', 'name avatarInitials')
      .sort({ [sortBy]: sortDir })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    ShoppingListItem.countDocuments(filter),
  ]);

  return { items, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
};

const addItem = async (data, userId) => {
  const item = await ShoppingListItem.create({
    ...data,
    addedBy: userId,
    userId,
  });

  await ActivityLog.create({
    userId,
    action: 'shopping_item_added',
    itemId: item._id,
    itemModel: 'ShoppingListItem',
    description: `Added "${item.itemName}" to shopping list.`,
  });

  return item.populate([
    { path: 'categoryId', select: 'name color icon' },
    { path: 'addedBy', select: 'name avatarInitials' },
  ]);
};

const updateItem = async (itemId, data, userId) => {
  const item = await ShoppingListItem.findOne({ _id: itemId, userId });
  if (!item) throw new AppError('Shopping list item not found.', 404);

  const wasPending = item.status === 'pending';
  Object.assign(item, data);

  if (data.status === 'purchased' && wasPending) {
    item.purchasedBy = userId;
    item.purchasedAt = new Date();

    // Auto-increment inventory quantity for matching item for this user
    const inventoryItem = await InventoryItem.findOne({
      userId,
      itemName: { $regex: new RegExp(`^${item.itemName.trim()}$`, 'i') },
    });
    if (inventoryItem) {
      inventoryItem.quantity += item.quantityNeeded || 1;
      await inventoryItem.save();
    }

    await ActivityLog.create({
      userId,
      action: 'shopping_item_purchased',
      itemId: item._id,
      itemModel: 'ShoppingListItem',
      description: `Marked "${item.itemName}" as purchased.`,
    });
  }

  await item.save();
  return item;
};

const deleteItem = async (itemId, userId) => {
  const item = await ShoppingListItem.findOneAndDelete({ _id: itemId, userId });
  if (!item) throw new AppError('Shopping list item not found.', 404);

  await ActivityLog.create({
    userId,
    action: 'shopping_item_deleted',
    itemId: item._id,
    itemModel: 'ShoppingListItem',
    description: `Removed "${item.itemName}" from shopping list.`,
  });

  return item;
};

const clearPurchased = async (userId) => {
  const result = await ShoppingListItem.deleteMany({ userId, status: 'purchased' });
  return result;
};

module.exports = { getAllItems, addItem, updateItem, deleteItem, clearPurchased };
