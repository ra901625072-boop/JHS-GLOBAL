import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const ProductCertificate = sequelize.define(
  'ProductCertificate',
  {
    productId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'id',
      },
    },
    certificateId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'certificate_id',
      references: {
        model: 'certificates',
        key: 'id',
      },
    },
  },
  {
    tableName: 'product_certificates',
    timestamps: false,
    underscored: true,
  }
);

export default ProductCertificate;
