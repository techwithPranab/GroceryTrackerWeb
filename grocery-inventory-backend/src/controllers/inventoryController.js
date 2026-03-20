'use strict';

const inventoryService = require('../services/inventoryService');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await inventoryService.getAllItems(
      req.user._id,
      req.query
    );
    return sendPaginated(res, items, page, limit, total);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const item = await inventoryService.getItemById(req.params.id, req.user._id);
    return sendSuccess(res, 200, 'Item fetched.', { item });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const item = await inventoryService.createItem(
      req.body,
      req.user._id
    );
    return sendSuccess(res, 201, 'Item added to inventory.', { item });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const item = await inventoryService.updateItem(
      req.params.id,
      req.body,
      req.user._id
    );
    return sendSuccess(res, 200, 'Item updated.', { item });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await inventoryService.deleteItem(req.params.id, req.user._id);
    return sendSuccess(res, 200, 'Item deleted from inventory.');
  } catch (error) {
    next(error);
  }
};

const updateQuantity = async (req, res, next) => {
  try {
    const item = await inventoryService.updateQuantity(
      req.params.id,
      req.body.quantity,
      req.user._id
    );
    return sendSuccess(res, 200, 'Quantity updated.', { item });
  } catch (error) {
    next(error);
  }
};

const getExpiring = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const items = await inventoryService.getExpiringItems(req.user._id, days);
    return sendSuccess(res, 200, `Items expiring in ${days} days.`, { items });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove, updateQuantity, getExpiring };
