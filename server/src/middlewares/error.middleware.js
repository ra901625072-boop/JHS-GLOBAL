import { ZodError } from 'zod';
import logger from '../utils/logger.js';
import { errorResponse } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, _next) => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    logger.warn(`Validation failed [${req.method} ${req.originalUrl}]: ${details.map((d) => `${d.field}: ${d.message}`).join(', ')}`);
    return errorResponse(res, 'Validation failed', 422, 'VALIDATION_ERROR', details);
  }

  // Log client vs server errors
  if ((err.status && err.status < 500) || (err.statusCode && err.statusCode < 500)) {
    logger.warn(`Client Error [${req.method} ${req.originalUrl}]: ${err.message}`);
  } else {
    logger.error(err, `Server Error [${req.method} ${req.originalUrl}]`);
  }

  // Handle Sequelize ValidationError
  if (err.name === 'SequelizeValidationError') {
    const details = (err.errors || []).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return errorResponse(res, 'Database validation error', 422, 'VALIDATION_ERROR', details);
  }

  // Handle Sequelize UniqueConstraintError (PostgreSQL 23505)
  if (err.name === 'SequelizeUniqueConstraintError' || err.parent?.code === '23505') {
    const field = err.errors?.[0]?.path || 'field';
    return errorResponse(res, `Duplicate value for ${field}. Must be unique.`, 409, 'DUPLICATE_KEY');
  }

  // Handle Foreign Key Constraint Error (PostgreSQL 23503)
  if (err.name === 'SequelizeForeignKeyConstraintError' || err.parent?.code === '23503') {
    return errorResponse(res, 'Referenced parent record does not exist or has dependent child records.', 409, 'FOREIGN_KEY_VIOLATION');
  }

  // Handle PostgreSQL DatabaseError (invalid syntax, 22P02 invalid integer/uuid)
  if (err.name === 'SequelizeDatabaseError' && err.parent?.code === '22P02') {
    return errorResponse(res, 'Invalid identifier syntax or data type.', 400, 'INVALID_ID');
  }

  // Handle JSON parse error in body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Invalid JSON body syntax', 400, 'BAD_REQUEST');
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error occurred'
    : err.message || 'Internal server error';

  return errorResponse(res, message, statusCode, err.code || 'INTERNAL_ERROR');
};

export default errorHandler;
