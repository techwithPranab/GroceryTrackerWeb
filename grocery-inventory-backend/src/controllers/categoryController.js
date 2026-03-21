'use strict';

const Category = require('../models/Category');
const InventoryItem = require('../models/InventoryItem');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .populate('createdBy', 'name')
      .sort({ name: 1 });

    // Attach per-user item counts
    const userId = req.user._id;
    const counts = await InventoryItem.aggregate([
      { $match: { userId } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map(c => [String(c._id), c.count]));

    const enriched = categories.map(cat => ({
      ...cat.toObject(),
      itemCount: countMap[String(cat._id)] ?? 0,
    }));

    return sendSuccess(res, 200, 'Categories fetched.', { categories: enriched });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, color, icon } = req.body;
    const category = await Category.create({
      name,
      color,
      icon,
      createdBy: req.user._id,
    });

    await ActivityLog.create({
      userId: req.user._id,
      action: 'category_created',
      itemId: category._id,
      itemModel: 'Category',
      description: `Created category "${category.name}".`,
    });

    return sendSuccess(res, 201, 'Category created.', { category });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) throw new AppError('Category not found.', 404);
    return sendSuccess(res, 200, 'Category updated.', { category });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) throw new AppError('Category not found.', 404);
    return sendSuccess(res, 200, 'Category deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
