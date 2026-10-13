import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';
import { BUYER_TYPES } from '../../config/constants.js';

export const Customer = sequelize.define(
  'Customer',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    companyName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'company_name',
    },
    contactPerson: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'contact_person',
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      set(val) {
        if (val) this.setDataValue('email', val.trim().toLowerCase());
      },
    },
    phone: {
      type: DataTypes.STRING(50),
      defaultValue: '',
    },
    whatsapp: {
      type: DataTypes.STRING(50),
      defaultValue: '',
    },
    website: {
      type: DataTypes.STRING(255),
      defaultValue: '',
    },
    businessType: {
      type: DataTypes.STRING(50),
      defaultValue: 'importer',
      field: 'business_type',
    },
    interestedProducts: {
      type: DataTypes.JSONB,
      defaultValue: [],
      field: 'interested_products',
    },
    totalOrderValue: {
      type: DataTypes.DECIMAL(14, 2),
      defaultValue: 0,
      field: 'total_order_value',
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD',
    },
    preferredPort: {
      type: DataTypes.STRING(150),
      defaultValue: '',
      field: 'preferred_port',
    },
    preferredIncoterm: {
      type: DataTypes.STRING(20),
      defaultValue: 'CIF',
      field: 'preferred_incoterm',
    },
    paymentTerms: {
      type: DataTypes.STRING(200),
      defaultValue: '30% Advance TT',
      field: 'payment_terms',
    },
    shippingPreference: {
      type: DataTypes.STRING(100),
      defaultValue: 'FCL Standard 20ft',
      field: 'shipping_preference',
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
    lastContactDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'last_contact_date',
    },
    notes: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
  },
  {
    tableName: 'customers',
    timestamps: true,
    underscored: true,
  }
);

export default Customer;
