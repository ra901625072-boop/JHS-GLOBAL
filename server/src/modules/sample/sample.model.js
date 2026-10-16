import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const SampleRequest = sequelize.define(
  'SampleRequest',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    referenceNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'reference_no',
    },
    buyer: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    products: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    shippingAddress: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      field: 'shipping_address',
    },
    courierAccount: {
      type: DataTypes.JSONB,
      defaultValue: { provider: 'DHL', accountNumber: '' },
      field: 'courier_account',
    },
    testingParameters: {
      type: DataTypes.TEXT,
      defaultValue: '',
      field: 'testing_parameters',
    },
    status: {
      type: DataTypes.STRING(30),
      defaultValue: 'new',
    },
    trackingNo: {
      type: DataTypes.STRING(100),
      defaultValue: '',
      field: 'tracking_no',
    },
  },
  {
    tableName: 'sample_requests',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: async (sample) => {
        if (!sample.referenceNo) {
          const year = new Date().getFullYear();
          const prefix = `SMP-${year}-`;
          const candidates = await SampleRequest.findAll({
            where: {
              referenceNo: {
                [Op.like]: `${prefix}%`,
              },
            },
            attributes: ['referenceNo'],
            order: [['referenceNo', 'DESC']],
            limit: 10,
          });
          let seq = 1;
          for (const cand of candidates) {
            const parts = cand.referenceNo.split('-');
            if (parts.length === 3 && !isNaN(parseInt(parts[2], 10))) {
              seq = parseInt(parts[2], 10) + 1;
              break;
            }
          }
          sample.referenceNo = `${prefix}${String(seq).padStart(6, '0')}`;
        }
      },
    },
  }
);

export default SampleRequest;
