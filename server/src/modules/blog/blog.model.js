import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';
import createSlug from '../../utils/slugify.js';

export const BlogPost = sequelize.define(
  'BlogPost',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(250),
      allowNull: false,
      unique: true,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    coverImage: {
      type: DataTypes.JSONB,
      defaultValue: {
        url: '/images/placeholders/blog-default.jpg',
        alt: 'Indian agricultural export commodity',
      },
      field: 'cover_image',
    },
    author: {
      type: DataTypes.JSONB,
      defaultValue: {
        name: 'Export Quality Desk',
        designation: 'International Trade & QA Specialist',
        avatar: '/images/placeholders/avatar-default.jpg',
      },
    },
    tags: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Export Quality & Compliance',
    },
    status: {
      type: DataTypes.STRING(30),
      defaultValue: 'published',
    },
    publishedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'published_at',
    },
    readMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      field: 'read_minutes',
    },
    seo: {
      type: DataTypes.JSONB,
      defaultValue: { title: '', description: '', keywords: [] },
    },
  },
  {
    tableName: 'blog_posts',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['slug'],
        unique: true,
      },
      {
        name: 'idx_blog_posts_status_published_at',
        fields: ['status', 'published_at'],
      },
    ],
    hooks: {
      beforeValidate: (blog) => {
        if (blog.title && !blog.slug) {
          blog.slug = createSlug(blog.title);
        }
        if (blog.content) {
          const words = blog.content.split(/\s+/).length;
          blog.readMinutes = Math.ceil(words / 200);
        }
      },
    },
  }
);

export default BlogPost;
