'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Household = require('../models/Household');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpiresIn });
};

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const user = await User.create({ name, email, password });

  await ActivityLog.create({
    userId: user._id,
    householdId: user.householdId || user._id, // temp before household creation
    action: 'user_registered',
    description: `${user.name} registered an account.`,
  });

  const token = generateToken(user._id);
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  if (user.householdId) {
    await ActivityLog.create({
      userId: user._id,
      householdId: user.householdId,
      action: 'user_login',
      description: `${user.name} logged in.`,
    });
  }

  const token = generateToken(user._id);
  return { user, token };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).populate('householdId', 'name');
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

module.exports = { register, login, getProfile, generateToken };
