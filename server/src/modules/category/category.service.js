import Category from './category.model.js';
import createSlug from '../../utils/slugify.js';

export const categoryService = {
  /**
   * Returns active categories structured as a tree (level 1 with children)
   */
  async getCategoryTree() {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [
        ['order', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    const plainCategories = categories.map((cat) => cat.toJSON());
    const topLevel = plainCategories.filter((cat) => !cat.parentId || cat.level === 1);
    const subCategories = plainCategories.filter((cat) => cat.parentId);

    return topLevel.map((parent) => ({
      ...parent,
      children: subCategories.filter(
        (sub) => sub.parentId && String(sub.parentId) === String(parent.id)
      ),
    }));
  },

  /**
   * Find single category by slug, including its sub-categories
   */
  async getCategoryBySlug(slug) {
    const category = await Category.findOne({
      where: { slug, isActive: true },
    });
    if (!category) return null;

    const children = await Category.findAll({
      where: { parentId: category.id, isActive: true },
      order: [
        ['order', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    let parent = null;
    if (category.parentId) {
      parent = await Category.findByPk(category.parentId, {
        attributes: ['id', 'name', 'slug'],
      });
    }

    return {
      ...category.toJSON(),
      parent: parent ? parent.toJSON() : null,
      children: children.map((c) => c.toJSON()),
    };
  },

  /**
   * Create new category (Admin)
   */
  async createCategory(data) {
    const slug = data.slug || createSlug(data.name);
    return await Category.create({
      ...data,
      slug,
    });
  },

  /**
   * Soft delete category
   */
  async softDeleteCategory(id) {
    await Category.update({ isActive: false }, { where: { id } });
    return await Category.findByPk(id);
  },
};

export default categoryService;
