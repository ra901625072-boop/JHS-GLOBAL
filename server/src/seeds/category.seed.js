import Category from '../modules/category/category.model.js';
import createSlug from '../utils/slugify.js';
import logger from '../utils/logger.js';

export const categoriesData = [
  {
    name: 'Personal Care Raw Materials',
    slug: 'personal-care-raw-materials',
    description:
      'High-purity cosmetic raw materials, functional carrier lipids, surfactants, hydroxy acids, antioxidant vitamins, and micronized mineral clays formulated for personal care, skincare, and toiletry manufacturers.',
    hsChapter: '33',
    level: 1,
    order: 1,
    seo: {
      title: 'Personal Care & Cosmetic Raw Materials Exporter | JHS GLOBAL',
      description:
        'Bulk export of SLES, Castor Oil derivatives, Salicylic Acid, Glycolic Acid, Vitamin E Acetate, Kaolin Clay, and cosmetic extracts for commercial formulators.',
    },
    subCategories: [
      { name: 'Carrier Oils & Specialty Lipids', order: 1 },
      { name: 'Cosmetic Active Extracts', order: 2 },
      { name: 'Surfactants & Cleansing Agents', order: 3 },
      { name: 'Hydroxy Acids & Exfoliating Actives', order: 4 },
      { name: 'Vitamins & Antioxidant Actives', order: 5 },
      { name: 'Functional Clays & Mineral Powders', order: 6 },
    ],
  },
  {
    name: 'Nutraceutical Raw Materials',
    slug: 'nutraceutical-raw-materials',
    description:
      'Standardized botanical phyto-extracts, verified active marker isolates, plant proteins, and functional hydrocolloids for dietary supplement, nutraceutical, and functional nutrition manufacturers.',
    hsChapter: '13',
    level: 1,
    order: 2,
    seo: {
      title: 'Nutraceutical Raw Materials & Botanical Extracts Exporter | JHS GLOBAL',
      description:
        'HPLC-standardized Ashwagandha, Curcumin 95%, Boswellia, Bacopa, Moringa, Amla, Green Tea, Pea Protein Isolate, and Xanthan Gum in bulk container shipments.',
    },
    subCategories: [
      { name: 'Standardized Botanical Extracts', order: 1 },
      { name: 'Plant Proteins & Hydrocolloids', order: 2 },
    ],
  },
  {
    name: 'Animal Feed',
    slug: 'animal-feed',
    description:
      'High-protein de-oiled oilseed meals, solvent-extracted cakes, and customized nutritional premixes for commercial livestock, poultry, swine, and aquaculture feed mill formulations.',
    hsChapter: '23',
    level: 1,
    order: 3,
    seo: {
      title: 'Animal Feed Ingredients, Protein Meals & Premixes Exporter | JHS GLOBAL',
      description:
        'Bulk export of Soybean Meal (DOC), Rapeseed/Mustard Meal, Cottonseed Meal, and feed-grade vitamins & mineral premixes in containerized shipments.',
    },
    subCategories: [
      { name: 'Protein Oilseed Meals', order: 1 },
      { name: 'Nutritional Premixes & Additives', order: 2 },
    ],
  },
];

export const seedCategories = async () => {
  logger.info('Seeding 3 master commercial divisions for JHS GLOBAL...');

  const categoryMap = new Map();

  for (const catData of categoriesData) {
    const parentSlug = catData.slug || createSlug(catData.name);

    let parent = await Category.findOne({ where: { slug: parentSlug } });
    if (!parent) {
      parent = await Category.create({
        name: catData.name,
        slug: parentSlug,
        description: catData.description,
        hsChapter: catData.hsChapter,
        level: 1,
        order: catData.order,
        path: parentSlug,
        isActive: true,
        seo: catData.seo,
      });
      logger.info(`Created category division: ${parent.name}`);
    } else {
      await parent.update({
        name: catData.name,
        description: catData.description,
        hsChapter: catData.hsChapter,
        order: catData.order,
        isActive: true,
        seo: catData.seo,
      });
      logger.info(`Updated category division: ${parent.name}`);
    }

    categoryMap.set(parent.name, parent);
    categoryMap.set(parent.slug, parent);

    if (catData.subCategories && catData.subCategories.length > 0) {
      for (const sub of catData.subCategories) {
        const subSlug = `${parentSlug}-${createSlug(sub.name)}`;
        let subCategory = await Category.findOne({ where: { slug: subSlug } });
        if (!subCategory) {
          subCategory = await Category.create({
            name: sub.name,
            slug: subSlug,
            parentId: parent.id,
            level: 2,
            order: sub.order,
            path: `${parentSlug}/${createSlug(sub.name)}`,
            isActive: true,
          });
          logger.info(`  Created sub-group: ${sub.name} under ${parent.name}`);
        } else {
          await subCategory.update({
            name: sub.name,
            order: sub.order,
            isActive: true,
          });
        }
        categoryMap.set(`${parent.name}::${sub.name}`, subCategory);
        categoryMap.set(sub.name, subCategory);
      }
    }
  }

  logger.info('Categories seeded successfully (3 master divisions, 10 sub-groups)');
  return categoryMap;
};

export default seedCategories;
