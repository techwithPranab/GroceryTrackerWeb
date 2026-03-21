'use strict';

const shoppingListService = require('../services/shoppingListService');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await shoppingListService.getAllItems(
      req.user._id,
      req.query
    );
    return sendPaginated(res, items, page, limit, total);
  } catch (error) {
    next(error);
  }
};

const addItem = async (req, res, next) => {
  try {
    const item = await shoppingListService.addItem(
      req.body,
      req.user._id
    );
    return sendSuccess(res, 201, 'Item added to shopping list.', { item });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await shoppingListService.updateItem(
      req.params.id,
      req.body,
      req.user._id
    );
    return sendSuccess(res, 200, 'Shopping list item updated.', { item });
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    await shoppingListService.deleteItem(req.params.id, req.user._id);
    return sendSuccess(res, 200, 'Item removed from shopping list.');
  } catch (error) {
    next(error);
  }
};

const clearPurchased = async (req, res, next) => {
  try {
    const result = await shoppingListService.clearPurchased(req.user._id);
    return sendSuccess(res, 200, `Cleared ${result.deletedCount} purchased items.`);
  } catch (error) {
    next(error);
  }
};

const getPurchaseHistory = async (req, res, next) => {
  try {
    const data = await shoppingListService.getPurchaseHistory(req.user._id, req.query);
    return sendSuccess(res, 200, 'Purchase history fetched.', data);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, addItem, updateItem, deleteItem, clearPurchased, getPurchaseHistory };
