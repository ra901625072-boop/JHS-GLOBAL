import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const SampleProduct = sequelize.define(
  'SampleProduct',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sampleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'sample_id',
      references: {
        model: 'sample_requests',
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
    qty: {
      type: DataTypes.STRING(50),
      defaultValue: '250g',
    },
  },
  {
    tableName: 'sample_products',
    timestamps: false,
    underscored: true,
  }
);

export default SampleProduct;
