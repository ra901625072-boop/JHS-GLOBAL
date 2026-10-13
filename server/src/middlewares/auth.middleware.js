import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../modules/user/user.model.js';
import { errorResponse } from '../utils/apiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Bearer token missing.', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Access token has expired. Please refresh.', 401);
      }
      return errorResponse(res, 'Invalid access token.', 401);
    }

    const user = await User.findOne({
      where: { id: decoded.id, isActive: true },
      attributes: ['id', 'name', 'email', 'role', 'isActive'],
    });

    if (!user) {
      return errorResponse(res, 'User account is inactive or no longer exists.', 401);
    }

    req.user = {
      id: user.id,
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return next(error);
  }
};

export default authenticate;
