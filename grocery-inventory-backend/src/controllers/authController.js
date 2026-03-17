'use strict';

const authService = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.register({ name, email, password });
    return sendSuccess(res, 201, 'Account created successfully.', { user, token });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });
    return sendSuccess(res, 200, 'Login successful.', { user, token });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    return sendSuccess(res, 200, 'Profile fetched.', { user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    );
    return sendSuccess(res, 200, 'Profile updated.', { user });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const User = require('../models/User');
    const AppError = require('../utils/AppError');

    const user = await User.findById(req.user._id).select('+password');
    if (!user) throw new AppError('User not found.', 404);

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) throw new AppError('Current password is incorrect.', 401);

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 200, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };
