/**
 * Client-Side Legacy URL Redirect Mapping
 *
 * Catches direct browser navigations to old product or category routes
 * and transitions to the new URL without broken links or 404s.
 */

export const CLIENT_REDIRECT_MAP = {
  // Category Slugs
  'spices-and-seasoning': '/products?category=nutraceutical-raw-materials',
  'herbal-powder': '/products?category=nutraceutical-raw-materials',
  'superfoods': '/products?category=nutraceutical-raw-materials',
  'pulses-rice-and-agriculture-commodities': '/products',
  'fresh-fruit-and-vegetables': '/products',
  'dehydrated-vegetables-and-fruit': '/products',
  'others': '/products',
  'whole-spices': '/products?category=nutraceutical-raw-materials',
  'ground-powdered-spices': '/products?category=nutraceutical-raw-materials',
  'spice-blends-flakes': '/products?category=nutraceutical-raw-materials',
  'superfood-seeds-kernels': '/products?category=nutraceutical-raw-materials',
  'superfood-powders-puffs': '/products?category=nutraceutical-raw-materials',
  'basmati-rice-varieties': '/products',
  'non-basmati-rice-varieties': '/products',
  'pulses-lentils-flours': '/products',
  'agro-commodities-sweeteners': '/products',
  'fresh-vegetables': '/products',
  'fresh-seasonal-fruits': '/products',
  'dehydrated-flakes-minced': '/products',
  'dehydrated-powders-granules': '/products',
  'dehydrated-fruits': '/products',
  'natural-honey': '/products',
  'aseptic-fruit-pulp': '/products',
  'whole-cut-herbs': '/products?category=nutraceutical-raw-materials',
  'herbal-powders': '/products?category=nutraceutical-raw-materials',
  'tea-bag-cut-tbc': '/products?category=nutraceutical-raw-materials',
  'vegetable-carrier-oils': '/products?category=personal-care-raw-materials',
  'pure-essential-oils': '/products?category=personal-care-raw-materials',
  'specialty-industrial-raw-materials': '/products?category=personal-care-raw-materials',
  'feed-corn-grits': '/products?category=animal-feed',
  'millets-grains-soya-feed': '/products?category=animal-feed',
  'standardized-herbal-extracts': '/products?category=nutraceutical-raw-materials',
  'phyto-active-isolates': '/products?category=nutraceutical-raw-materials',

  // High-Volume Product Slugs
  'salem-turmeric-finger': '/products/turmeric-curcumin-extract',
  'alleppey-finger-turmeric': '/products/turmeric-curcumin-extract',
  'curcumin-extract-95': '/products/turmeric-curcumin-extract',
  'ashwagandha-root-extract': '/products/ashwagandha-extract',
  'ashwagandha-root-powder': '/products/ashwagandha-extract',
  'moringa-leaf-powder': '/products/moringa-oleifera-extract',
  'amla-fruit-powder': '/products/amla-extract',
  'brahmi-powder': '/products/bacopa-monnieri-extract',
  'boswellia-serrata': '/products/boswellia-serrata-extract',
  'castor-oil': '/products/castor-oil-and-derivatives',
  'soybean-meal-doc': '/products/soybean-meal',
  'de-oiled-rice-bran': '/products/soybean-meal',
  'yellow-maize-corn': '/products/soybean-meal',
  'psyllium-husk-99': '/products/xanthan-gum',
  'psyllium-husk-powder': '/products/xanthan-gum',
  'guar-gum-powder': '/products/xanthan-gum',
  'kaolin-clay': '/products/kaolin-clay-powder',
  'vitamin-e': '/products/vitamin-e-acetate',
};

export const getRedirectUrlForSlug = (slug, type = 'product') => {
  if (!slug) return null;
  const mapped = CLIENT_REDIRECT_MAP[slug];
  if (mapped) return mapped;
  return null;
};
