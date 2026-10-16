import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    userName: {
      type: DataTypes.STRING(100),
      defaultValue: 'System / Guest',
      field: 'user_name',
    },
    userRole: {
      type: DataTypes.STRING(30),
      defaultValue: 'system',
      field: 'user_role',
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'entity_type',
    },
    entityId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'entity_id',
    },
    beforeSnapshot: {
      type: DataTypes.JSONB,
      defaultValue: null,
      field: 'before_snapshot',
    },
    afterSnapshot: {
      type: DataTypes.JSONB,
      defaultValue: null,
      field: 'after_snapshot',
    },
    ipAddress: {
      type: DataTypes.STRING(100),
      defaultValue: '',
      field: 'ip_address',
    },
    userAgent: {
      type: DataTypes.STRING(255),
      defaultValue: '',
      field: 'user_agent',
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    tableName: 'audit_logs',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['entity_type', 'entity_id'] },
      { fields: ['user_id'] },
      { fields: ['action'] },
      { fields: ['created_at'] },
    ],
  }
);

export default AuditLog;
