import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const ProductPackingOption = sequelize.define(
  'ProductPackingOption',
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
    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    notes: {
      type: DataTypes.STRING(255),
      defaultValue: '',
    },
  },
  {
    tableName: 'product_packing_options',
    timestamps: true,
    underscored: true,
  }
);

export default ProductPackingOption;
