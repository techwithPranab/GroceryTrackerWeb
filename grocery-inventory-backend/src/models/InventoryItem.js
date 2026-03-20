'use strict';

const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      minlength: [1, 'Item name must be at least 1 character'],
      maxlength: [150, 'Item name cannot exceed 150 characters'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    unitSize: {
      type: Number,
      min: [0, 'Unit size cannot be negative'],
      default: null,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      enum: ['pcs', 'kg', 'g', 'lbs', 'oz', 'liters', 'ml', 'bottles', 'cans', 'boxes', 'bags', 'packs', 'dozen'],
      default: 'pcs',
    },
    minimumThreshold: {
      type: Number,
      required: [true, 'Minimum threshold is required'],
      min: [0, 'Threshold cannot be negative'],
      default: 1,
    },
    expirationDate: {
      type: Date,
      default: null,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand cannot exceed 100 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: isLowStock
inventoryItemSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.minimumThreshold;
});

// Virtual: totalAmount  (quantity × unitSize, e.g. 3 × 500 = 1500 ml)
inventoryItemSchema.virtual('totalAmount').get(function () {
  if (this.unitSize && this.unitSize > 0) {
    return this.quantity * this.unitSize;
  }
  return null;
});

// Virtual: expiryStatus
inventoryItemSchema.virtual('expiryStatus').get(function () {
  if (!this.expirationDate) return 'none';
  const now = new Date();
  const diffMs = this.expirationDate - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'critical';
  if (diffDays <= 7) return 'warning';
  return 'ok';
});

// Index for fast household queries
inventoryItemSchema.index({ householdId: 1, createdAt: -1 });
inventoryItemSchema.index({ householdId: 1, categoryId: 1 });
inventoryItemSchema.index({ expirationDate: 1 });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
