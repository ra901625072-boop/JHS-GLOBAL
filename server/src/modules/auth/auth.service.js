import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import env from '../../config/env.js';
import User from '../user/user.model.js';
import logger from '../../utils/logger.js';

export const generateTokens = (user) => {
  const payload = {
    id: user.id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(
    { id: user.id.toString() },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    }
  );

  return { accessToken, refreshToken };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const user = await User.findOne({
    where: { email: normalizedEmail, isActive: true },
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const { accessToken, refreshToken } = generateTokens(user);

  // Store hashed refresh token in database for rotation/invalidation
  const salt = await bcrypt.genSalt(10);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
  user.lastLoginAt = new Date();
  await user.save();

  logger.info(`User authenticated successfully: ${user.email} (${user.role})`);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLoginAt: user.lastLoginAt,
    },
  };
};

export const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error('Refresh token is required');
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch (err) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findOne({
    where: { id: decoded.id, isActive: true },
  });

  if (!user || !user.refreshTokenHash) {
    const error = new Error('User not found or session terminated');
    error.statusCode = 401;
    throw error;
  }

  const isTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!isTokenValid) {
    const error = new Error('Refresh token has been revoked or rotated');
    error.statusCode = 401;
    throw error;
  }

  // Generate new token pair
  const tokens = generateTokens(user);
  const salt = await bcrypt.genSalt(10);
  user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, salt);
  await user.save();

  return tokens;
};

export const logoutUser = async (userId) => {
  if (!userId) return;
  await User.update({ refreshTokenHash: null }, { where: { id: userId } });
  logger.info(`User logged out: ${userId}`);
};

export const getCurrentUser = async (userId) => {
  const user = await User.findOne({
    where: { id: userId, isActive: true },
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.id,
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    lastLoginAt: user.lastLoginAt,
  };
};

export default {
  generateTokens,
  loginUser,
  refreshUserToken,
  logoutUser,
  getCurrentUser,
};
