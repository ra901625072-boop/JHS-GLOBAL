import { errorResponse } from '../utils/apiResponse.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required before checking permissions.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access forbidden: role '${req.user.role}' is not authorized to access this resource. Requires one of: [${allowedRoles.join(', ')}].`,
        403
      );
    }

    next();
  };
};

export default authorize;
