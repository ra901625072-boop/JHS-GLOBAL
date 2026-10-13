import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const AiChatAuditLog = sequelize.define(
  'AiChatAuditLog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sessionUuid: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'session_uuid',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    intent: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'product_info',
    },
    usedFactIds: {
      type: DataTypes.JSONB,
      defaultValue: [],
      field: 'used_fact_ids',
    },
    confidence: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.85,
    },
    needsHuman: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'needs_human',
    },
    suggestedAction: {
      type: DataTypes.STRING(50),
      defaultValue: 'none',
      field: 'suggested_action',
    },
    pageContext: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'page_context',
    },
    feedbackRating: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'feedback_rating', // 'helpful' | 'unhelpful' | null
    },
    feedbackComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'feedback_comment',
    },
    ipHash: {
      type: DataTypes.STRING(100),
      defaultValue: '',
      field: 'ip_hash',
    },
    isResolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_resolved',
    },
    resolvedNote: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'resolved_note',
    },
  },
  {
    tableName: 'ai_chat_audit_logs',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['intent'] },
      { fields: ['confidence'] },
      { fields: ['needs_human'] },
      { fields: ['feedback_rating'] },
      { fields: ['is_resolved'] },
      { fields: ['created_at'] },
    ],
  }
);

export default AiChatAuditLog;
