import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const InquiryItem = sequelize.define(
  'InquiryItem',
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
    productId: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'id',
      },
    },
    productName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'product_name',
    },
    quantity: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(30),
      defaultValue: 'MT',
    },
    packing: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    form: {
      type: DataTypes.STRING(50),
      defaultValue: '',
    },
    grade: {
      type: DataTypes.STRING(50),
      defaultValue: '',
    },
  },
  {
    tableName: 'inquiry_items',
    timestamps: false,
    underscored: true,
  }
);

export default InquiryItem;
