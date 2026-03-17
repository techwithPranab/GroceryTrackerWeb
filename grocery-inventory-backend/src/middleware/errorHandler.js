'use strict';

const logger = require('../utils/logger');
const { nodeEnv } = require('../config/env');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message } = err;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join('. ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (statusCode === 500 && nodeEnv !== 'test') {
    logger.error(err.stack || err.message);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(nodeEnv === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
