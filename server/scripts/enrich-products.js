import connectDB, { sequelize } from '../src/config/db.js';
import Product from '../src/modules/product/product.model.js';
import Category from '../src/modules/category/category.model.js';
import createSlug from '../src/utils/slugify.js';
import logger from '../src/utils/logger.js';

// Image mapping resolver
const resolveProductImage = (name, categoryName) => {
  const n = name.toLowerCase();

  if (n.includes('curcumin')) {
    return '/images/products/curcumin-95-extract.jpg';
  }
  if (n.includes('ashwagandha')) {
    return '/images/products/ashwagandha-extract.jpg';
  }
  if (n.includes('spirulina')) {
    return '/images/products/spirulina-powder.jpg';
  }
  if (n.includes('castor') || n.includes('sesame') || n.includes('carrier oil') || n.includes('vegetable oil')) {
    return '/images/products/vegetable-carrier-oils.jpg';
  }
  if (n.includes('essential oil') || n.includes('lemongrass') || n.includes('peppermint') || n.includes('eucalyptus')) {
    return '/images/products/pure-essential-oils.jpg';
  }
  if (n.includes('guar gum') || n.includes('guargum')) {
    return '/images/products/guar-gum-powder.jpg';
  }
  if (n.includes('isopropyl') || n.includes('chemical') || n.includes('ipa') || n.includes('solvent')) {
    return '/images/products/isopropyl-alcohol-ipa.jpg';
  }
  if (n.includes('corn') || n.includes('maize') || n.includes('grits')) {
    return '/images/products/yellow-corn-maize.jpg';
  }
  if (n.includes('green millet') || n.includes('bajra') || n.includes('millet mix') || n.includes('animal millet')) {
    return '/images/products/green-millet-bajra.jpg';
  }
  if (n.includes('safflower') || n.includes('kardi')) {
    return '/images/products/safflower-seeds.jpg';
  }
  if (n.includes('soybean') || n.includes('soya') || n.includes('doc')) {
    return '/images/products/soybean-meal-doc.jpg';
  }
  if (n.includes('basmati') || n.includes('rice') || n.includes('sella') || n.includes('pusa') || n.includes('ir64')) {
    return '/images/products/basmati-rice-1121.jpg';
  }
  if (n.includes('chickpea') || n.includes('lentil') || n.includes('bean') || n.includes('pulse') || n.includes('besan') || n.includes('atta') || n.includes('flour') || n.includes('peanut')) {
    return '/images/products/chickpeas-kabuli.jpg';
  }
  if (n.includes('black pepper') || n.includes('pepper') || n.includes('piperine') || n.includes('clove') || n.includes('anise')) {
    return '/images/products/black-pepper-tgseb.jpg';
  }
  if (n.includes('cardamom') || n.includes('elaichi') || n.includes('fennel') || n.includes('mustard') || n.includes('ajwain') || n.includes('celery') || n.includes('fenugreek')) {
    return '/images/products/cardamom-green-bold.jpg';
  }
  if (n.includes('cumin') || n.includes('jeera') || n.includes('coriander') || n.includes('dill')) {
    return '/images/products/cumin-seeds.jpg';
  }
  if (n.includes('chilli') || n.includes('chili') || n.includes('paprika')) {
    return '/images/products/sanam-red-chilli.jpg';
  }
  if (n.includes('onion') || n.includes('garlic') || n.includes('ginger') || n.includes('potato') || n.includes('carrot') || n.includes('beetroot') || n.includes('tomato') || n.includes('spinach')) {
    return '/images/products/dehydrated-white-onion.jpg';
  }
  if (n.includes('moringa') || n.includes('green tea') || n.includes('alfalfa') || n.includes('wheatgrass') || n.includes('tulsi') || n.includes('neem') || n.includes('amla')) {
    return '/images/products/moringa-leaf-powder.jpg';
  }
  if (n.includes('psyllium') || n.includes('isabgol') || n.includes('chia') || n.includes('flax') || n.includes('sunflower') || n.includes('quinoa') || n.includes('makhana') || n.includes('black seed') || n.includes('basil seed')) {
    return '/images/products/psyllium-husk.jpg';
  }
  if (n.includes('turmeric') || n.includes('haldi')) {
    return '/images/products/turmeric-finger.jpg';
  }

  // Fallback by category
  if (categoryName === 'Personal Care Raw Materials') return '/images/products/vegetable-carrier-oils.jpg';
  if (categoryName === 'Nutraceutical Raw Materials') return '/images/products/curcumin-95-extract.jpg';
  if (categoryName === 'Animal Feed') return '/images/products/yellow-corn-maize.jpg';
  if (categoryName === 'Herbal Powder') return '/images/products/ashwagandha-extract.jpg';
  if (categoryName === 'Spices and Seasoning') return '/images/products/turmeric-finger.jpg';
  if (categoryName === 'Superfoods') return '/images/products/psyllium-husk.jpg';
  if (categoryName === 'Pulses, Rice & Agriculture Commodities') return '/images/products/basmati-rice-1121.jpg';
  if (categoryName === 'Dehydrated Vegetables & Fruit') return '/images/products/dehydrated-white-onion.jpg';

  return '/images/products/vegetable-carrier-oils.jpg';
};

// Additional high-specification products for the client's 3 key categories
const NEW_PRODUCTS_TO_SEED = [
  // 1. Nutraceutical Raw Materials
  {
    name: 'Curcumin 95% Standardized Extract',
    categoryName: 'Nutraceutical Raw Materials',
    hsCode: '1302.19',
    botanicalName: 'Curcuma longa',
    origin: ['Gujarat', 'Maharashtra', 'Telangana'],
    forms: ['Fine Crystalline Powder', 'Granular', 'Water-Soluble Granules'],
    grades: ['Pharma Grade (HPLC 95%+)', 'Nutraceutical Grade'],
    shortDescription: 'High-purity Curcuminoids (95% Min) extracted from Indian Salem and Nizamabad turmeric rhizomes using clean food-grade ethanol extraction.',
    description: 'Our standardized Curcumin 95% complex contains purified Curcumin, Demethoxycurcumin (DMC), and Bisdemethoxycurcumin (BDMC). Tested via HPLC for active curcuminoids, heavy metal safety (< 1 ppm Pb, As, Cd, Hg), and residual solvents adhering to USP/EP pharmacopoeia standards. Essential for joint health capsules, dietary supplements, and antioxidant formulations.',
    specs: [
      { key: 'Total Curcuminoids (HPLC)', value: '≥ 95.0%', unit: '%' },
      { key: 'Curcumin', value: '70.0% – 80.0%', unit: '%' },
      { key: 'Demethoxycurcumin (DMC)', value: '15.0% – 25.0%', unit: '%' },
      { key: 'Bisdemethoxycurcumin (BDMC)', value: '2.5% – 6.5%', unit: '%' },
      { key: 'Moisture', value: '≤ 1.0%', unit: '%' },
      { key: 'Total Ash', value: '≤ 0.5%', unit: '%' },
      { key: 'Heavy Metals (ICP-MS)', value: '< 10 ppm', unit: 'ppm' },
      { key: 'Residual Solvents (GC)', value: '< 50 ppm (Ethanol only)', unit: 'ppm' }
    ],
    packing: [
      { type: 'Fiber Drum with Double Food-Grade Polyliner', size: '25 kg', notes: 'Vacuum sealed light barrier' },
      { type: 'Aluminum Foil Pouch', size: '1 kg / 5 kg', notes: 'Sample testing pack' }
    ],
    moq: { value: 100, unit: 'kg' },
    shelfLife: '36 months',
    isFeatured: true,
  },
  {
    name: 'Ashwagandha Root Extract (Withanolides 5%)',
    categoryName: 'Nutraceutical Raw Materials',
    hsCode: '1302.19',
    botanicalName: 'Withania somnifera',
    origin: ['Madhya Pradesh', 'Rajasthan', 'Gujarat'],
    forms: ['Fine Dry Powder (80–100 Mesh)', 'Granules for Direct Compression'],
    grades: ['Standardized 5% Withanolides (HPLC)', 'Withanolides 2.5% (Gravimetric)'],
    shortDescription: 'Clinically standardized full-spectrum Ashwagandha root extract guaranteed at ≥ 5.0% Withanolides by HPLC with zero Withaferin A toxicity.',
    description: 'Derived exclusively from prime winter-harvested Withania somnifera roots from Neemuch and Nagaur. Processed through hydro-ethanolic extraction and low-temperature spray drying. Complete batch lab COA covering HPLC withanolide fingerprinting, DNA barcoding authentication, and absence of synthetic adulterants.',
    specs: [
      { key: 'Total Withanolides (HPLC)', value: '≥ 5.0%', unit: '%' },
      { key: 'Withaferin A', value: '< 0.5%', unit: '%' },
      { key: 'Moisture', value: '≤ 5.0%', unit: '%' },
      { key: 'Bulk Density', value: '0.40 – 0.60 g/ml', unit: 'g/ml' },
      { key: 'Mesh Size', value: '100% pass 80 mesh', unit: 'mesh' },
      { key: 'Microbiological Total Plate Count', value: '< 1,000 CFU/g', unit: 'CFU/g' }
    ],
    packing: [
      { type: 'Fiber Drum with Inner Polybag', size: '25 kg', notes: 'Nitrogen-flushed' }
    ],
    moq: { value: 100, unit: 'kg' },
    shelfLife: '36 months',
    isFeatured: true,
  },
  {
    name: 'Pure Organic Spirulina Powder',
    categoryName: 'Nutraceutical Raw Materials',
    hsCode: '1212.21',
    botanicalName: 'Arthrospira platensis',
    origin: ['Tamil Nadu', 'Gujarat'],
    forms: ['Ultra-Fine Powder (120 Mesh)', 'Crushed Flakes', '500mg Pressed Tablets'],
    grades: ['Certified Organic Export Grade', 'Phycocyanin Rich Grade'],
    shortDescription: 'Non-irradiated pure spirulina microalgae powder cultivated in closed sunlit raceway ponds, high in plant protein and C-phycocyanin.',
    description: 'Cultivated under pure alkaline water conditions in pollution-free agro-zones of South India. Solar-dried and low-temperature milled into vibrant deep blue-green powder. Contains ≥ 60% bioavailable complete vegan protein, 18 amino acids, and natural carotenoids. Non-GMO, 100% vegan, pesticide-free.',
    specs: [
      { key: 'Protein (Dry Basis)', value: '≥ 60.0%', unit: '%' },
      { key: 'C-Phycocyanin', value: '≥ 12.0%', unit: '%' },
      { key: 'Chlorophyll', value: '≥ 1.1%', unit: '%' },
      { key: 'Moisture', value: '≤ 6.0%', unit: '%' },
      { key: 'Lead (Pb)', value: '< 0.5 ppm', unit: 'ppm' },
      { key: 'Cadmium (Cd)', value: '< 0.2 ppm', unit: 'ppm' }
    ],
    packing: [
      { type: 'Multiwall Kraft Bag with Foil Barrier', size: '20 kg', notes: 'Double-bagged export packaging' },
      { type: 'Fiber Drum', size: '25 kg', notes: 'Airtight export specification' }
    ],
    moq: { value: 250, unit: 'kg' },
    shelfLife: '24 months',
    isFeatured: true,
  },
  {
    name: 'Boswellia Serrata Extract (Boswellic Acid 65%)',
    categoryName: 'Nutraceutical Raw Materials',
    hsCode: '1302.19',
    botanicalName: 'Boswellia serrata (Shallaki)',
    origin: ['Madhya Pradesh', 'Gujarat'],
    forms: ['Off-White to Cream Fine Powder (80 Mesh)'],
    grades: ['Standardized 65% Total Boswellic Acids', 'AKBA 30% Specialized'],
    shortDescription: 'Standardized Indian Frankincense gum-resin extract with certified 65% Boswellic acids for anti-inflammatory and joint mobility nutraceuticals.',
    description: 'Sourced from the oleo-gum resin of wild Boswellia serrata trees in central India. Extracted and purified to yield consistent bio-active keto-boswellic acids (AKBA, KBA, beta-boswellic acid). Fully compliant with EU and US FDA dietary supplement regulations.',
    specs: [
      { key: 'Total Boswellic Acids (Titration)', value: '≥ 65.0%', unit: '%' },
      { key: 'Moisture', value: '≤ 5.0%', unit: '%' },
      { key: 'Total Ash', value: '≤ 5.0%', unit: '%' },
      { key: 'Heavy Metals', value: '< 10 ppm', unit: 'ppm' }
    ],
    packing: [
      { type: 'Fiber Drum with Food-Grade Liner', size: '25 kg', notes: 'Moisture-proof seal' }
    ],
    moq: { value: 100, unit: 'kg' },
    shelfLife: '36 months',
    isFeatured: false,
  },
  {
    name: 'Piperine 95% Black Pepper Extract',
    categoryName: 'Nutraceutical Raw Materials',
    hsCode: '2939.79',
    botanicalName: 'Piper nigrum',
    origin: ['Kerala', 'Karnataka'],
    forms: ['Pale Yellow to Cream Crystalline Powder'],
    grades: ['Nutraceutical HPLC Grade 95%–98%'],
    shortDescription: 'Patented bioavailability enhancer standardized at ≥ 95% Piperine alkaloid for augmenting gastrointestinal absorption of Curcumin and CoQ10.',
    description: 'Extracted from tellicherry black pepper corns harvested across Malabar and Coorg belts. Clinically recognized thermonutrient that enhances nutrient cellular uptake. HPLC assay verified lot-by-lot.',
    specs: [
      { key: 'Piperine Content (HPLC)', value: '≥ 95.0%', unit: '%' },
      { key: 'Melting Range', value: '128°C – 131°C', unit: '°C' },
      { key: 'Moisture', value: '≤ 1.0%', unit: '%' },
      { key: 'Residual Solvents', value: '< 50 ppm', unit: 'ppm' }
    ],
    packing: [
      { type: 'Foil-Lined Drum', size: '25 kg', notes: 'Airtight pharmaceutical grade drum' }
    ],
    moq: { value: 50, unit: 'kg' },
    shelfLife: '36 months',
    isFeatured: false,
  },

  // 2. Personal Care Raw Materials
  {
    name: 'Virgin Castor Oil (First Special Grade - FSG)',
    categoryName: 'Personal Care Raw Materials',
    hsCode: '1515.30',
    botanicalName: 'Ricinus communis',
    origin: ['Gujarat (Kutch, Saurashtra)', 'Rajasthan'],
    forms: ['Liquid Oil in Drums & IBC Containers', 'Bulk ISO Tanks'],
    grades: ['First Special Grade (FSG)', 'Cold Pressed Pale Pressed (PP)', 'Commercial Grade'],
    shortDescription: 'Clear, pale yellow premium castor oil pressed from selected Gujarat castor seeds, rich in ricinoleic acid (≥ 88%) for cosmetics, lubricants, and polymers.',
    description: 'Gujarat produces over 80% of the world’s castor seed crop. Our FSG Castor Oil is refined through multi-stage neutralization, bleaching, and de-odorization. High hydroxyl value, low free fatty acid (FFA < 0.5%), and low moisture content make it ideal for high-end lipsticks, hair conditioners, bio-lubricants, and polyurethane synthesis.',
    specs: [
      { key: 'Ricinoleic Acid', value: '85.0% – 90.0%', unit: '%' },
      { key: 'Free Fatty Acid (as Oleic)', value: '≤ 0.50%', unit: '%' },
      { key: 'Moisture & Volatile Matter', value: '≤ 0.25%', unit: '%' },
      { key: 'Hydroxyl Value', value: '160 – 168', unit: 'mg KOH/g' },
      { key: 'Iodine Value (Wijs)', value: '82 – 90', unit: 'g I2/100g' },
      { key: 'Saponification Value', value: '177 – 187', unit: 'mg KOH/g' }
    ],
    packing: [
      { type: 'New Epoxy-Coated Steel Drum', size: '200 kg net', notes: '80 drums per 20ft FCL (16.0 MT)' },
      { type: 'Intermediate Bulk Container (IBC)', size: '1000 kg net', notes: '18 IBCs per 20ft FCL (18.0 MT)' },
      { type: 'Flexitank / ISO Tank', size: '21.5 MT', notes: 'Bulk ocean freight' }
    ],
    moq: { value: 1, unit: '20ft FCL' },
    shelfLife: '24 months',
    isFeatured: true,
  },
  {
    name: 'Golden Sesame Oil (Cold-Pressed Cosmetic Grade)',
    categoryName: 'Personal Care Raw Materials',
    hsCode: '1515.50',
    botanicalName: 'Sesamum indicum',
    origin: ['Gujarat', 'Madhya Pradesh'],
    forms: ['Cold-Pressed Virgin Oil', 'Deodorized Cosmetic Oil'],
    grades: ['100% Pure Virgin Cold-Pressed', 'Cosmetic Extra-Pale'],
    shortDescription: 'Naturally stable golden virgin sesame seed oil containing natural antioxidants sesamin and sesamol, ideal for Ayurvedic body massage and hair oils.',
    description: 'Mechanically cold-pressed from hulled white sesame seeds without chemical solvents. Retains natural tocopherols and essential fatty acids (Omega-6 linoleic and Omega-9 oleic). Fast skin penetration, non-comedogenic, and highly resistant to rancidity.',
    specs: [
      { key: 'Free Fatty Acids (FFA)', value: '≤ 1.0%', unit: '%' },
      { key: 'Peroxide Value', value: '≤ 4.0 meq/kg', unit: 'meq/kg' },
      { key: 'Refractive Index at 40°C', value: '1.465 – 1.469', unit: 'index' },
      { key: 'Sesamin & Sesamolin', value: '≥ 0.8%', unit: '%' }
    ],
    packing: [
      { type: 'Steel Drum with Food-Grade Coating', size: '190 kg', notes: 'Export standard' },
      { type: 'HDPE Carboys', size: '25 kg', notes: 'Cleanroom handling' }
    ],
    moq: { value: 1, unit: 'MT' },
    shelfLife: '24 months',
    isFeatured: true,
  },
  {
    name: 'Pure Lemongrass & Peppermint Essential Oils',
    categoryName: 'Personal Care Raw Materials',
    hsCode: '3301.29',
    botanicalName: 'Cymbopogon flexuosus / Mentha piperita',
    origin: ['Kerala', 'Uttar Pradesh'],
    forms: ['100% Pure & Natural Steam-Distilled Essential Oil'],
    grades: ['Citral 75%+ Lemongrass Grade', 'L-Menthol 70%+ Peppermint Grade'],
    shortDescription: 'Steam-distilled therapeutic Indian essential oils with complete GC-MS testing reports for soaps, aromatherapy, and fine cosmetics.',
    description: 'Freshly harvested plant biomass steam-distilled under vacuum in stainless steel stills. Tested on Gas Chromatography-Mass Spectrometry (GC-MS) ensuring strict conformity with ISO and IFRA standards.',
    specs: [
      { key: 'Citral Content (Lemongrass)', value: '75.0% – 85.0%', unit: '%' },
      { key: 'Optical Rotation at 20°C', value: '-3° to +1°', unit: 'deg' },
      { key: 'Refractive Index at 20°C', value: '1.483 – 1.489', unit: 'index' },
      { key: 'Purity Check', value: '100% Natural, Zero Dilution', unit: 'test' }
    ],
    packing: [
      { type: 'Fluorinated Aluminum Can / Drum', size: '25 kg net / 180 kg net', notes: 'Airtight UN approved' }
    ],
    moq: { value: 100, unit: 'kg' },
    shelfLife: '36 months',
    isFeatured: true,
  },

  // 3. Animal Feed & Nutrition
  {
    name: 'Yellow Corn / Maize (Animal Feed Grade)',
    categoryName: 'Animal Feed',
    hsCode: '1005.90',
    botanicalName: 'Zea mays',
    origin: ['Gujarat', 'Madhya Pradesh', 'Karnataka'],
    forms: ['Whole Golden Grain', 'Machine Cleaned', 'Sortex Clean'],
    grades: ['Non-GMO Animal Feed Grade #2', 'Poultry & Cattle Feed Specification'],
    shortDescription: 'Non-GMO plump yellow feed corn kernels cleaned and conditioned for poultry, swine, and dairy cattle energy feeds.',
    description: 'Harvested from certified non-GMO corn farm clusters across Saurashtra and central India. High starch and metabolizable energy (ME > 3300 kcal/kg). Rigorously tested to ensure Aflatoxin B1 is below 20 ppb (and < 10 ppb for European contracts). Machine aspirated to remove broken grains, dust, and foreign matter.',
    specs: [
      { key: 'Moisture', value: '≤ 13.5%', unit: '%' },
      { key: 'Crude Protein (Dry Basis)', value: '≥ 8.5% – 9.0%', unit: '%' },
      { key: 'Crude Fat', value: '≥ 3.5%', unit: '%' },
      { key: 'Crude Fiber', value: '≤ 2.5%', unit: '%' },
      { key: 'Aflatoxin (B1+B2+G1+G2)', value: '≤ 20 ppb (Max)', unit: 'ppb' },
      { key: 'Foreign Matter', value: '≤ 1.5%', unit: '%' },
      { key: 'Broken Kernels', value: '≤ 3.0%', unit: '%' },
      { key: 'Weeviled Seeds', value: '≤ 1.0%', unit: '%' }
    ],
    packing: [
      { type: 'PP Woven Export Bags', size: '50 kg net', notes: '520 bags per 20ft FCL (26.0 MT)' },
      { type: 'Jumbo FIBC Bulk Bags', size: '1000 kg net', notes: '24 FIBC bags per 20ft FCL (24.0 MT)' },
      { type: 'Bulk in Container Liner Bag', size: '26 MT', notes: 'Direct container stuffing' }
    ],
    moq: { value: 1, unit: '20ft FCL (26 MT)' },
    shelfLife: '12 months',
    isFeatured: true,
  },
  {
    name: 'Corn Grits (Animal & Brewing Feed)',
    categoryName: 'Animal Feed',
    hsCode: '1103.13',
    botanicalName: 'Zea mays',
    origin: ['Gujarat', 'Maharashtra'],
    forms: ['Coarse Grits (#101)', 'Medium Grits (#108)', 'Fine Brewer Grits'],
    grades: ['Degermed Export Grade', 'Low Fat Feed Grits'],
    shortDescription: 'Precision de-germed and milled yellow corn endosperm grits with low fat (< 1.0%) for commercial feed pellets, poultry crumbles, and brewing adjuncts.',
    description: 'Produced by optical de-stoning, mechanical de-germing, and roller milling of selected Non-GMO yellow maize. The separation of the germ ensures low oil content, preventing rancidity during long ocean container voyages.',
    specs: [
      { key: 'Moisture', value: '≤ 12.0%', unit: '%' },
      { key: 'Fat / Oil Content', value: '≤ 1.0%', unit: '%' },
      { key: 'Protein', value: '≥ 8.0%', unit: '%' },
      { key: 'Granulation', value: 'Uniform 10–24 Mesh', unit: 'mesh' }
    ],
    packing: [
      { type: 'PP Bags with Inner Liner', size: '50 kg', notes: '25 MT per 20ft FCL' }
    ],
    moq: { value: 1, unit: '20ft FCL' },
    shelfLife: '12 months',
    isFeatured: false,
  },
  {
    name: 'Green Millet (Bajra for Bird & Cattle Feed)',
    categoryName: 'Animal Feed',
    hsCode: '1008.21',
    botanicalName: 'Pennisetum glaucum',
    origin: ['Gujarat (Banaskantha, Kutch)', 'Rajasthan'],
    forms: ['Machine Cleaned Sortex Grain', 'Green Bold Grain'],
    grades: ['Premium Green Pearl Millet (Export Grade)', 'Standard Bird Feed Grade'],
    shortDescription: 'Uniform green pearl millet grains cleaned with optical Sortex sorters, widely imported for wild bird feeds, pigeons, and poultry feed formulation.',
    description: 'Gujarat is the primary origin for high-grade green bajra. Harvested in dry sunlit climate ensuring bright pale-green color and high natural carotene. Excellent amino acid balance and zero tannins.',
    specs: [
      { key: 'Moisture', value: '≤ 12.0%', unit: '%' },
      { key: 'Crude Protein', value: '≥ 10.5%', unit: '%' },
      { key: 'Foreign Matter', value: '≤ 1.0%', unit: '%' },
      { key: 'Other Colored Seeds', value: '≤ 2.0%', unit: '%' },
      { key: 'Aflatoxin', value: '< 10 ppb', unit: 'ppb' }
    ],
    packing: [
      { type: 'PP Bags', size: '25 kg / 50 kg', notes: '26 MT per 20ft FCL' }
    ],
    moq: { value: 1, unit: '20ft FCL (26 MT)' },
    shelfLife: '12 months',
    isFeatured: true,
  },
  {
    name: 'Soybean Meal / De-Oiled Soya Cake (DOC)',
    categoryName: 'Animal Feed',
    hsCode: '2304.00',
    botanicalName: 'Glycine max',
    origin: ['Madhya Pradesh (Indore)', 'Maharashtra'],
    forms: ['Flakes', 'Granular Meal', 'Pelletized Meal'],
    grades: ['Non-GMO Hi-Pro 48% Protein', 'Standard 46% Protein'],
    shortDescription: 'High-protein toasted Non-GMO Indian soybean de-oiled cake (DOC 48% Protein) in 50kg PP bags for aquaculture, poultry, and animal feed rations.',
    description: 'Extracted from whole Non-GMO soybean seeds using continuous hexane solvent extraction and toaster desolventization. Processed at optimal temperatures to denature anti-nutritional trypsin inhibitors while preserving digestible lysine and methionine. Low urease activity (< 0.20 mg N/g/min).',
    specs: [
      { key: 'Crude Protein (Dry Basis)', value: '≥ 48.0%', unit: '%' },
      { key: 'Moisture', value: '≤ 11.0%', unit: '%' },
      { key: 'Crude Fiber', value: '≤ 6.0%', unit: '%' },
      { key: 'Oil / Fat Content', value: '≤ 1.2%', unit: '%' },
      { key: 'Sand & Silica', value: '≤ 1.5%', unit: '%' },
      { key: 'Urease Activity (at 30°C)', value: '0.05 – 0.20 mg N/g/min', unit: 'mg N/g/min' }
    ],
    packing: [
      { type: 'Heavy Duty PP Bags', size: '50 kg net', notes: '500 bags per 20ft FCL (25.0 MT)' },
      { type: 'Bulk Container Liner', size: '26 MT', notes: 'Dry ocean freight' }
    ],
    moq: { value: 1, unit: '20ft FCL' },
    shelfLife: '12 months',
    isFeatured: true,
  },
  {
    name: 'Safflower Seeds (Kardi for Bird Feed)',
    categoryName: 'Animal Feed',
    hsCode: '1207.60',
    botanicalName: 'Carthamus tinctorius',
    origin: ['Maharashtra', 'Karnataka', 'Gujarat'],
    forms: ['Machine Cleaned White Seeds', 'Sortex Clean 99% Purity'],
    grades: ['Export Grade Pure White Kardi', 'Avian Mixture Feed Grade'],
    shortDescription: 'Pristine ivory-white Indian safflower seeds (Kardi) machine-cleaned and Sortex-sorted for pet bird feeds, parrots, and avian nutrition blends.',
    description: 'Safflower seeds have a tough fibrous white pericarp which squirrels and rodents avoid, making them the worldwide premier choice for wild bird feeders and parrot seed mixtures. High linoleic fatty acid content (Omega-6) promotes healthy plumage in birds.',
    specs: [
      { key: 'Purity', value: '≥ 99.0%', unit: '%' },
      { key: 'Moisture', value: '≤ 10.0%', unit: '%' },
      { key: 'Oil Content', value: '≥ 28.0% – 32.0%', unit: '%' },
      { key: 'Foreign Matter', value: '≤ 1.0%', unit: '%' },
      { key: 'Damaged / Discolored Seeds', value: '≤ 2.0%', unit: '%' }
    ],
    packing: [
      { type: 'PP Bags', size: '25 kg / 40 kg net', notes: '20 MT per 20ft FCL' }
    ],
    moq: { value: 1, unit: '20ft FCL' },
    shelfLife: '18 months',
    isFeatured: true,
  }
];

export const runEnrichment = async () => {
  try {
    logger.info('Starting Product & Image Enrichment...');
    await connectDB();

    const categories = await Category.findAll();
    const catMap = new Map();
    categories.forEach((c) => {
      catMap.set(c.name, c);
      catMap.set(c.slug, c);
    });

    let newCount = 0;
    let updatedCount = 0;

    // 1. Insert or update the new detailed products
    for (const item of NEW_PRODUCTS_TO_SEED) {
      const parentCat = catMap.get(item.categoryName);
      if (!parentCat) {
        logger.warn(`Category not found: ${item.categoryName}`);
        continue;
      }

      const slug = createSlug(item.name);
      const imgPath = resolveProductImage(item.name, item.categoryName);
      const imagesPayload = [
        { url: imgPath, alt: `${item.name} - JHS GLOBAL Export Quality`, isPrimary: true, order: 0 }
      ];

      const payload = {
        name: item.name,
        slug,
        categoryId: parentCat.id,
        hsCode: item.hsCode,
        botanicalName: item.botanicalName || '',
        origin: item.origin || ['India'],
        forms: item.forms || [],
        grades: item.grades || ['Export Quality'],
        shortDescription: item.shortDescription || '',
        description: item.description || '',
        specs: item.specs || [],
        packing: item.packing || [{ type: 'PP Bag', size: '25 kg', notes: 'Export standard' }],
        moq: item.moq || { value: 1, unit: '20ft FCL' },
        shelfLife: item.shelfLife || '24 months',
        images: imagesPayload,
        incoterms: ['FOB', 'CIF', 'CFR'],
        ports: ['Mundra', 'Pipavav', 'Hazira', 'Nhava Sheva (JNPT)'],
        tags: [item.name.toLowerCase(), item.categoryName.toLowerCase(), ...(item.origin || []).map(o => o.toLowerCase())],
        isFeatured: Boolean(item.isFeatured),
        isActive: true,
        isPrivateLabelAvailable: true,
        seo: {
          title: `${item.name} Exporter India | JHS GLOBAL Bulk Supply`,
          description: `Export-grade ${item.name} in container shipments from India. Guaranteed lab COA, HS Code ${item.hsCode}, and international customs documentation by JHS GLOBAL.`,
        },
      };

      const existing = await Product.findOne({ where: { slug } });
      if (!existing) {
        await Product.create(payload);
        logger.info(`Created new product: ${item.name}`);
        newCount++;
      } else {
        await existing.update(payload);
        logger.info(`Updated product: ${item.name}`);
        updatedCount++;
      }
    }

    // 2. Update images for ALL existing products in the DB so zero products have missing images
    const allProducts = await Product.findAll();
    let imgUpdatedCount = 0;

    for (const p of allProducts) {
      const parentCat = categories.find((c) => c.id === p.categoryId);
      const catName = parentCat ? parentCat.name : '';
      const resolvedImg = resolveProductImage(p.name, catName);

      const currentImgs = p.images || [];
      const needsUpdate = currentImgs.length === 0 || !currentImgs[0]?.url;

      if (needsUpdate) {
        await p.update({
          images: [{ url: resolvedImg, alt: `${p.name} - JHS GLOBAL`, isPrimary: true, order: 0 }]
        });
        imgUpdatedCount++;
      }
    }

    const totalCount = await Product.count();
    logger.info(`Enrichment complete! Added: ${newCount}, Updated: ${updatedCount}, Images assigned: ${imgUpdatedCount}. Total products in DB: ${totalCount}`);
    process.exit(0);
  } catch (err) {
    logger.error('Enrichment failed:', err);
    process.exit(1);
  }
};

runEnrichment();
