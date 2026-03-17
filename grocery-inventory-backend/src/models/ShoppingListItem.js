'use strict';

const mongoose = require('mongoose');

const shoppingListItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      minlength: [1, 'Item name must be at least 1 character'],
      maxlength: [150, 'Item name cannot exceed 150 characters'],
    },
    quantityNeeded: {
      type: Number,
      required: [true, 'Quantity needed is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    unitSize: {
      type: Number,
      min: [0, 'Unit size must be a non-negative number'],
      default: null,
    },
    unit: {
      type: String,
      trim: true,
      default: 'pcs',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'purchased'],
      default: 'pending',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    purchasedAt: {
      type: Date,
      default: null,
    },
    autoAdded: {
      type: Boolean,
      default: false,
    },
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

shoppingListItemSchema.index({ householdId: 1, status: 1 });
shoppingListItemSchema.index({ householdId: 1, createdAt: -1 });

module.exports = mongoose.model('ShoppingListItem', shoppingListItemSchema);
