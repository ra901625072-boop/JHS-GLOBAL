import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const InquiryNote = sequelize.define(
  'InquiryNote',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    inquiryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'inquiry_id',
      references: {
        model: 'inquiries',
        key: 'id',
      },
    },
    by: {
      type: DataTypes.STRING(100),
      defaultValue: 'System',
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'inquiry_notes',
    timestamps: false,
    underscored: true,
  }
);

export default InquiryNote;
