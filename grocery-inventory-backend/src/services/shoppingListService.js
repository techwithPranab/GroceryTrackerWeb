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

/**
 * Return purchased items grouped by calendar date (purchasedAt), paginated.
 * Each group: { date: 'YYYY-MM-DD', items: [...] }
 */
const getPurchaseHistory = async (userId, query = {}) => {
  const { page = 1, limit = 10, search = '' } = query;
  const pageNum  = parseInt(page,  10);
  const limitNum = parseInt(limit, 10);

  const filter = { userId, status: 'purchased', purchasedAt: { $ne: null } };
  if (search) filter.itemName = { $regex: search, $options: 'i' };

  // Get unique purchase dates (truncated to day) descending
  const datePipeline = [
    { $match: filter },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$purchasedAt' },
        },
      },
    },
    { $sort: { _id: -1 } },
    { $count: 'total' },
  ];
  const [{ total: totalDates = 0 } = {}] = await ShoppingListItem.aggregate(datePipeline);

  const datesPipeline = [
    { $match: filter },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$purchasedAt' } },
      },
    },
    { $sort: { _id: -1 } },
    { $skip: (pageNum - 1) * limitNum },
    { $limit: limitNum },
  ];
  const dates = (await ShoppingListItem.aggregate(datesPipeline)).map((d) => d._id);

  // Fetch all purchased items whose date falls in the paged date list
  const items = await ShoppingListItem.find({
    ...filter,
    $expr: {
      $in: [
        { $dateToString: { format: '%Y-%m-%d', date: '$purchasedAt' } },
        dates,
      ],
    },
  })
    .populate('categoryId', 'name color icon')
    .populate('purchasedBy', 'name avatarInitials')
    .sort({ purchasedAt: -1 });

  // Group by date
  const grouped = dates.map((date) => ({
    date,
    items: items.filter(
      (i) =>
        i.purchasedAt &&
        i.purchasedAt.toISOString().slice(0, 10) === date
    ),
  }));

  return { groups: grouped, totalDates, page: pageNum, limit: limitNum };
};

module.exports = { getAllItems, addItem, updateItem, deleteItem, clearPurchased, getPurchaseHistory };
