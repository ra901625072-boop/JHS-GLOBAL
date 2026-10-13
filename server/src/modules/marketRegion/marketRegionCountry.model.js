import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const MarketRegionCountry = sequelize.define(
  'MarketRegionCountry',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    marketRegionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'market_region_id',
      references: {
        model: 'market_regions',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(10),
      defaultValue: '',
    },
    flag: {
      type: DataTypes.STRING(50),
      defaultValue: '',
    },
    ports: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
  },
  {
    tableName: 'market_region_countries',
    timestamps: false,
    underscored: true,
  }
);

export default MarketRegionCountry;
