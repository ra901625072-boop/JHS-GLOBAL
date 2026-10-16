import { Op } from 'sequelize';
import Product from './product.model.js';
import Category from '../category/category.model.js';
import Certificate from '../certificate/certificate.model.js';
import createSlug from '../../utils/slugify.js';
import { getPagination, formatPaginationMeta } from '../../utils/pagination.js';

export const productService = {
  /**
   * List products with pagination and filters
   */
  async listProducts(filters = {}) {
    const { page, limit, offset } = getPagination(filters);
    const where = { isActive: true };

    // Filter by Category (slug or ID)
    if (filters.category) {
      let categoryId = parseInt(filters.category, 10);
      if (isNaN(categoryId)) {
        const foundCat = await Category.findOne({
          where: {
            [Op.or]: [{ slug: filters.category }, { name: filters.category }],
            isActive: true,
          },
        });
        if (foundCat) {
          categoryId = foundCat.id;
        } else {
          return {
            items: [],
            meta: formatPaginationMeta(0, page, limit),
          };
        }
      }
      where.categoryId = categoryId;
    }

    // Filter by Sub-category
    if (filters.sub) {
      let subId = parseInt(filters.sub, 10);
      if (isNaN(subId)) {
        const foundSub = await Category.findOne({
          where: { slug: filters.sub, isActive: true },
        });
        if (foundSub) {
          subId = foundSub.id;
        }
      }
      if (subId) {
        where.subCategoryId = subId;
      }
    }

    // Filter by Form
    if (filters.form) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(
        Product.sequelize.where(
          Product.sequelize.cast(Product.sequelize.col('Product.forms'), 'text'),
          { [Op.iLike]: `%${filters.form.trim()}%` }
        )
      );
    }

    // Filter by Origin
    if (filters.origin) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(
        Product.sequelize.where(
          Product.sequelize.cast(Product.sequelize.col('Product.origin'), 'text'),
          { [Op.iLike]: `%${filters.origin.trim()}%` }
        )
      );
    }

    // Filter by Featured flag
    if (filters.isFeatured === 'true' || filters.isFeatured === true) {
      where.isFeatured = true;
    }

    // Search query
    if (filters.q && filters.q.trim()) {
      const searchTerm = filters.q.trim();
      where[Op.or] = [
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { hsCode: { [Op.iLike]: `%${searchTerm}%` } },
        { shortDescription: { [Op.iLike]: `%${searchTerm}%` } },
        { botanicalName: { [Op.iLike]: `%${searchTerm}%` } },
        Product.sequelize.where(
          Product.sequelize.cast(Product.sequelize.col('Product.tags'), 'text'),
          { [Op.iLike]: `%${searchTerm}%` }
        ),
      ];
    }

    // Sort order
    let order = [['createdAt', 'DESC']];
    if (filters.sort) {
      if (filters.sort === 'name') order = [['name', 'ASC']];
      else if (filters.sort === '-name') order = [['name', 'DESC']];
      else if (filters.sort === 'views') order = [['viewCount', 'DESC']];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      attributes: [
        'id',
        'name',
        'slug',
        'hsCode',
        'shortDescription',
        'images',
        'origin',
        'forms',
        'grades',
        'packing',
        'moq',
        'shelfLife',
        'incoterms',
        'isFeatured',
        'categoryId',
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order,
      limit,
      offset,
      distinct: true,
    });

    const items = rows.map((r) => {
      const plain = r.toJSON();
      return {
        ...plain,
        _id: plain.id,
      };
    });

    return {
      items,
      meta: formatPaginationMeta(count, page, limit),
    };
  },

  /**
   * Get featured products for Home Page
   */
  async getFeaturedProducts(limit = 8) {
    const products = await Product.findAll({
      where: { isActive: true, isFeatured: true },
      attributes: [
        'id',
        'name',
        'slug',
        'hsCode',
        'shortDescription',
        'images',
        'origin',
        'forms',
        'packing',
        'moq',
        'incoterms',
        'categoryId',
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      limit,
    });

    return products.map((p) => {
      const plain = p.toJSON();
      return { ...plain, _id: plain.id };
    });
  },

  /**
   * Get product detail by slug with view counter
   */
  async getProductBySlug(slug) {
    const product = await Product.findOne({
      where: { slug, isActive: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'description', 'hsChapter'],
        },
        {
          model: Category,
          as: 'subCategory',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    if (!product) return null;

    // Asynchronously increment view count without blocking read response
    setImmediate(() => {
      product.increment('viewCount', { by: 1 }).catch(() => {});
    });

    const plain = product.toJSON();
    plain._id = plain.id;

    // Fetch associated certificates if any
    if (plain.certificateIds && Array.isArray(plain.certificateIds) && plain.certificateIds.length > 0) {
      const certIds = plain.certificateIds.filter((id) => !isNaN(parseInt(id, 10)));
      if (certIds.length > 0) {
        const certs = await Certificate.findAll({
          where: { id: { [Op.in]: certIds } },
          attributes: ['id', 'name', 'fullName', 'number', 'file', 'logo', 'scope'],
        });
        plain.certificates = certs.map((c) => c.toJSON());
      }
    } else {
      plain.certificates = [];
    }

    return plain;
  },

  /**
   * Get related products in the same category
   */
  async getRelatedProducts(slug, limit = 4) {
    const current = await Product.findOne({
      where: { slug, isActive: true },
      attributes: ['id', 'categoryId'],
    });

    if (!current) return [];

    const products = await Product.findAll({
      where: {
        categoryId: current.categoryId,
        slug: { [Op.ne]: slug },
        isActive: true,
      },
      attributes: ['id', 'name', 'slug', 'hsCode', 'shortDescription', 'images', 'packing', 'moq'],
      limit,
    });

    return products.map((p) => {
      const plain = p.toJSON();
      return { ...plain, _id: plain.id };
    });
  },

  /**
   * Autocomplete search suggestions
   */
  async searchSuggestions(q) {
    if (!q || q.trim().length === 0) return [];

    const searchTerm = q.trim();
    const products = await Product.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { hsCode: { [Op.iLike]: `%${searchTerm}%` } },
          Product.sequelize.where(
            Product.sequelize.cast(Product.sequelize.col('Product.tags'), 'text'),
            { [Op.iLike]: `%${searchTerm}%` }
          ),
        ],
      },
      attributes: ['id', 'name', 'slug', 'hsCode'],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      limit: 8,
    });

    return products.map((p) => ({
      id: p.id,
      _id: p.id,
      name: p.name,
      slug: p.slug,
      hsCode: p.hsCode,
      categoryName: p.category?.name || '',
    }));
  },

  /**
   * Create Product (Admin / Seed)
   */
  async createProduct(data) {
    const slug = data.slug || createSlug(data.name);
    const product = await Product.create({
      ...data,
      slug,
    });

    setImmediate(async () => {
      try {
        const { syncProductEmbedding } = await import('../ai/rag/embedding.service.js');
        await syncProductEmbedding(product);
      } catch (err) {
        // Non-blocking background sync error
      }
    });

    return product;
  },

  /**
   * Soft delete
   */
  async softDeleteProduct(id) {
    await Product.update({ isActive: false }, { where: { id } });
    return await Product.findByPk(id);
  },
};

export default productService;
