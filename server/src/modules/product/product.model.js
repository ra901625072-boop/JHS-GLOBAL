import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';
import createSlug from '../../utils/slugify.js';
import Category from '../category/category.model.js';

export const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(250),
      allowNull: false,
      unique: true,
    },
    sku: {
      type: DataTypes.STRING(50),
      defaultValue: '',
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id',
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    subCategoryId: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'sub_category_id',
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    shortDescription: {
      type: DataTypes.TEXT,
      defaultValue: '',
      field: 'short_description',
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    images: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    hsCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'hs_code',
    },
    botanicalName: {
      type: DataTypes.STRING(150),
      defaultValue: '',
      field: 'botanical_name',
    },
    origin: {
      type: DataTypes.JSONB,
      defaultValue: ['India'],
    },
    forms: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    grades: {
      type: DataTypes.JSONB,
      defaultValue: ['Export Quality'],
    },
    specs: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    attributes: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    packing: {
      type: DataTypes.JSONB,
      defaultValue: [{ type: 'PP Bag', size: '25 kg', notes: 'Standard export packaging' }],
    },
    moq: {
      type: DataTypes.JSONB,
      defaultValue: { value: 1, unit: '20ft FCL' },
    },
    shelfLife: {
      type: DataTypes.STRING(100),
      defaultValue: '24 months',
      field: 'shelf_life',
    },
    storage: {
      type: DataTypes.STRING(255),
      defaultValue: 'Store in a cool, dry place away from direct sunlight',
    },
    incoterms: {
      type: DataTypes.JSONB,
      defaultValue: ['FOB', 'CIF', 'CFR'],
    },
    ports: {
      type: DataTypes.JSONB,
      defaultValue: ['Mundra', 'Nhava Sheva (JNPT)'],
    },
    leadTime: {
      type: DataTypes.STRING(100),
      defaultValue: '10–15 business days',
      field: 'lead_time',
    },
    certificateIds: {
      type: DataTypes.JSONB,
      defaultValue: [],
      field: 'certificate_ids',
    },
    tags: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_featured',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified',
    },
    verifiedFields: {
      type: DataTypes.JSONB,
      defaultValue: {
        hsCode: true,
        name: true,
        category: true,
        botanicalName: true,
        origin: false,
        moq: false,
        shelfLife: false,
        leadTime: false,
      },
      field: 'verified_fields',
    },
    isPrivateLabelAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_private_label_available',
    },
    seo: {
      type: DataTypes.JSONB,
      defaultValue: { title: '', description: '', keywords: [] },
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'view_count',
    },
  },
  {
    tableName: 'products',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['slug'],
        unique: true,
      },
      {
        name: 'idx_products_is_active_category_id',
        fields: ['is_active', 'category_id'],
      },
      {
        name: 'idx_products_is_active_sub_category_id',
        fields: ['is_active', 'sub_category_id'],
      },
      {
        name: 'idx_products_is_active_is_featured',
        fields: ['is_active', 'is_featured'],
      },
      {
        name: 'idx_products_is_active_created_at',
        fields: ['is_active', 'created_at'],
      },
      {
        name: 'idx_products_hs_code',
        fields: ['hs_code'],
      },
    ],
    hooks: {
      beforeValidate: (prod) => {
        if (prod.name && !prod.slug) {
          prod.slug = createSlug(prod.name);
        }
      },
    },
  }
);

// Associations with Category
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.belongsTo(Category, { foreignKey: 'sub_category_id', as: 'subCategory' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

export default Product;
