/**
 * 301 Permanent Redirect Middleware for Decommissioned Legacy URLs
 *
 * Ensures zero broken links and preserves search ranking when external links,
 * bookmarks, or search engine crawlers request legacy category or product URLs.
 */

export const REDIRECT_MAP = {
  // --- Category Redirects ---
  '/categories/spices-and-seasoning': '/categories/nutraceutical-raw-materials',
  '/categories/herbal-powder': '/categories/nutraceutical-raw-materials',
  '/categories/superfoods': '/categories/nutraceutical-raw-materials',
  '/categories/pulses-rice-and-agriculture-commodities': '/products',
  '/categories/fresh-fruit-and-vegetables': '/products',
  '/categories/dehydrated-vegetables-and-fruit': '/products',
  '/categories/others': '/products',

  // --- Sub-Category Redirects ---
  '/categories/whole-spices': '/categories/nutraceutical-raw-materials',
  '/categories/ground-powdered-spices': '/categories/nutraceutical-raw-materials',
  '/categories/spice-blends-flakes': '/categories/nutraceutical-raw-materials',
  '/categories/superfood-seeds-kernels': '/categories/nutraceutical-raw-materials',
  '/categories/superfood-powders-puffs': '/categories/nutraceutical-raw-materials',
  '/categories/basmati-rice-varieties': '/products',
  '/categories/non-basmati-rice-varieties': '/products',
  '/categories/pulses-lentils-flours': '/products',
  '/categories/agro-commodities-sweeteners': '/products',
  '/categories/fresh-vegetables': '/products',
  '/categories/fresh-seasonal-fruits': '/products',
  '/categories/dehydrated-flakes-minced': '/products',
  '/categories/dehydrated-powders-granules': '/products',
  '/categories/dehydrated-fruits': '/products',
  '/categories/natural-honey': '/products',
  '/categories/aseptic-fruit-pulp': '/products',
  '/categories/whole-cut-herbs': '/categories/nutraceutical-raw-materials',
  '/categories/herbal-powders': '/categories/nutraceutical-raw-materials',
  '/categories/tea-bag-cut-tbc': '/categories/nutraceutical-raw-materials',
  '/categories/vegetable-carrier-oils': '/categories/personal-care-raw-materials',
  '/categories/pure-essential-oils': '/categories/personal-care-raw-materials',
  '/categories/specialty-industrial-raw-materials': '/categories/personal-care-raw-materials',
  '/categories/feed-corn-grits': '/categories/animal-feed',
  '/categories/millets-grains-soya-feed': '/categories/animal-feed',
  '/categories/standardized-herbal-extracts': '/categories/nutraceutical-raw-materials',
  '/categories/phyto-active-isolates': '/categories/nutraceutical-raw-materials',

  // --- High-Value Product Redirects ---
  '/products/salem-turmeric-finger': '/products/turmeric-curcumin-extract',
  '/products/alleppey-finger-turmeric': '/products/turmeric-curcumin-extract',
  '/products/curcumin-extract-95': '/products/turmeric-curcumin-extract',
  '/products/ashwagandha-root-extract': '/products/ashwagandha-extract',
  '/products/ashwagandha-root-powder': '/products/ashwagandha-extract',
  '/products/moringa-leaf-powder': '/products/moringa-oleifera-extract',
  '/products/amla-fruit-powder': '/products/amla-extract',
  '/products/brahmi-powder': '/products/bacopa-monnieri-extract',
  '/products/boswellia-serrata': '/products/boswellia-serrata-extract',
  '/products/castor-oil': '/products/castor-oil-and-derivatives',
  '/products/soybean-meal-doc': '/products/soybean-meal',
  '/products/de-oiled-rice-bran': '/products/soybean-meal',
  '/products/yellow-maize-corn': '/products/soybean-meal',
  '/products/psyllium-husk-99': '/products/xanthan-gum',
  '/products/psyllium-husk-powder': '/products/xanthan-gum',
  '/products/guar-gum-powder': '/products/xanthan-gum',
  '/products/kaolin-clay': '/products/kaolin-clay-powder',
  '/products/vitamin-e': '/products/vitamin-e-acetate',
};

export const redirectLegacyUrlsMiddleware = (req, res, next) => {
  // Normalize path without trailing slash or query
  const cleanPath = req.path.replace(/\/+$/, '');
  const destination = REDIRECT_MAP[cleanPath];

  if (destination) {
    const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    return res.redirect(301, `${destination}${query}`);
  }

  // Handle /api/v1/products/:legacySlug not-found scenario
  if (req.path.startsWith('/api/v1/products/')) {
    const slug = req.path.replace('/api/v1/products/', '').replace(/\/+$/, '');
    const mapped = REDIRECT_MAP[`/products/${slug}`];
    if (mapped) {
      const targetSlug = mapped.replace('/products/', '');
      req.url = `/api/v1/products/${targetSlug}`;
      req.params = { ...req.params, slug: targetSlug };
    }
  }

  // Handle /api/v1/categories/:legacySlug scenario
  if (req.path.startsWith('/api/v1/categories/')) {
    const slug = req.path.replace('/api/v1/categories/', '').replace(/\/+$/, '');
    const mapped = REDIRECT_MAP[`/categories/${slug}`];
    if (mapped && mapped.startsWith('/categories/')) {
      const targetSlug = mapped.replace('/categories/', '');
      req.url = `/api/v1/categories/${targetSlug}`;
      req.params = { ...req.params, slug: targetSlug };
    }
  }

  next();
};

export default redirectLegacyUrlsMiddleware;
