import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const CompanyFact = sequelize.define(
  'CompanyFact',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['identity', 'contact', 'certifications', 'operations', 'policy', 'quality']],
      },
    },
    factKey: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'fact_key',
    },
    label: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    factValue: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'fact_value',
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'client_document',
    },
    sourceDocument: {
      type: DataTypes.STRING(255),
      defaultValue: '',
      field: 'source_document',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_verified',
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_public',
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'updated_by',
    },
  },
  {
    tableName: 'company_facts',
    timestamps: true,
    underscored: true,
    getterMethods: {
      _id() {
        return this.id;
      },
    },
  }
);

export default CompanyFact;
