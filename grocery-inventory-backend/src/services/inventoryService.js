'use strict';

const InventoryItem = require('../models/InventoryItem');
const ShoppingListItem = require('../models/ShoppingListItem');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');

/**
 * Auto-add item to shopping list if quantity < minimumThreshold
 */
const checkAndAutoAddToShoppingList = async (item) => {
  if (item.quantity <= item.minimumThreshold) {
    const alreadyExists = await ShoppingListItem.findOne({
      householdId: item.householdId,
      inventoryItemId: item._id,
      status: 'pending',
    });

    if (!alreadyExists) {
      const unitLabel = item.unitSize ? `${item.unitSize} ${item.unit}` : item.unit;
      await ShoppingListItem.create({
        itemName: item.itemName,
        quantityNeeded: Math.max(1, item.minimumThreshold - item.quantity + 1),
        unitSize: item.unitSize || null,
        unit: item.unit,
        categoryId: item.categoryId,
        householdId: item.householdId,
        addedBy: item.createdBy,
        autoAdded: true,
        inventoryItemId: item._id,
        priority: 'high',
        notes: `Auto-added: stock (${item.quantity} × ${unitLabel}) is at or below threshold (${item.minimumThreshold}).`,
      });
    }
  }
};

const getAllItems = async (householdId, query = {}) => {
  const {
    page = 1,
    limit = 20,
    categoryId,
    locationId,
    search,
    lowStock,
    expiring,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter = { householdId };

  if (categoryId) filter.categoryId = categoryId;
  if (locationId) filter.locationId = locationId;
  if (search) filter.itemName = { $regex: search, $options: 'i' };

  if (lowStock === 'true') {
    filter.$expr = { $lte: ['$quantity', '$minimumThreshold'] };
  }

  if (expiring === 'true') {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    filter.expirationDate = { $ne: null, $lte: sevenDaysFromNow };
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const sortDir = sortOrder === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    InventoryItem.find(filter)
      .populate('categoryId', 'name color icon')
      .populate('locationId', 'name')
      .populate('createdBy', 'name avatarInitials')
      .sort({ [sortBy]: sortDir })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    InventoryItem.countDocuments(filter),
  ]);

  return { items, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
};

const getItemById = async (itemId, householdId) => {
  const item = await InventoryItem.findOne({ _id: itemId, householdId })
    .populate('categoryId', 'name color icon')
    .populate('locationId', 'name')
    .populate('createdBy', 'name avatarInitials');

  if (!item) throw new AppError('Inventory item not found.', 404);
  return item;
};

const createItem = async (data, userId, householdId) => {
  const item = await InventoryItem.create({
    ...data,
    createdBy: userId,
    householdId,
  });

  await ActivityLog.create({
    userId,
    householdId,
    action: 'inventory_added',
    itemId: item._id,
    itemModel: 'InventoryItem',
    description: `Added "${item.itemName}" to inventory.`,
    metadata: { quantity: item.quantity, unitSize: item.unitSize, unit: item.unit },
  });

  // Auto-add to shopping list if needed
  await checkAndAutoAddToShoppingList(item);

  return item.populate([
    { path: 'categoryId', select: 'name color icon' },
    { path: 'locationId', select: 'name' },
  ]);
};

const updateItem = async (itemId, data, userId, householdId) => {
  const item = await InventoryItem.findOne({ _id: itemId, householdId });
  if (!item) throw new AppError('Inventory item not found.', 404);

  Object.assign(item, data);
  await item.save();

  await ActivityLog.create({
    userId,
    householdId,
    action: 'inventory_updated',
    itemId: item._id,
    itemModel: 'InventoryItem',
    description: `Updated "${item.itemName}".`,
  });

  // Re-check shopping list threshold after update
  await checkAndAutoAddToShoppingList(item);

  return item.populate([
    { path: 'categoryId', select: 'name color icon' },
    { path: 'locationId', select: 'name' },
  ]);
};

const deleteItem = async (itemId, userId, householdId) => {
  const item = await InventoryItem.findOneAndDelete({ _id: itemId, householdId });
  if (!item) throw new AppError('Inventory item not found.', 404);

  await ActivityLog.create({
    userId,
    householdId,
    action: 'inventory_deleted',
    itemId: item._id,
    itemModel: 'InventoryItem',
    description: `Deleted "${item.itemName}" from inventory.`,
  });

  return item;
};

const updateQuantity = async (itemId, quantity, userId, householdId) => {
  const item = await InventoryItem.findOne({ _id: itemId, householdId });
  if (!item) throw new AppError('Inventory item not found.', 404);

  const previousQty = item.quantity;
  item.quantity = quantity;
  await item.save();

  await ActivityLog.create({
    userId,
    householdId,
    action: 'quantity_updated',
    itemId: item._id,
    itemModel: 'InventoryItem',
    description: `Updated quantity of "${item.itemName}" from ${previousQty} to ${quantity} ${item.unit}.`,
    metadata: { from: previousQty, to: quantity, unit: item.unit },
  });

  await checkAndAutoAddToShoppingList(item);

  return item;
};

const getExpiringItems = async (householdId, days = 7) => {
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);

  const items = await InventoryItem.find({
    householdId,
    expirationDate: { $ne: null, $lte: threshold },
  })
    .populate('categoryId', 'name color')
    .populate('locationId', 'name')
    .sort({ expirationDate: 1 });

  return items.map((item) => {
    const diffMs = item.expirationDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { ...item.toObject(), daysUntilExpiry: diffDays };
  });
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  updateQuantity,
  getExpiringItems,
  checkAndAutoAddToShoppingList,
};
