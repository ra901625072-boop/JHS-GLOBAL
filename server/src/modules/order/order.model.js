import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'order_number',
    },
    quotationId: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'quotation_id',
      references: {
        model: 'quotations',
        key: 'id',
      },
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
    products: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD',
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
    paymentTerms: {
      type: DataTypes.STRING(255),
      defaultValue: '30% Advance TT, 70% against BL copy',
      field: 'payment_terms',
    },
    shippingMethod: {
      type: DataTypes.STRING(50),
      defaultValue: 'Ocean FCL',
      field: 'shipping_method',
    },
    destinationPort: {
      type: DataTypes.STRING(150),
      defaultValue: '',
      field: 'destination_port',
    },
    expectedShipmentDate: {
      type: DataTypes.DATE,
      defaultValue: null,
      field: 'expected_shipment_date',
    },
    orderStatus: {
      type: DataTypes.STRING(50),
      defaultValue: 'confirmed',
      field: 'order_status',
    },
    assignedSalesperson: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'assigned_salesperson',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    shipment: {
      type: DataTypes.JSONB,
      defaultValue: {
        containerNumber: '',
        shippingLine: '',
        portOfLoading: 'Port of loading agreed per order (India)',
        portOfDischarge: '',
        etd: null,
        eta: null,
        billOfLadingNumber: '',
        trackingUrl: '',
        shippingStatus: 'pending',
      },
    },
    documents: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
  },
  {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: async (order) => {
        if (!order.orderNumber) {
          const year = new Date().getFullYear();
          const count = await Order.count();
          order.orderNumber = `ORD-${year}-${String(count + 1).padStart(6, '0')}`;
        }
      },
    },
  }
);

export default Order;
