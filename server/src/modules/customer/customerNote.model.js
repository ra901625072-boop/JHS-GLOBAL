import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const CustomerNote = sequelize.define(
  'CustomerNote',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'customer_id',
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    by: {
      type: DataTypes.STRING(100),
      defaultValue: 'Sales Desk',
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
    tableName: 'customer_notes',
    timestamps: false,
    underscored: true,
  }
);

export default CustomerNote;
