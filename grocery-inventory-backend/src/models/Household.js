'use strict';

const mongoose = require('mongoose');

const householdSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Household name is required'],
      trim: true,
      minlength: [2, 'Household name must be at least 2 characters'],
      maxlength: [100, 'Household name cannot exceed 100 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    inviteCodes: [
      {
        code: { type: String, required: true },
        email: { type: String, required: true, lowercase: true },
        expiresAt: { type: Date, required: true },
        used: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

householdSchema.virtual('memberCount').get(function () {
  return Array.isArray(this.members) ? this.members.length : 0;
});

module.exports = mongoose.model('Household', householdSchema);
