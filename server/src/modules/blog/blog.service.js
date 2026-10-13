import { Op } from 'sequelize';
import createSlug from '../../utils/slugify.js';
import BlogPost from './blog.model.js';
import logger from '../../utils/logger.js';

export const getPublishedPosts = async ({
  category,
  tag,
  q,
  page = 1,
  limit = 10,
}) => {
  const where = { status: 'published' };

  if (category && category !== 'all') {
    where.category = { [Op.iLike]: `%${category}%` };
  }

  if (tag) {
    where[Op.and] = where[Op.and] || [];
    where[Op.and].push(
      BlogPost.sequelize.literal(`"tags"::text ILIKE '%${tag.replace(/'/g, "''")}%'`)
    );
  }

  if (q && q.trim()) {
    const searchTerm = q.trim().replace(/'/g, "''");
    where[Op.or] = [
      { title: { [Op.iLike]: `%${searchTerm}%` } },
      { excerpt: { [Op.iLike]: `%${searchTerm}%` } },
      { content: { [Op.iLike]: `%${searchTerm}%` } },
      BlogPost.sequelize.literal(`"tags"::text ILIKE '%${searchTerm}%'`),
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  const { count, rows } = await BlogPost.findAndCountAll({
    where,
    order: [['publishedAt', 'DESC']],
    limit: limitNum,
    offset,
    attributes: [
      'id',
      'title',
      'slug',
      'excerpt',
      'coverImage',
      'author',
      'category',
      'tags',
      'publishedAt',
      'readMinutes',
    ],
  });

  return {
    posts: rows.map((r) => r.toJSON()),
    pagination: {
      total: count,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(count / limitNum),
    },
  };
};

export const getPostBySlug = async (slug) => {
  const post = await BlogPost.findOne({
    where: { slug, status: 'published' },
  });

  if (!post) {
    const error = new Error('Article not found');
    error.statusCode = 404;
    throw error;
  }

  // Fetch 3 related articles from same category
  const related = await BlogPost.findAll({
    where: {
      category: post.category,
      slug: { [Op.ne]: slug },
      status: 'published',
    },
    order: [['publishedAt', 'DESC']],
    limit: 3,
    attributes: ['id', 'title', 'slug', 'excerpt', 'coverImage', 'readMinutes', 'publishedAt'],
  });

  return {
    post: post.toJSON(),
    related: related.map((r) => r.toJSON()),
  };
};

export const createPost = async (postData) => {
  const slug = postData.slug || createSlug(postData.title);

  const existing = await BlogPost.findOne({ where: { slug } });
  if (existing) {
    const error = new Error(`Article with slug '${slug}' already exists`);
    error.statusCode = 409;
    throw error;
  }

  const post = await BlogPost.create({
    ...postData,
    slug,
  });

  logger.info(`Blog post created: ${post.title} [${post.slug}]`);
  return post;
};

export const updatePost = async (id, postData) => {
  const post = await BlogPost.findByPk(id);
  if (!post) {
    const error = new Error('Article not found');
    error.statusCode = 404;
    throw error;
  }

  await post.update(postData);
  logger.info(`Blog post updated: ${post.title} [${post.slug}]`);
  return post;
};

export const deletePost = async (id) => {
  const post = await BlogPost.findByPk(id);
  if (!post) {
    const error = new Error('Article not found');
    error.statusCode = 404;
    throw error;
  }

  await post.destroy();
  logger.info(`Blog post deleted: ${post.title}`);
  return post;
};

export default {
  getPublishedPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
};
