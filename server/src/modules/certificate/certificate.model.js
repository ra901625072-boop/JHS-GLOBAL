import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const Certificate = sequelize.define(
  'Certificate',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING(255),
      defaultValue: '',
      field: 'full_name',
    },
    issuedBy: {
      type: DataTypes.STRING(255),
      defaultValue: '',
      field: 'issued_by',
    },
    number: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    issueDate: {
      type: DataTypes.DATE,
      defaultValue: null,
      field: 'issue_date',
    },
    expiryDate: {
      type: DataTypes.DATE,
      defaultValue: null,
      field: 'expiry_date',
    },
    logo: {
      type: DataTypes.JSONB,
      defaultValue: { url: '' },
    },
    file: {
      type: DataTypes.JSONB,
      defaultValue: { url: '', type: 'pdf' },
    },
    scope: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_public',
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    tableName: 'certificates',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_certificates_is_active_order',
        fields: ['is_active', 'order'],
      },
    ],
  }
);

export default Certificate;
