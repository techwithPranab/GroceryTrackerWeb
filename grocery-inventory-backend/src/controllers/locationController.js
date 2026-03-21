'use strict';

const Location = require('../models/Location');
const InventoryItem = require('../models/InventoryItem');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const locations = await Location.find()
      .populate('createdBy', 'name')
      .sort({ name: 1 });

    // Attach per-user item counts
    const userId = req.user._id;
    const counts = await InventoryItem.aggregate([
      { $match: { userId } },
      { $group: { _id: '$locationId', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map(c => [String(c._id), c.count]));

    const enriched = locations.map(loc => ({
      ...loc.toObject(),
      itemCount: countMap[String(loc._id)] ?? 0,
    }));

    return sendSuccess(res, 200, 'Locations fetched.', { locations: enriched });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const location = await Location.create({
      name,
      description,
      createdBy: req.user._id,
    });

    await ActivityLog.create({
      userId: req.user._id,
      action: 'location_created',
      itemId: location._id,
      itemModel: 'Location',
      description: `Created storage location "${location.name}".`,
    });

    return sendSuccess(res, 201, 'Location created.', { location });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!location) throw new AppError('Location not found.', 404);
    return sendSuccess(res, 200, 'Location updated.', { location });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) throw new AppError('Location not found.', 404);
    return sendSuccess(res, 200, 'Location deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
