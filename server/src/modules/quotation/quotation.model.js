import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const Quotation = sequelize.define(
  'Quotation',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quotationNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'quotation_number',
    },
    inquiryId: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'inquiry_id',
      references: {
        model: 'inquiries',
        key: 'id',
      },
    },
    inquiryReference: {
      type: DataTypes.STRING(50),
      defaultValue: '',
      field: 'inquiry_reference',
    },
    customerId: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'customer_id',
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    buyer: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    items: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD',
    },
    subtotal: {
      type: DataTypes.DECIMAL(14, 2),
      defaultValue: 0,
    },
    shippingCharges: {
      type: DataTypes.DECIMAL(14, 2),
      defaultValue: 0,
      field: 'shipping_charges',
    },
    insuranceCharges: {
      type: DataTypes.DECIMAL(14, 2),
      defaultValue: 0,
      field: 'insurance_charges',
    },
    otherCharges: {
      type: DataTypes.DECIMAL(14, 2),
      defaultValue: 0,
      field: 'other_charges',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(14, 2),
      defaultValue: 0,
      field: 'total_amount',
    },
    incoterm: {
      type: DataTypes.STRING(20),
      defaultValue: 'CIF',
    },
    portOfLoading: {
      type: DataTypes.STRING(150),
      defaultValue: 'Port of loading agreed per order (India)',
      field: 'port_of_loading',
    },
    portOfDischarge: {
      type: DataTypes.STRING(150),
      defaultValue: '',
      field: 'port_of_discharge',
    },
    paymentTerms: {
      type: DataTypes.STRING(255),
      defaultValue: '30% Advance TT, 70% against BL copy',
      field: 'payment_terms',
    },
    validityDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'validity_date',
    },
    deliveryTime: {
      type: DataTypes.STRING(100),
      defaultValue: '15-20 business days post order confirmation',
      field: 'delivery_time',
    },
    status: {
      type: DataTypes.STRING(30),
      defaultValue: 'draft',
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'created_by',
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'quotations',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: async (quote) => {
        if (!quote.quotationNumber) {
          const year = new Date().getFullYear();
          const count = await Quotation.count();
          quote.quotationNumber = `QT-${year}-${String(count + 1).padStart(6, '0')}`;
        }
      },
    },
  }
);

export default Quotation;
