import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const Testimonial = sequelize.define(
  'Testimonial',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    designation: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    company: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    flag: {
      type: DataTypes.STRING(50),
      defaultValue: '',
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      validate: {
        min: 1,
        max: 5,
      },
    },
    avatar: {
      type: DataTypes.JSONB,
      defaultValue: { url: '' },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'testimonials',
    timestamps: true,
    underscored: true,
  }
);

export default Testimonial;
