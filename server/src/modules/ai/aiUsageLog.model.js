import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const AiUsageLog = sequelize.define(
  'AiUsageLog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    feature: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING(100),
      defaultValue: 'mock-llm',
    },
    inputTokens: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'input_tokens',
    },
    outputTokens: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'output_tokens',
    },
    latencyMs: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'latency_ms',
    },
    success: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    error: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    costEstimate: {
      type: DataTypes.DECIMAL(10, 4),
      defaultValue: 0,
      field: 'cost_estimate',
    },
    userId: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'user_id',
    },
    ipHash: {
      type: DataTypes.STRING(100),
      defaultValue: '',
      field: 'ip_hash',
    },
    cached: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'ai_usage_logs',
    timestamps: false,
    underscored: true,
  }
);

export default AiUsageLog;
