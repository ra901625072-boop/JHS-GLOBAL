import AuditLog from './auditLog.model.js';
import logger from '../../utils/logger.js';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'refreshtokenhash',
  'secret',
  'apikey',
  'authorization',
  'cookie',
]);

export const sanitizeSnapshot = (data) => {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeSnapshot);

  const clean = {};
  for (const [key, val] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = '[REDACTED]';
    } else if (val && typeof val === 'object') {
      clean[key] = sanitizeSnapshot(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
};

export const recordAuditLog = async ({
  req = null,
  user = null,
  action,
  entityType,
  entityId,
  beforeSnapshot = null,
  afterSnapshot = null,
  metadata = {},
}) => {
  try {
    const activeUser = user || req?.user || null;
    const ipAddress =
      req?.ip ||
      (req?.headers?.['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : '') ||
      '';
    const userAgent = req?.headers?.['user-agent'] || '';

    const logEntry = await AuditLog.create({
      userId: activeUser?.id || null,
      userName: activeUser?.name || 'System / Guest',
      userRole: activeUser?.role || 'system',
      action: String(action).toLowerCase(),
      entityType: String(entityType).toLowerCase(),
      entityId: String(entityId),
      beforeSnapshot: beforeSnapshot ? sanitizeSnapshot(beforeSnapshot) : null,
      afterSnapshot: afterSnapshot ? sanitizeSnapshot(afterSnapshot) : null,
      ipAddress,
      userAgent: userAgent.slice(0, 255),
      metadata: metadata ? sanitizeSnapshot(metadata) : {},
    });

    return logEntry;
  } catch (error) {
    // Audit logging failure should not crash main transaction, but log as high-severity warning
    logger.warn(`[AuditLog] Failed to record audit log: ${error.message}`);
    return null;
  }
};

export const getAuditLogs = async (params = {}) => {
  const page = Math.max(1, parseInt(params.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.limit, 10) || 20));
  const offset = (page - 1) * limit;

  const where = {};
  if (params.entityType) where.entityType = String(params.entityType).toLowerCase();
  if (params.action) where.action = String(params.action).toLowerCase();
  if (params.userId) where.userId = parseInt(params.userId, 10);

  const { rows, count } = await AuditLog.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return {
    logs: rows.map((r) => (r.toJSON ? r.toJSON() : r)),
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit) || 1,
    },
  };
};

export default {
  recordAuditLog,
  sanitizeSnapshot,
  getAuditLogs,
};
