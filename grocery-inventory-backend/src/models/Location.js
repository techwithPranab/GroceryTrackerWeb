'use strict';

const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Location name must be at least 2 characters'],
      maxlength: [50, 'Location name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Global unique index on name (locations are shared across all users)
locationSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Location', locationSchema);
