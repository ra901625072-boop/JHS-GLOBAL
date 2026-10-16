import * as auditService from './audit.service.js';
import { successResponse } from '../../utils/apiResponse.js';

export const listAuditLogs = async (req, res, next) => {
  try {
    const result = await auditService.getAuditLogs(req.query);
    return successResponse(res, result.logs, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export default {
  listAuditLogs,
};
