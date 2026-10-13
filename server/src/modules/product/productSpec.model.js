import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const ProductSpec = sequelize.define(
  'ProductSpec',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'id',
      },
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(30),
      defaultValue: '',
    },
  },
  {
    tableName: 'product_specs',
    timestamps: true,
    underscored: true,
  }
);

export default ProductSpec;
