import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/appError.js';
import { AppError } from '../utils/appError.js';
import { config } from '../../config/index.js';
import UserModel from '../models/user.model.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedError('Authentication token missing');
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Fetch user to get latest role
    const user = await UserModel.findById(decoded.id).select('-password -refreshToken');
    if (!user) throw new UnauthorizedError('User no longer exists');

    req.user = { id: decoded.id, role: user.role };

    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(
        new AppError({
          statusCode: 403,
          message: `Access denied. Required role(s): ${roles.join(', ')}`,
        })
      );
    }
    next();
  };
};
