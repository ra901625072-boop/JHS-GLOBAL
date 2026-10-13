import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_id',
      references: {
        model: 'orders',
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
    specification: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    quantity: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(30),
      defaultValue: 'MT',
    },
    unitPrice: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      field: 'unit_price',
    },
    total: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'order_items',
    timestamps: false,
    underscored: true,
  }
);

export default OrderItem;
