import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';
import createSlug from '../../utils/slugify.js';

export const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    parentId: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'parent_id',
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 3,
      },
    },
    path: {
      type: DataTypes.STRING(255),
      defaultValue: '',
    },
    image: {
      type: DataTypes.JSONB,
      defaultValue: { url: '', alt: '' },
    },
    icon: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    hsChapter: {
      type: DataTypes.STRING(10),
      defaultValue: '',
      field: 'hs_chapter',
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
    seo: {
      type: DataTypes.JSONB,
      defaultValue: { title: '', description: '' },
    },
  },
  {
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['slug'],
        unique: true,
      },
      {
        name: 'idx_categories_is_active_parent_id_order',
        fields: ['is_active', 'parent_id', 'order'],
      },
    ],
    hooks: {
      beforeValidate: (cat) => {
        if (cat.name && !cat.slug) {
          cat.slug = createSlug(cat.name);
        }
      },
    },
  }
);

// Self-referencing hierarchy
Category.hasMany(Category, { as: 'children', foreignKey: 'parent_id' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id' });

export default Category;
