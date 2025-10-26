import { logger } from '../utils/logger.js';
import { createErrorResponse } from '../utils/http.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('❌ Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return createErrorResponse(res, 400, 'Validation Error', errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return createErrorResponse(res, 400, `${field} already exists`);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return createErrorResponse(res, 400, 'Invalid ID format');
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return createErrorResponse(res, statusCode, message);
};

export const notFound = (req, res) => {
  return createErrorResponse(res, 404, `Route ${req.originalUrl} not found`);
};
