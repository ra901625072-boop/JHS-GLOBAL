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
    slug: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    showOnHome: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'show_on_home',
    },
    homeOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'home_order',
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
    indexes: [
      {
        fields: ['slug'],
        unique: true,
      },
      {
        fields: ['is_active', 'show_on_home', 'home_order'],
      },
      {
        fields: ['is_active', 'group', 'order'],
      },
    ],
  }
);

export default Faq;
