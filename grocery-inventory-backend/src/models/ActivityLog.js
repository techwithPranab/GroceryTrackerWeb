'use strict';

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'inventory_added',
        'inventory_updated',
        'inventory_deleted',
        'quantity_updated',
        'shopping_item_added',
        'shopping_item_purchased',
        'shopping_item_deleted',
        'category_created',
        'location_created',
        'user_login',
        'user_registered',
        'admin_user_updated',
        'admin_user_deleted',
      ],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    itemModel: {
      type: String,
      enum: ['InventoryItem', 'ShoppingListItem', 'Category', 'Location', 'User', null],
      default: null,
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ householdId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
