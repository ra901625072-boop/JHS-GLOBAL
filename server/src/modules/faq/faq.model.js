import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const Faq = sequelize.define(
  'Faq',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    group: {
      type: DataTypes.STRING(100),
      defaultValue: 'MOQ & Ordering',
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    tableName: 'faqs',
    timestamps: true,
    underscored: true,
  }
);

export default Faq;
