import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const MarketRegion = sequelize.define(
  'MarketRegion',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    transitDays: {
      type: DataTypes.STRING(100),
      defaultValue: '',
      field: 'transit_days',
    },
    countries: {
      type: DataTypes.JSONB,
      defaultValue: [],
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
    tableName: 'market_regions',
    timestamps: true,
    underscored: true,
  }
);

export default MarketRegion;
