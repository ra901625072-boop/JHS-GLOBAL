import Product from '../modules/product/product.model.js';
import createSlug from '../utils/slugify.js';
import logger from '../utils/logger.js';

export const productsRawData = [
  // =========================================================================
  // CATEGORY 1: PERSONAL CARE RAW MATERIALS
  // =========================================================================
  {
    name: 'Castor oil and its derivatives',
    category: 'Personal Care Raw Materials',
    subCategory: 'Carrier Oils & Specialty Lipids',
    slug: 'castor-oil-and-derivatives',
    hsCode: '1515.30',
    botanicalName: 'Ricinus communis',
    origin: ['India (Gujarat belt) — TODO(client)'],
    forms: [
      'Refined Castor Oil (First Special Grade - FSG)',
      'Pale Pressed Grade',
      'Hydrogenated Castor Oil (Castor Wax Flakes)',
      '12-Hydroxystearic Acid (12-HSA)',
      'Ricinoleic Acid',
    ],
    grades: ['Cosmetic Grade', 'Pharma / Technical Grade'],
    shortDescription:
      'High-purity Indian castor oil and functional oleochemical derivatives for cosmetic formulations, surfactants, emollient lipsticks, and industrial lubricants.',
    description:
      'Origin-direct castor oil and downstream derivatives sourced from the premier Gujarat castor growing belt. Processed under controlled expelling and refining conditions to ensure low acid value and consistent hydroxyl number. High in ricinoleic acid content, serving as a primary emollient, pigment dispersing base, and moisture-barrier lipid in cosmetics and personal care formulations. Raw material supplied for industrial and cosmetic manufacturing. Technical documentation (COA/TDS/SDS) available upon client confirmation — TODO(client).',
    specs: [
      { key: 'Ricinoleic Acid Content', value: '85.0% – 90.0%', unit: 'GC %', verified: false, notes: 'Typical range; verify via lot COA — TODO(client)' },
      { key: 'Acid Value', value: '≤ 2.0', unit: 'mg KOH/g', verified: false, notes: 'Standard FSG specification' },
      { key: 'Saponification Value', value: '177 – 187', unit: 'mg KOH/g', verified: false, notes: 'Standard test method' },
      { key: 'Iodine Value', value: '82 – 90', unit: 'g I₂/100g', verified: false, notes: 'Standard test method' },
      { key: 'Hydroxyl Value', value: '160 – 168', unit: 'mg KOH/g', verified: false, notes: 'Characteristic marker' },
      { key: 'Moisture & Volatiles', value: '≤ 0.25%', unit: '%', verified: false, notes: 'Karl Fischer titration' },
    ],
    attributes: {
      casNumber: '8001-79-4',
      subGroup: 'Carrier Oils & Specialty Lipids',
      verified: false,
      todo: 'TODO(client) — verify specific derivative CAS and HS heading with customs broker',
    },
    packing: [
      { type: 'Epoxy-Coated Steel Drum', size: '200 kg net', notes: 'Standard international export drum' },
      { type: 'Intermediate Bulk Container (IBC)', size: '1,000 L / 950 kg net', notes: 'Food/Cosmetic grade tote with discharge valve' },
      { type: 'Multi-Wall Paper Bag with PE Liner', size: '25 kg net', notes: 'For Hydrogenated Castor Wax flakes' },
      { type: 'ISO Tank Container', size: '20–22 MT', notes: 'Bulk ocean maritime liquid transport' },
    ],
    moq: { value: 1, unit: '20ft FCL (80 drums / 16 MT) — TODO(client)' },
    shelfLife: '24 months in unopened original packaging — TODO(client)',
    storage: 'Store in tightly sealed containers in a cool, dry warehouse protected from direct sunlight.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)', 'Hazira (INHZR)'],
    leadTime: '10–15 business days following LC/deposit confirmation — TODO(client)',
    isFeatured: true,
  },
  {
    name: 'Herbal / botanical extracts',
    category: 'Personal Care Raw Materials',
    subCategory: 'Cosmetic Active Extracts',
    slug: 'herbal-botanical-extracts',
    hsCode: '1302.19',
    botanicalName: 'Multi-botanical (Aloe barbadensis, Azadirachta indica, Centella asiatica, Glycyrrhiza glabra)',
    origin: ['India — TODO(client)'],
    forms: [
      'Standardized Dry Powder Extracts',
      'Propylene Glycol / Glycolic Liquid Extracts',
      'Glycerin-Based Botanical Extracts',
      'Hydro-Alcoholic Liquid Extracts',
    ],
    grades: ['Cosmetic Active Grade', 'Personal Care Grade'],
    shortDescription:
      'Plant-derived cosmetic active extracts and botanical infusions for haircare serums, skin brightening lotions, cleansing formulations, and topical creams.',
    description:
      'Cosmetic-grade plant extracts produced via selective low-temperature solvent extraction and multi-stage filtration to preserve delicate phyto-active compounds. Available as concentrated water-soluble liquids, glycolic infusions, or water-dispersible spray-dried powders. Sourced from certified Indian botanical farms. Raw material for manufacturer use only; not for direct consumer application. Batch-specific Certificates of Analysis and microbiological screening reports available on order — TODO(client).',
    specs: [
      { key: 'Extract Ratio', value: '4:1 to 10:1 (or standardized active)', unit: 'Ratio', verified: false, notes: 'Custom ratios available upon request — TODO(client)' },
      { key: 'pH (10% aqueous solution)', value: '4.5 – 7.0', unit: 'pH', verified: false, notes: 'Typical range at 25°C' },
      { key: 'Total Heavy Metals (Pb, As, Cd, Hg)', value: '< 10.0', unit: 'ppm', verified: false, notes: 'ICP-MS laboratory screening' },
      { key: 'Total Aerobic Microbial Count', value: '< 1,000', unit: 'CFU/g', verified: false, notes: 'Cosmetic microbiological standard' },
      { key: 'Yeast and Mold', value: '< 100', unit: 'CFU/g', verified: false, notes: 'Cosmetic microbiological standard' },
      { key: 'Specified Pathogens (E. coli, P. aeruginosa, S. aureus)', value: 'Absent in 1g', unit: 'Test', verified: false, notes: 'Negative' },
    ],
    attributes: {
      subGroup: 'Cosmetic Active Extracts',
      verified: false,
      todo: 'TODO(client) — confirm specific botanical menu, solvent bases, and extraction documentation',
    },
    packing: [
      { type: 'HDPE Carboys / Jerrycans', size: '25 kg net', notes: 'For liquid botanical extracts with tamper-evident seal' },
      { type: 'Fiber Drum with Double PE Liners', size: '25 kg net', notes: 'For spray-dried powder extracts' },
      { type: 'HDPE Blue Drums', size: '200 kg net', notes: 'Bulk commercial formulator volume' },
    ],
    moq: { value: 500, unit: 'kg (Trial LCL pallet) or 1 FCL — TODO(client)' },
    shelfLife: '24 months stored below 25°C — TODO(client)',
    storage: 'Store in tightly closed original containers in a cool, ventilated, dark area.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)'],
    leadTime: '12–18 business days — TODO(client)',
    isFeatured: false,
  },
  {
    name: 'Sodium lauryl ether sulfate (SLES)',
    category: 'Personal Care Raw Materials',
    subCategory: 'Surfactants & Cleansing Agents',
    slug: 'sodium-lauryl-ether-sulfate-sles',
    hsCode: '3402.31',
    origin: ['India — TODO(client)'],
    forms: [
      'SLES 70% (Concentrated Viscous Gel / Paste)',
      'SLES 28% (Diluted Aqueous Solution)',
    ],
    grades: ['Cosmetic Grade', 'Toiletry / Detergent Grade'],
    shortDescription:
      'High-performance anionic surfactant with outstanding foam density, wetting power, and viscosity response for shampoos, body washes, bubble baths, and liquid hand soaps.',
    description:
      'Sodium Lauryl Ether Sulfate (SLES) is an anionic surfactant derived from ethoxylated lauryl alcohol. It provides rich, creamy lather, excellent foam stability, and superior detergency in hard or soft water. Compatible with secondary surfactants (betaines, amine oxides, alkanolamides) to build viscosity with electrolyte addition. Manufactured under strict sulfonation and neutralization controls to ensure minimal 1,4-dioxane byproduct levels. Raw chemical material for manufacturing use only. SDS/TDS provided upon request — TODO(client).',
    specs: [
      { key: 'Active Matter (SLES 70%)', value: '68.0% – 72.0%', unit: 'wt %', verified: false, notes: 'Standard titrimetric assay — TODO(client)' },
      { key: 'Unsulfated Matter (Free Alcohol)', value: '≤ 2.5% – 3.0%', unit: 'wt %', verified: false, notes: 'Based on 100% active substance' },
      { key: 'Sodium Sulfate (Inorganic Salt)', value: '≤ 1.5%', unit: 'wt %', verified: false, notes: 'Based on 100% active substance' },
      { key: 'pH (1% aqueous solution at 25°C)', value: '7.0 – 9.0', unit: 'pH', verified: false, notes: 'Standard specification' },
      { key: 'Color (APHA / Hazen, 5% active in water)', value: '≤ 20 – 30', unit: 'Hazen', verified: false, notes: 'Clear water-white liquid' },
      { key: '1,4-Dioxane Content', value: '≤ 30.0', unit: 'ppm', verified: false, notes: 'Low-dioxane grade available on request — TODO(client)' },
    ],
    attributes: {
      casNumber: '68891-38-3',
      chemicalFormula: 'CH3(CH2)10CH2(OCH2CH2)nOSO3Na',
      subGroup: 'Surfactants & Cleansing Agents',
      verified: false,
      todo: 'TODO(client) — verify customs tariff code and dioxane guarantee with manufacturing plant',
    },
    packing: [
      { type: 'Wide-Mouth HDPE Drum', size: '170 kg / 220 kg net', notes: 'Standard export drums (80 drums per 20ft FCL ~ 17.6 MT)' },
      { type: 'Intermediate Bulk Container (IBC)', size: '1,000 kg net', notes: 'Semi-bulk tote' },
      { type: 'ISO Tank Container', size: '20–22 MT', notes: 'Direct bulk liquid maritime transport' },
    ],
    moq: { value: 1, unit: '20ft FCL (~17.6 MT) — TODO(client)' },
    shelfLife: '12 months stored between 15°C and 40°C — TODO(client)',
    storage: 'Store above 15°C to prevent crystallization or gel precipitation. Avoid direct exposure to freezing or extreme heat.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)', 'Hazira (INHZR)'],
    leadTime: '7–12 business days — TODO(client)',
    isFeatured: true,
  },
  {
    name: 'Salicylic acid',
    category: 'Personal Care Raw Materials',
    subCategory: 'Hydroxy Acids & Exfoliating Actives',
    slug: 'salicylic-acid',
    hsCode: '2918.21',
    origin: ['India — TODO(client)'],
    forms: [
      'White Crystalline Powder',
      'White Fine Needle Crystals',
    ],
    grades: ['Cosmetic Grade', 'USP / Technical Grade — TODO(client)'],
    shortDescription:
      'High-purity beta-hydroxy acid (BHA) crystalline active for clarifying skincare, scalp treatment shampoos, exfoliating pads, and cosmetic formulations.',
    description:
      'Salicylic Acid (2-hydroxybenzoic acid) is an oil-soluble beta-hydroxy acid that penetrates lipid bilayers and sebaceous follicles to provide targeted keratolytic and clarifying action. Commonly formulated into acne-prone skin formulations, anti-dandruff hair cleansers, exfoliating peels, and topical serums within regulatory dosage thresholds. Manufactured under synthetic carboxylation of sodium phenolate with high crystallization purity. Raw material for industrial formulators; safety evaluation and finished product compliance are buyer responsibility in their target market. SDS/COA provided on request — TODO(client).',
    specs: [
      { key: 'Assay (Acidimetric Titration, dry basis)', value: '99.0% – 100.5%', unit: 'wt %', verified: false, notes: 'Standard compendial assay — TODO(client)' },
      { key: 'Melting Point Range', value: '158.0°C – 161.0°C', unit: '°C', verified: false, notes: 'Capillary method' },
      { key: 'Loss on Drying', value: '≤ 0.5%', unit: '%', verified: false, notes: 'Dry over silica gel' },
      { key: 'Residue on Ignition (Sulfated Ash)', value: '≤ 0.05%', unit: '%', verified: false, notes: 'Standard test' },
      { key: 'Heavy Metals', value: '≤ 20.0', unit: 'ppm', verified: false, notes: 'USP limit' },
      { key: 'Related Substances (Phenol, 4-Hydroxybenzoic acid)', value: 'Conforms to standard limits', unit: 'HPLC', verified: false, notes: 'Pass' },
    ],
    attributes: {
      casNumber: '69-72-7',
      chemicalFormula: 'C7H6O3',
      molecularWeight: '138.12 g/mol',
      subGroup: 'Hydroxy Acids & Exfoliating Actives',
      verified: false,
      todo: 'TODO(client) — confirm pharmacopeia compliance grade (USP, BP, or Industrial Cosmetic)',
    },
    packing: [
      { type: 'Multi-Wall Kraft Paper Bag with PE Liner', size: '25 kg net', notes: 'Moisture-barrier palletized export packaging' },
      { type: 'Fiber Drum with Double PE Bags', size: '25 kg net', notes: 'High-protection rigid container' },
      { type: 'Big Bag / Bulk Tote', size: '500 kg / 1 MT net', notes: 'Bulk chemical industrial supply' },
    ],
    moq: { value: 1, unit: 'Metric Tonne (MT) or 1 FCL — TODO(client)' },
    shelfLife: '36 months in intact packaging — TODO(client)',
    storage: 'Keep in tightly closed containers in a dry, well-ventilated warehouse away from incompatible oxidizing agents.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)'],
    leadTime: '10–14 business days — TODO(client)',
    isFeatured: true,
  },
  {
    name: 'Glycolic acid',
    category: 'Personal Care Raw Materials',
    subCategory: 'Hydroxy Acids & Exfoliating Actives',
    slug: 'glycolic-acid',
    hsCode: '2918.17',
    origin: ['India — TODO(client)'],
    forms: [
      '70% Aqueous Solution (Cosmetic / High-Purity Grade)',
      '99% Crystalline Solid (High-Purity)',
    ],
    grades: ['Cosmetic High-Purity Grade', 'Industrial Grade'],
    shortDescription:
      'Smallest alpha-hydroxy acid (AHA) active solution with superior skin penetration for chemical exfoliant serums, resurfacing toners, and anti-aging cosmetic formulations.',
    description:
      'Glycolic acid (hydroxyacetic acid) is the simplest alpha-hydroxy acid with the lowest molecular weight, facilitating rapid stratum corneum interaction. It acts as an effective chemical exfoliant, cellular turnover enhancer, and pH adjuster in cosmetic formulations, chemical peels, and body washes. Supplied primarily as a water-clear 70% aqueous solution with low formic acid and methoxyacetic acid impurities. Chemical raw material intended for formulation professionals; formulation neutralization and buffering protocols are buyer responsibility. TDS/COA/SDS available on confirmation — TODO(client).',
    specs: [
      { key: 'Total Glycolic Acid (Titration)', value: '69.0% – 71.0%', unit: 'wt %', verified: false, notes: '70% Solution standard — TODO(client)' },
      { key: 'Free Glycolic Acid', value: '65.0% – 68.0%', unit: 'wt %', verified: false, notes: 'Typical formulation balance' },
      { key: 'Formic Acid Content', value: '≤ 0.5%', unit: 'wt %', verified: false, notes: 'Typical high-purity cosmetic specification' },
      { key: 'Sulfates (as SO4)', value: '≤ 0.2%', unit: 'wt %', verified: false, notes: 'Spectrophotometric standard' },
      { key: 'Turbidity', value: '≤ 5.0', unit: 'NTU', verified: false, notes: 'Clear water-white liquid' },
      { key: 'Heavy Metals (as Pb)', value: '≤ 10.0', unit: 'ppm', verified: false, notes: 'ICP-MS' },
    ],
    attributes: {
      casNumber: '79-14-1',
      chemicalFormula: 'C2H4O3',
      molecularWeight: '76.05 g/mol',
      subGroup: 'Hydroxy Acids & Exfoliating Actives',
      verified: false,
      todo: 'TODO(client) — verify solution concentration and export packing certification for corrosives',
    },
    packing: [
      { type: 'UN-Certified HDPE Carboy / Jerrycan', size: '25 kg net', notes: 'Corrosive-rated plastic carboy' },
      { type: 'UN-Certified HDPE Drum', size: '250 kg net', notes: 'Standard ocean container drum' },
      { type: 'UN-Certified IBC Tote Container', size: '1,250 kg net', notes: 'Composite intermediate bulk container' },
    ],
    moq: { value: 1, unit: 'Metric Tonne (MT) or 1 FCL — TODO(client)' },
    shelfLife: '24 months stored between 10°C and 30°C — TODO(client)',
    storage: 'Store in corrosion-resistant HDPE or lined containers away from strong bases and oxidizing agents.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)'],
    leadTime: '10–15 business days — TODO(client)',
    isFeatured: false,
  },
  {
    name: 'Vitamin E acetate',
    category: 'Personal Care Raw Materials',
    subCategory: 'Vitamins & Antioxidant Actives',
    slug: 'vitamin-e-acetate',
    hsCode: '2936.28',
    origin: ['India — TODO(client)'],
    forms: [
      'dl-alpha-Tocopheryl Acetate (Viscous Oily Liquid, ≥ 96%–98%)',
      'Vitamin E 50% CWS / Beadlet Powder (Cold-Water Soluble)',
    ],
    grades: ['Cosmetic Active Grade', 'Pharma / Food Grade — TODO(client)'],
    shortDescription:
      'Stable synthetic fat-soluble antioxidant vitamin ester for anti-aging skin creams, facial serums, barrier repair ointments, and sun protection lotions.',
    description:
      'Vitamin E Acetate (dl-alpha-tocopheryl acetate) is an esterified derivative of tocopherol characterized by superior oxidative stability compared to free tocopherol. Resistant to atmospheric oxidation, it acts as a premier lipid antioxidant and cellular conditioning active when absorbed into epidermal tissues. Widely incorporated into moisturizing creams, lip treatments, color cosmetics, and sun care formulations. Supplied as a viscous golden oil under inert nitrogen blankets. Technical specifications and batch COA supplied on request — TODO(client).',
    specs: [
      { key: 'Assay (dl-alpha-Tocopheryl Acetate, GC)', value: '≥ 96.0% – 99.0%', unit: 'wt %', verified: false, notes: 'Gas chromatography assay — TODO(client)' },
      { key: 'Free Tocopherol', value: '≤ 1.0%', unit: 'wt %', verified: false, notes: 'Compendial limit' },
      { key: 'Specific Extinction (E 1%/1cm, 284 nm in ethanol)', value: '42.0 – 45.0', unit: 'Abs', verified: false, notes: 'UV Spectrophotometric standard' },
      { key: 'Refractive Index (nD at 20°C)', value: '1.494 – 1.498', unit: 'Index', verified: false, notes: 'Standard optical measurement' },
      { key: 'Heavy Metals', value: '≤ 10.0', unit: 'ppm', verified: false, notes: 'USP limit' },
      { key: 'Appearance', value: 'Clear, nearly colorless to greenish-yellow viscous oil', unit: 'Visual', verified: false, notes: 'Odorless / faint characteristic' },
    ],
    attributes: {
      casNumber: '7695-91-2',
      chemicalFormula: 'C31H52O3',
      subGroup: 'Vitamins & Antioxidant Actives',
      verified: false,
      todo: 'TODO(client) — confirm origin assay (synthetic dl-alpha vs natural d-alpha) and nitrogen purge protocol',
    },
    packing: [
      { type: 'Aluminum Bottle / Canister', size: '5 kg / 25 kg net', notes: 'Sealed under nitrogen blanket' },
      { type: 'Epoxy-Lined Steel Drum', size: '50 kg / 200 kg net', notes: 'Commercial batch container' },
    ],
    moq: { value: 100, unit: 'kg (Trial order) or 500 kg — TODO(client)' },
    shelfLife: '36 months in unopened containers protected from light and heat — TODO(client)',
    storage: 'Store in tight, light-resistant containers under nitrogen blanket below 25°C.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)'],
    leadTime: '7–12 business days — TODO(client)',
    isFeatured: true,
  },
  {
    name: 'Kaolin clay powder',
    category: 'Personal Care Raw Materials',
    subCategory: 'Functional Clays & Mineral Powders',
    slug: 'kaolin-clay-powder',
    hsCode: '2507.00',
    origin: ['India (Gujarat / Rajasthan mining belts) — TODO(client)'],
    forms: [
      'Micronized White Powder (325 Mesh, ≤ 44 µm)',
      'Ultra-Fine Air-Classified Powder (500 Mesh)',
    ],
    grades: ['Cosmetic Grade', 'Pharmaceutical Grade — TODO(client)'],
    shortDescription:
      'Ultra-fine natural hydrous aluminum silicate clay for clarifying face masks, gentle exfoliating muds, cosmetic powders, and mineral foundation bases.',
    description:
      'Kaolin clay (China clay) is a naturally occurring hydrated aluminum silicate mineral extracted from prime Indian deposits, hydro-cycloned, washed, and micronized to remove grit and crystalline silica. Exhibiting gentle sebum absorption and non-irritating rheology, it is the primary functional mineral base for purifying facial mud masks, body wraps, dusting powders, bar soaps, and cosmetic emulsions. Non-hazardous natural mineral raw material. Lot-specific mesh and heavy metal test certificates provided on order — TODO(client).',
    specs: [
      { key: 'Whiteness / Brightness (ISO)', value: '82.0% – 88.0%', unit: '%', verified: false, notes: 'Reflectance spectrophotometer — TODO(client)' },
      { key: 'Particle Size (Residue on 325 mesh / 44 µm)', value: '≤ 0.5% (99.5% passing)', unit: 'wt %', verified: false, notes: 'Wet sieve analysis' },
      { key: 'pH (10% aqueous slurry at 25°C)', value: '5.5 – 7.5', unit: 'pH', verified: false, notes: 'Neutral skin-compatible pH' },
      { key: 'Moisture (Loss on Drying at 105°C)', value: '≤ 1.5% – 2.0%', unit: 'wt %', verified: false, notes: 'Oven drying' },
      { key: 'Loss on Ignition (1000°C)', value: '12.0% – 14.5%', unit: 'wt %', verified: false, notes: 'Structural water content' },
      { key: 'Heavy Metals (Pb, As, Cd)', value: '< 20.0', unit: 'ppm', verified: false, notes: 'ICP-OES screening' },
    ],
    attributes: {
      casNumber: '1332-58-7',
      chemicalFormula: 'Al2Si2O5(OH)4',
      subGroup: 'Functional Clays & Mineral Powders',
      verified: false,
      todo: 'TODO(client) — verify ISO brightness grade and microbiology sterilization status',
    },
    packing: [
      { type: 'Multi-Wall Laminated Paper Bag with PE Liner', size: '25 kg net', notes: 'Moisture-proof export bag (40 bags per pallet)' },
      { type: 'Woven Polypropylene Bag with Inner Liner', size: '50 kg net', notes: 'Standard export packaging' },
      { type: 'Jumbo FIBC Bulk Bag', size: '1,000 kg (1 MT) net', notes: 'Containerized bulk pallet' },
    ],
    moq: { value: 1, unit: '20ft FCL (20–22 MT) — TODO(client)' },
    shelfLife: '60 months stored dry and sealed — TODO(client)',
    storage: 'Store in dry warehouse pallets elevated from floor. Prevent moisture contamination.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Pipavav (INPAV1)', 'Nhava Sheva (INNSA1)'],
    leadTime: '7–10 business days — TODO(client)',
    isFeatured: false,
  },

  // =========================================================================
  // CATEGORY 2: NUTRACEUTICAL RAW MATERIALS
  // =========================================================================
  {
    name: 'Ashwagandha extract',
    category: 'Nutraceutical Raw Materials',
    subCategory: 'Standardized Botanical Extracts',
    slug: 'ashwagandha-extract',
    hsCode: '1302.19',
    botanicalName: 'Withania somnifera',
    origin: ['India (Madhya Pradesh / Rajasthan) — TODO(client)'],
    forms: [
      'Standardized Dry Powder Extract (1.5% to 5.0% Withanolides by HPLC)',
      'High-Concentration Root Extract (10:1 Ratio Extract)',
      'Water-Soluble Granulated Powder',
    ],
    grades: ['Standardized Nutraceutical Grade', 'USP Grade — TODO(client)'],
    shortDescription:
      'HPLC-standardized botanical root extract with certified Withanolide active markers for dietary supplement capsules, functional wellness tablets, and adaptogenic blends.',
    description:
      'Extracted from select dried roots of Indian Withania somnifera using hydro-alcoholic solvent extraction, vacuum concentration, and spray-drying. Standardized to defined concentrations of total withanolides and withaferin A verified by High-Performance Liquid Chromatography (HPLC). Raw botanical ingredient supplied to dietary supplement, nutritional, and herbal tea manufacturers. Regulatory status varies by market; buyers are responsible for compliance in their country. Batch Certificate of Analysis and pesticide residue screening provided with each export consignment — TODO(client).',
    specs: [
      { key: 'Total Withanolides (HPLC, dry basis)', value: '1.5% – 5.0%', unit: '%', verified: false, notes: 'Batch-specific HPLC assay — TODO(client)' },
      { key: 'Withaferin A (HPLC)', value: '< 1.0%', unit: '%', verified: false, notes: 'Monitored root-specific profile' },
      { key: 'Particle Size', value: '100% passing 80 mesh', unit: 'Mesh', verified: false, notes: 'Uniform flowable powder' },
      { key: 'Loss on Drying (Moisture)', value: '≤ 5.0%', unit: 'wt %', verified: false, notes: 'Vacuum oven' },
      { key: 'Total Ash', value: '≤ 8.0%', unit: 'wt %', verified: false, notes: 'USP standard' },
      { key: 'Heavy Metals (Pb ≤ 3, As ≤ 1, Cd ≤ 1, Hg ≤ 0.1 ppm)', value: 'Conforms to USP <2232>', unit: 'ppm', verified: false, notes: 'ICP-MS certified' },
    ],
    attributes: {
      subGroup: 'Standardized Botanical Extracts',
      plantPartUsed: 'Dried roots',
      extractionSolvent: 'Water & Ethanol (Hydroalcoholic)',
      verified: false,
      todo: 'TODO(client) — verify specific Withanolide HPLC percentage range and carrier excipient (maltodextrin percentage if any)',
    },
    packing: [
      { type: 'Fiber Drum with Double Food-Grade PE Bags', size: '25 kg net', notes: 'Tamper-sealed export drum with desiccant' },
      { type: 'Vacuum Aluminum Foil Bag inside Carton', size: '10 kg / 20 kg net', notes: 'Moisture-barrier trial packaging' },
    ],
    moq: { value: 100, unit: 'kg (LCL trial order) or 1 FCL — TODO(client)' },
    shelfLife: '36 months stored sealed in original container — TODO(client)',
    storage: 'Store in a cool, dry area below 25°C away from moisture, heat, and direct light.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)', 'Air Cargo Mumbai (BOM)'],
    leadTime: '10–14 business days — TODO(client)',
    isFeatured: true,
  },
  {
    name: 'Turmeric / curcumin extract',
    category: 'Nutraceutical Raw Materials',
    subCategory: 'Standardized Botanical Extracts',
    slug: 'turmeric-curcumin-extract',
    hsCode: '1302.19',
    botanicalName: 'Curcuma longa',
    origin: ['India (Salem / Alleppey belts) — TODO(client)'],
    forms: [
      'Curcumin 95% Total Curcuminoids Powder (Crystalline / Granular)',
      'Water-Dispersible / Soluble Curcumin Powder',
      'Turmeric Oleoresin (Colorant Grade)',
    ],
    grades: ['Nutraceutical Extract Grade', 'Food Colorant Grade (E100) — TODO(client)'],
    shortDescription:
      'Ultra-potent 95% total curcuminoid botanical extract powder standardized via HPLC for joint wellness dietary supplements, functional foods, and beverage premixes.',
    description:
      'Solvent-extracted from high-curcuminoid rhizomes of Indian Curcuma longa, purified through repeated crystallization to achieve ≥ 95.0% total curcuminoids (Curcumin, Demethoxycurcumin, and Bisdemethoxycurcumin). Sourced from certified Salem and Alleppey growing tracts. Free from synthetic azo dyes, lead chromate, and ethylene oxide. Ingredient for dietary supplements and functional food manufacturers. Regulatory status varies by destination market; buyers are responsible for compliance in their country. Lot-by-lot HPLC fingerprinting and residual solvent testing reports provided — TODO(client).',
    specs: [
      { key: 'Total Curcuminoids (HPLC, dry basis)', value: '≥ 95.0%', unit: 'wt %', verified: false, notes: 'Curcumin + DMC + BDMC — TODO(client)' },
      { key: 'Curcumin Content (HPLC)', value: '70.0% – 80.0%', unit: 'wt %', verified: false, notes: 'Principal biomarker' },
      { key: 'Residual Solvents (USP <467>)', value: 'Conforms to USP limits (Ethanol/Ethyl Acetate < 5,000 ppm)', unit: 'ppm', verified: false, notes: 'Zero Class 1 solvents' },
      { key: 'Loss on Drying', value: '≤ 2.0%', unit: 'wt %', verified: false, notes: 'Standard test' },
      { key: 'Bulk Density', value: '0.40 – 0.70', unit: 'g/ml', verified: false, notes: 'Granular flowable' },
      { key: 'Heavy Metals (Lead, Arsenic, Cadmium, Mercury)', value: '< 10.0 total', unit: 'ppm', verified: false, notes: 'ICP-MS laboratory verification' },
    ],
    attributes: {
      casNumber: '458-37-7',
      subGroup: 'Standardized Botanical Extracts',
      plantPartUsed: 'Dried rhizomes',
      verified: false,
      todo: 'TODO(client) — confirm exact solvent method (Ethanol vs Ethyl Acetate) and carrier percentage',
    },
    packing: [
      { type: 'Fiber Drum with Double PE Food-Grade Liners', size: '20 kg / 25 kg net', notes: 'Export standard with silica gel desiccant' },
      { type: 'Vacuum-Sealed Aluminum Foil Pouch inside Carton', size: '10 kg net', notes: 'Trial and airfreight standard' },
    ],
    moq: { value: 100, unit: 'kg (LCL trial order) or 1 FCL — TODO(client)' },
    shelfLife: '36 months stored protected from sunlight — TODO(client)',
    storage: 'Store in airtight containers in a cool, dark room. Curcuminoids degrade upon prolonged UV exposure.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)', 'Air Cargo Mumbai (BOM)'],
    leadTime: '7–12 business days — TODO(client)',
    isFeatured: true,
  },
  {
    name: 'Boswellia serrata extract',
    category: 'Nutraceutical Raw Materials',
    subCategory: 'Standardized Botanical Extracts',
    slug: 'boswellia-serrata-extract',
    hsCode: '1302.19',
    botanicalName: 'Boswellia serrata',
    origin: ['India (Madhya Pradesh / Gujarat forest belts) — TODO(client)'],
    forms: [
      'Standardized 65% Boswellic Acids Powder (Titration)',
      'Standardized 30% AKBA Powder (HPLC)',
      'Water-Soluble Boswellia Granules',
    ],
    grades: ['Standardized Nutraceutical Grade', 'Phyto-Extract Grade'],
    shortDescription:
      'Standardized gum resin phyto-extract with guaranteed Boswellic acids and AKBA markers for joint mobility supplements, sports nutrition, and wellness capsules.',
    description:
      'Harvested sustainably from the oleo-gum resin of Indian Boswellia serrata (Shallaki / Indian Frankincense). Processed via solvent extraction and standardized to total boswellic acids by titrimetry or 3-O-acetyl-11-keto-beta-boswellic acid (AKBA) by HPLC. Sourced from verified forest belts. Bulk ingredient for dietary supplement tablets, capsules, and topical mobility formulations. Regulatory status varies by market; buyers are responsible for compliance in their country. Complete batch testing for heavy metals and solvent residues provided — TODO(client).',
    specs: [
      { key: 'Total Boswellic Acids (Titration)', value: '≥ 65.0%', unit: 'wt %', verified: false, notes: 'Standard titrimetric assay — TODO(client)' },
      { key: 'AKBA Content (HPLC)', value: '≥ 10.0% – 30.0%', unit: 'wt %', verified: false, notes: 'High-AKBA premium grade available upon request' },
      { key: 'Loss on Drying', value: '≤ 5.0%', unit: 'wt %', verified: false, notes: 'Oven drying' },
      { key: 'Total Ash', value: '≤ 8.0%', unit: 'wt %', verified: false, notes: 'USP standard' },
      { key: 'Particle Size', value: '100% through 80 mesh', unit: 'Mesh', verified: false, notes: 'Fine off-white to cream powder' },
      { key: 'Heavy Metals (Pb, As, Cd, Hg)', value: '< 10.0 total', unit: 'ppm', verified: false, notes: 'ICP-MS' },
    ],
    attributes: {
      subGroup: 'Standardized Botanical Extracts',
      plantPartUsed: 'Oleo-gum resin',
      verified: false,
      todo: 'TODO(client) — verify titration vs HPLC assay guarantee on standard export batches',
    },
    packing: [
      { type: 'Fiber Drum with Double PE Liners', size: '25 kg net', notes: 'Sealed export drum' },
      { type: 'Vacuum Aluminum Foil Bag inside Carton', size: '10 kg net', notes: 'Air shipment packaging' },
    ],
    moq: { value: 100, unit: 'kg (LCL trial order) or 1 FCL — TODO(client)' },
    shelfLife: '36 months stored sealed in cool environment — TODO(client)',
    storage: 'Store in a cool, dry place away from heat and light.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)'],
    leadTime: '10–14 business days — TODO(client)',
    isFeatured: false,
  },
  {
    name: 'Bacopa monnieri extract',
    category: 'Nutraceutical Raw Materials',
    subCategory: 'Standardized Botanical Extracts',
    slug: 'bacopa-monnieri-extract',
    hsCode: '1302.19',
    botanicalName: 'Bacopa monnieri',
    origin: ['India — TODO(client)'],
    forms: [
      'Standardized 20% Bacosides Powder (HPLC / UV)',
      'Standardized 50% Bacosides Powder (UV-Vis)',
      '10:1 Ratio Aqueous Extract Powder',
    ],
    grades: ['Nutraceutical Extract Grade', 'Botanical Active Grade'],
    shortDescription:
      'HPLC-standardized Brahmi whole-herb extract featuring verified Bacosides A & B for cognitive wellness, nootropic formulations, and dietary supplements.',
    description:
      'Manufactured from wildcrafted and cultivated whole herb of Indian Bacopa monnieri (Brahmi). Standardized to defined concentrations of bacosides A and B by spectrophotometric or HPLC assay. Processed under hygienic clean-room conditions with strict microbiological control. Bulk raw material for dietary supplement capsules, nootropic blends, and functional beverages. Regulatory status varies by market; buyers are responsible for compliance in their country. COA, botanical identification (HPTLC), and pesticide residue data supplied per lot — TODO(client).',
    specs: [
      { key: 'Total Bacosides (A & B, HPLC / UV)', value: '20.0% – 50.0%', unit: 'wt %', verified: false, notes: 'Grade dependent — TODO(client)' },
      { key: 'Identification (HPTLC)', value: 'Matches reference botanical standard', unit: 'Test', verified: false, notes: 'Positive identification' },
      { key: 'Loss on Drying', value: '≤ 6.0%', unit: 'wt %', verified: false, notes: 'Standard vacuum drying' },
      { key: 'Total Ash', value: '≤ 10.0%', unit: 'wt %', verified: false, notes: 'USP limit' },
      { key: 'Particle Size', value: '100% through 80 mesh', unit: 'Mesh', verified: false, notes: 'Brownish-green fine powder' },
      { key: 'Total Heavy Metals', value: '< 10.0', unit: 'ppm', verified: false, notes: 'ICP-MS' },
    ],
    attributes: {
      subGroup: 'Standardized Botanical Extracts',
      plantPartUsed: 'Whole aerial herb',
      verified: false,
      todo: 'TODO(client) — verify UV-Vis vs HPLC testing methodology for bacoside quantification',
    },
    packing: [
      { type: 'Fiber Drum with Double PE Liners', size: '25 kg net', notes: 'Export drum with desiccant' },
      { type: 'Aluminum Vacuum Pouch inside Carton', size: '10 kg / 20 kg net', notes: 'Moisture barrier packaging' },
    ],
    moq: { value: 100, unit: 'kg (LCL trial order) or 1 FCL — TODO(client)' },
    shelfLife: '36 months in intact container — TODO(client)',
    storage: 'Store in tightly sealed containers in a cool, dry place protected from ambient humidity.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)'],
    leadTime: '10–14 business days — TODO(client)',
    isFeatured: false,
  },
  {
    name: 'Moringa oleifera extract',
    category: 'Nutraceutical Raw Materials',
    subCategory: 'Standardized Botanical Extracts',
    slug: 'moringa-oleifera-extract',
    hsCode: '1302.19',
    botanicalName: 'Moringa oleifera',
    origin: ['India (Tamil Nadu / Gujarat) — TODO(client)'],
    forms: [
      'Standardized Leaf Extract Powder (10:1 Ratio)',
      'Polyphenol / Saponin Standardized Extract (≥ 5% Polyphenols)',
      'Water-Soluble Fine Green Extract Powder',
    ],
    grades: ['Nutraceutical Grade', 'Functional Food Grade'],
    shortDescription:
      'Concentrated water-soluble drum-dried botanical extract from dried Moringa leaves for superfood greens blends, multivitamin capsules, and wellness beverages.',
    description:
      'Produced from prime shade-dried leaves of Indian Moringa oleifera cultivated in organic agricultural corridors. Extracted using purified water and low-temperature concentration to preserve naturally occurring polyphenols, flavonoids, and chlorophyll pigments without solvent residues. Clean-label botanical raw material for dietary supplement formulations and functional superfood powders. Regulatory status varies by market; buyers are responsible for compliance in their country. COA provided with every lot — TODO(client).',
    specs: [
      { key: 'Extract Ratio', value: '10:1 (or 4:1)', unit: 'Ratio', verified: false, notes: 'Equivalent dry leaf extract — TODO(client)' },
      { key: 'Total Polyphenols (Gallic Acid Equivalent)', value: '≥ 5.0%', unit: 'wt %', verified: false, notes: 'UV Spectrophotometric assay' },
      { key: 'Solubility in Water', value: 'Partially to fully soluble', unit: 'Test', verified: false, notes: 'Fine green powder' },
      { key: 'Loss on Drying', value: '≤ 6.0%', unit: 'wt %', verified: false, notes: 'Standard test' },
      { key: 'Total Ash', value: '≤ 8.0%', unit: 'wt %', verified: false, notes: 'Inorganic mineral residue' },
      { key: 'Microbial Count (Total Plate Count)', value: '< 10,000', unit: 'CFU/g', verified: false, notes: 'Pathogens absent' },
    ],
    attributes: {
      subGroup: 'Standardized Botanical Extracts',
      plantPartUsed: 'Dried leaves',
      verified: false,
      todo: 'TODO(client) — confirm extract ratio and water-solubility grade',
    },
    packing: [
      { type: 'Fiber Drum with Inner Food-Grade Liner', size: '25 kg net', notes: 'Tamper-sealed export drum' },
      { type: 'Multi-Wall Kraft Paper Bag with PE Barrier', size: '20 kg net', notes: 'Palletized export packaging' },
    ],
    moq: { value: 100, unit: 'kg or 1 FCL — TODO(client)' },
    shelfLife: '24 months in sealed original packaging — TODO(client)',
    storage: 'Store in a cool, dark, dry warehouse to maintain chlorophyll stability and avoid photo-oxidation.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)', 'Tuticorin (INTUT1)'],
    leadTime: '7–12 business days — TODO(client)',
    isFeatured: false,
  },
  {
    name: 'Amla extract',
    category: 'Nutraceutical Raw Materials',
    subCategory: 'Standardized Botanical Extracts',
    slug: 'amla-extract',
    hsCode: '1302.19',
    botanicalName: 'Phyllanthus emblica (Emblica officinalis)',
    origin: ['India (Uttar Pradesh / Gujarat) — TODO(client)'],
    forms: [
      'Standardized Tannins Powder (20% to 40% Tannins by Titration)',
      'Standardized Gallic Acid Extract (≥ 5%–10% Gallic Acid by HPLC)',
      'Water-Soluble Spray-Dried Fruit Extract',
    ],
    grades: ['Standardized Extract Grade', 'Nutraceutical / Food Grade'],
    shortDescription:
      'Standardized Indian Gooseberry fruit extract rich in natural tannins and gallic acid for antioxidant supplements, hair wellness formulas, and dietary capsules.',
    description:
      'Extracted from fresh, de-seeded fruits of Indian Phyllanthus emblica (Amla). Sourced from traditional orchards and standardized to defined concentrations of hydrolyzable tannins, emblicanin, and gallic acid. Free from synthetic ascorbic acid adulteration. Raw material for dietary supplements, antioxidant blends, and cosmetic hair wellness formulations. Regulatory status varies by market; buyers are responsible for compliance in their country. Lot-by-lot HPLC testing for active markers and pesticide residue absence provided — TODO(client).',
    specs: [
      { key: 'Total Tannins (Titration / Spectrophotometry)', value: '20.0% – 40.0%', unit: 'wt %', verified: false, notes: 'Standard export assay — TODO(client)' },
      { key: 'Gallic Acid (HPLC)', value: '≥ 5.0%', unit: 'wt %', verified: false, notes: 'HPLC active marker' },
      { key: 'Loss on Drying', value: '≤ 6.0%', unit: 'wt %', verified: false, notes: 'Oven drying' },
      { key: 'Particle Size', value: '100% passing 80 mesh', unit: 'Mesh', verified: false, notes: 'Fine tan to light brown powder' },
      { key: 'Total Ash', value: '≤ 7.0%', unit: 'wt %', verified: false, notes: 'Standard compendial limit' },
      { key: 'Heavy Metals (Pb, As, Cd, Hg)', value: '< 10.0 total', unit: 'ppm', verified: false, notes: 'ICP-MS' },
    ],
    attributes: {
      subGroup: 'Standardized Botanical Extracts',
      plantPartUsed: 'Whole fruit (de-seeded)',
      verified: false,
      todo: 'TODO(client) — confirm tannin assay method and carrier percentage',
    },
    packing: [
      { type: 'Fiber Drum with Double PE Liners', size: '25 kg net', notes: 'Export standard container' },
      { type: 'Aluminum Vacuum Bag inside Carton', size: '10 kg net', notes: 'Airfreight trial packaging' },
    ],
    moq: { value: 100, unit: 'kg or 1 FCL — TODO(client)' },
    shelfLife: '36 months in unopened container — TODO(client)',
    storage: 'Store in cool, dry conditions protected from ambient humidity.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)'],
    leadTime: '10–14 business days — TODO(client)',
    isFeatured: false,
  },
  {
    name: 'Green tea and Garcinia cambogia extracts',
    category: 'Nutraceutical Raw Materials',
    subCategory: 'Standardized Botanical Extracts',
    slug: 'green-tea-and-garcinia-cambogia-extracts',
    hsCode: '1302.19',
    botanicalName: 'Camellia sinensis & Garcinia gummi-gutta (Garcinia cambogia)',
    origin: ['India (Assam / Nilgiri & Western Ghats) — TODO(client)'],
    forms: [
      'Green Tea Extract Powder (50% to 98% Polyphenols, 45% EGCG)',
      'Garcinia Cambogia Extract Powder (50% to 60% Hydroxycitric Acid / HCA)',
      'Pre-Formulated Co-Blend Extract Powder (Custom Ratio)',
    ],
    grades: ['Standardized Extract Grade', 'Nutraceutical Grade'],
    shortDescription:
      'HPLC-standardized botanical extracts of Green Tea (EGCG & Polyphenols) and Garcinia Cambogia (HCA) for metabolic dietary supplements and functional nutrition products.',
    description:
      'High-potency standardized botanical extracts supplied either as discrete single-botanical ingredients or customized manufacturer co-blends. Green tea extract is derived from unfermented Camellia sinensis leaves and standardized for EGCG and total catechins. Garcinia cambogia extract is prepared from dried fruit rinds and standardized for hydroxycitric acid (HCA) calcium/potassium salts. Raw botanical ingredient for dietary supplement tablets, capsules, and metabolic lifestyle nutrition. Regulatory status varies by market; buyers are responsible for compliance in their country. COA provided with each batch — TODO(client).',
    specs: [
      { key: 'Green Tea: Total Polyphenols (UV)', value: '≥ 50.0% – 98.0%', unit: 'wt %', verified: false, notes: 'Grade dependent — TODO(client)' },
      { key: 'Green Tea: EGCG (HPLC)', value: '≥ 45.0%', unit: 'wt %', verified: false, notes: 'Epigallocatechin gallate' },
      { key: 'Garcinia: Hydroxycitric Acid (HCA, HPLC)', value: '≥ 50.0% – 60.0%', unit: 'wt %', verified: false, notes: 'Active acid assay' },
      { key: 'Loss on Drying', value: '≤ 5.0%', unit: 'wt %', verified: false, notes: 'Standard vacuum drying' },
      { key: 'Particle Size', value: '100% through 80 mesh', unit: 'Mesh', verified: false, notes: 'Fine uniform powder' },
      { key: 'Heavy Metals (Pb, As, Cd, Hg)', value: '< 10.0 total', unit: 'ppm', verified: false, notes: 'ICP-MS' },
    ],
    attributes: {
      subGroup: 'Standardized Botanical Extracts',
      verified: false,
      todo: 'TODO(client) — verify whether client provides single extracts, pre-blended formula, or both',
    },
    packing: [
      { type: 'Fiber Drum with Double PE Liners', size: '25 kg net', notes: 'Export standard container' },
      { type: 'Vacuum Aluminum Foil Bag inside Carton', size: '10 kg net', notes: 'Trial packaging' },
    ],
    moq: { value: 100, unit: 'kg or 1 FCL — TODO(client)' },
    shelfLife: '36 months stored sealed — TODO(client)',
    storage: 'Store in a cool, dark, dry warehouse away from heat and direct sunlight.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)', 'Kochi (INCOK1)'],
    leadTime: '10–14 business days — TODO(client)',
    isFeatured: true,
  },
  {
    name: 'Pea protein isolate',
    category: 'Nutraceutical Raw Materials',
    subCategory: 'Plant Proteins & Hydrocolloids',
    slug: 'pea-protein-isolate',
    hsCode: '3504.00',
    botanicalName: 'Pisum sativum',
    origin: ['India — TODO(client)'],
    forms: [
      'Pea Protein Isolate 80% (Food / Shake Grade)',
      'Pea Protein Isolate 85% (High-Protein Functional Grade)',
      'Neutral-Flavor Texturized Pea Protein (TVP)',
    ],
    grades: ['Non-GMO Plant Protein Grade', 'Nutraceutical / Food Grade'],
    shortDescription:
      'High-purity non-GMO plant protein isolate (≥ 80%–85% protein) with complete amino acid profile for vegan protein shakes, sports nutrition powders, and meat analogs.',
    description:
      'Non-GMO yellow pea (Pisum sativum) protein isolated via gentle aqueous extraction, mechanical de-flavoring, and spray drying without chemical solvents. Features an exceptional branched-chain amino acid (BCAA) profile, low allergenic potential (gluten-free, dairy-free, soy-free), and excellent dispersion properties in beverage and baking matrices. Ideal for sports nutrition powders, meal replacement beverages, plant-based dairy alternatives, and extruded meat analogs. Food-grade nutritional ingredient. Batch COA, nutritional panel, and allergen declarations provided — TODO(client).',
    specs: [
      { key: 'Crude Protein (Dry Basis, N × 6.25)', value: '≥ 80.0% – 85.0%', unit: 'wt %', verified: false, notes: 'Kjeldahl method — TODO(client)' },
      { key: 'Moisture Content', value: '≤ 8.0%', unit: 'wt %', verified: false, notes: 'Standard test' },
      { key: 'Fat Content', value: '≤ 8.0%', unit: 'wt %', verified: false, notes: 'Soxhlet extraction' },
      { key: 'Total Ash', value: '≤ 6.0%', unit: 'wt %', verified: false, notes: 'Standard test' },
      { key: 'Particle Size (Mesh)', value: '95% passing 100 mesh', unit: 'Mesh', verified: false, notes: 'Fine creamy powder' },
      { key: 'Microbiological Total Plate Count', value: '< 10,000', unit: 'CFU/g', verified: false, notes: 'Salmonella negative in 25g' },
    ],
    attributes: {
      subGroup: 'Plant Proteins & Hydrocolloids',
      allergenStatus: 'Soy-Free, Dairy-Free, Gluten-Free — TODO(client)',
      verified: false,
      todo: 'TODO(client) — confirm minimum protein guarantee (80% vs 85%) and Non-GMO Project certification status',
    },
    packing: [
      { type: 'Multi-Wall Kraft Paper Bag with PE Inner Liner', size: '20 kg / 25 kg net', notes: 'Food-grade palletized export packaging' },
      { type: 'Jumbo FIBC Tote Bag', size: '500 kg / 1,000 kg net', notes: 'Bulk industrial food manufacturing supply' },
    ],
    moq: { value: 1, unit: 'Metric Tonne (MT) or 1×20ft FCL (~10–12 MT) — TODO(client)' },
    shelfLife: '24 months in unopened packaging — TODO(client)',
    storage: 'Store in dry warehouse elevated from floor away from aromatic chemicals or moisture.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)'],
    leadTime: '10–15 business days — TODO(client)',
    isFeatured: true,
  },
  {
    name: 'Xanthan gum',
    category: 'Nutraceutical Raw Materials',
    subCategory: 'Plant Proteins & Hydrocolloids',
    slug: 'xanthan-gum',
    hsCode: '3913.90',
    origin: ['India — TODO(client)'],
    forms: [
      'Xanthan Gum 80 Mesh (Standard Rapid Dispersion)',
      'Xanthan Gum 200 Mesh (Fine Particle High-Clarity)',
      'Transparent / Clarified Grade',
    ],
    grades: ['Food Grade (FCC / E415)', 'Pharma / Cosmetic Grade — TODO(client)'],
    shortDescription:
      'High-performance polysaccharide hydrocolloid for rheology control, emulsion stabilization, and texture building in food sauces, gluten-free baking, and nutraceutical syrups.',
    description:
      'Xanthan gum is a natural high-molecular-weight polysaccharide produced through aerobic fermentation of carbohydrates with Xanthomonas campestris. It acts as an exceptionally efficient thickening agent, pseudoplastic rheology modifier, and emulsion stabilizer that maintains viscosity stability across wide pH ranges (2 to 12) and temperature fluctuations. Widely utilized in gluten-free baking, salad dressings, sauces, syrup suspensions, liquid vitamins, and personal care cosmetics. Food/Pharma grade ingredient. Comprehensive COA provided — TODO(client).',
    specs: [
      { key: 'Viscosity (1% solution in 1% KCl, 25°C)', value: '1,200 – 1,800', unit: 'mPa.s', verified: false, notes: 'Brookfield LV Viscometer — TODO(client)' },
      { key: 'Loss on Drying (Moisture)', value: '≤ 13.0%', unit: 'wt %', verified: false, notes: 'Compendial oven test' },
      { key: 'pH (1% aqueous solution)', value: '6.0 – 8.0', unit: 'pH', verified: false, notes: 'Standard test' },
      { key: 'Pyruvic Acid Content', value: '≥ 1.5%', unit: 'wt %', verified: false, notes: 'Identity biomarker' },
      { key: 'Total Ash', value: '≤ 13.0%', unit: 'wt %', verified: false, notes: 'Standard limit' },
      { key: 'Heavy Metals (Pb, As)', value: '< 5.0', unit: 'ppm', verified: false, notes: 'Compendial FCC limit' },
    ],
    attributes: {
      casNumber: '11138-66-2',
      subGroup: 'Plant Proteins & Hydrocolloids',
      verified: false,
      todo: 'TODO(client) — confirm mesh size inventory (80 mesh vs 200 mesh) and transparent vs standard grade',
    },
    packing: [
      { type: 'Multi-Wall Kraft Paper Bag with PE Liner', size: '25 kg net', notes: '40 bags per shrink-wrapped export pallet (1 MT)' },
      { type: 'Cardboard Carton with Inner Polybag', size: '20 kg net', notes: 'High-protection packaging' },
    ],
    moq: { value: 1, unit: 'Metric Tonne (MT) or 1 FCL (~18 MT) — TODO(client)' },
    shelfLife: '24 months in tightly closed original packaging — TODO(client)',
    storage: 'Store in cool, dry warehouse protected from ambient humidity to prevent caking.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)'],
    leadTime: '7–12 business days — TODO(client)',
    isFeatured: false,
  },

  // =========================================================================
  // CATEGORY 3: ANIMAL FEED
  // =========================================================================
  {
    name: 'Soybean meal',
    category: 'Animal Feed',
    subCategory: 'Protein Oilseed Meals',
    slug: 'soybean-meal',
    hsCode: '2304.00',
    origin: ['India (Madhya Pradesh / Maharashtra soybean belt) — TODO(client)'],
    forms: [
      'De-Oiled Cake (DOC) Coarse Meal',
      'Hi-Pro Soybean Meal (≥ 46%–48% Protein)',
      'Standard Soybean Meal (≥ 44% Protein)',
      'Soybean Meal Pellets',
    ],
    grades: ['Animal Feed Grade (Non-GMO Verified — TODO(client))'],
    shortDescription:
      'High-protein de-oiled soybean meal (DOC) with balanced amino acid digestibility for commercial poultry feeds, aquaculture diets, swine rations, and cattle feed.',
    description:
      'Solvent-extracted de-oiled soybean cake manufactured from clean, sound Non-GMO Indian yellow soybeans. Processed with controlled toasting to optimize protein solubility while denaturing anti-nutritional trypsin inhibitors and urease enzymes. Characterized by high crude protein content, superior lysine availability, and low residual fiber. Feed ingredient supplied in bulk containerloads for commercial animal feed millers. Typical nutrient parameters shown as industry ranges that must be verified against lot laboratory COA — TODO(client).',
    specs: [
      { key: 'Crude Protein (dry basis)', value: '46.0% – 48.0% (Hi-Pro) / 44.0% (Standard)', unit: 'wt %', verified: false, notes: 'Kjeldahl N × 6.25 — TODO(client)' },
      { key: 'Moisture Content', value: 'Max 11.0% – 12.0%', unit: 'wt %', verified: false, notes: 'Critical for maritime transit stability' },
      { key: 'Crude Fat (Oil Content)', value: '0.8% – 1.5%', unit: 'wt %', verified: false, notes: 'Solvent extracted' },
      { key: 'Crude Fiber', value: 'Max 5.5% – 6.0%', unit: 'wt %', verified: false, notes: 'Low fiber for high poultry energy' },
      { key: 'Sand & Silica (Acid Insoluble Ash)', value: 'Max 1.5% – 2.0%', unit: 'wt %', verified: false, notes: 'Triple screened' },
      { key: 'Urease Activity (pH rise at 30°C)', value: '0.05 – 0.20', unit: 'ΔpH', verified: false, notes: 'Indicates optimal toasting index' },
      { key: 'KOH Protein Solubility', value: '75.0% – 85.0%', unit: '%', verified: false, notes: 'Reflects protein digestibility' },
    ],
    attributes: {
      subGroup: 'Protein Oilseed Meals',
      gmoStatus: 'Non-GMO Indian Origin — TODO(client)',
      verified: false,
      todo: 'TODO(client) — confirm protein guarantee (Hi-Pro 48% vs Standard 44%) and fumigation protocol',
    },
    packing: [
      { type: 'Polypropylene (PP) Woven Bag', size: '50 kg net', notes: 'Standard export feed bag (~20–22 MT per 20ft FCL)' },
      { type: 'Jumbo FIBC Bulk Bag', size: '1,000 kg (1 MT) net', notes: 'Containerized discharge standard' },
      { type: 'Bulk in Container with Liner Bag', size: '20–22 MT per 20ft FCL', notes: 'Economical bulk maritime transit' },
    ],
    moq: { value: 1, unit: '20ft FCL (~20–22 MT) or bulk container rake — TODO(client)' },
    shelfLife: '6–9 months stored in ventilated, cool, pest-controlled silo/warehouse — TODO(client)',
    storage: 'Store in clean, cool, well-ventilated grain warehouses on wooden pallets. Avoid direct humidity and condensation.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Kandla (INIXY1)', 'Pipavav (INPAV1)', 'Nhava Sheva (INNSA1)'],
    leadTime: '10–15 business days — TODO(client)',
    isFeatured: true,
  },
  {
    name: 'Rapeseed / mustard meal',
    category: 'Animal Feed',
    subCategory: 'Protein Oilseed Meals',
    slug: 'rapeseed-mustard-meal',
    hsCode: '2306.41',
    origin: ['India (Rajasthan / Gujarat mustard belts) — TODO(client)'],
    forms: [
      'Solvent-Extracted De-Oiled Meal (Coarse Powder)',
      'Rapeseed / Mustard Feed Pellets',
    ],
    grades: ['Animal Feed Grade (Cattle / Poultry / Aqua)'],
    shortDescription:
      'Economical high-protein de-oiled oilseed meal (≥ 36%–38% Pro-Fat) for commercial ruminant feeds, dairy cattle concentrates, and aquaculture nutrition.',
    description:
      'Extracted from Indian rapeseed/mustard seeds (Brassica campestris / juncea) following commercial oil expelling and solvent extraction. Delivers a favorable balance of sulfur amino acids (methionine and cystine) and phosphorus, serving as a cost-effective protein meal in cattle, buffalo, sheep, and commercial poultry feeds. Cleaned and desolventized to reduce glucosinolate levels. Feed ingredient supplied for commercial livestock and aquafeed manufacturers. Nutrient parameters shown as typical ranges; verify with shipment COA — TODO(client).',
    specs: [
      { key: 'Crude Protein + Fat (Pro-Fat)', value: 'Min 36.0% – 38.0% (Protein typically 35%–37%)', unit: 'wt %', verified: false, notes: 'Standard trade contract basis — TODO(client)' },
      { key: 'Moisture Content', value: 'Max 10.0%', unit: 'wt %', verified: false, notes: 'Preserves storage stability' },
      { key: 'Crude Fat (Residual Oil)', value: '0.8% – 1.5%', unit: 'wt %', verified: false, notes: 'Solvent extracted' },
      { key: 'Crude Fiber', value: 'Max 10.0% – 11.0%', unit: 'wt %', verified: false, notes: 'Standard test' },
      { key: 'Sand & Silica (Acid Insoluble Ash)', value: 'Max 2.0% – 2.5%', unit: 'wt %', verified: false, notes: 'Screened' },
      { key: 'Glucosinolates', value: 'Monitored for livestock safety', unit: 'µmol/g', verified: false, notes: 'Typical range — TODO(client)' },
    ],
    attributes: {
      subGroup: 'Protein Oilseed Meals',
      verified: false,
      todo: 'TODO(client) — verify glucosinolate / erucic acid profile and contract Pro-Fat guarantee',
    },
    packing: [
      { type: 'PP Woven Bags', size: '50 kg net', notes: 'Export standard packaging (~20 MT per 20ft FCL)' },
      { type: 'Jumbo FIBC Bags', size: '1,000 kg net', notes: 'Palletized bulk discharge' },
      { type: 'Bulk Container Liner', size: '20–22 MT per 20ft container', notes: 'Containerized bulk transport' },
    ],
    moq: { value: 1, unit: '20ft FCL (~20 MT) — TODO(client)' },
    shelfLife: '6 months stored under ventilated conditions — TODO(client)',
    storage: 'Store in dry, pest-controlled facilities protected from floor dampness and atmospheric moisture.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Kandla (INIXY1)', 'Pipavav (INPAV1)'],
    leadTime: '10–14 business days — TODO(client)',
    isFeatured: false,
  },
  {
    name: 'Cottonseed meal',
    category: 'Animal Feed',
    subCategory: 'Protein Oilseed Meals',
    slug: 'cottonseed-meal',
    hsCode: '2306.10',
    origin: ['India (Gujarat / Maharashtra cotton growing belts) — TODO(client)'],
    forms: [
      'Decorticated Solvent-Extracted Cottonseed Meal (DOC)',
      'Undecorticated Cottonseed Cake / Flakes',
      'Cottonseed Feed Pellets',
    ],
    grades: ['Ruminant & Dairy Feed Grade'],
    shortDescription:
      'High-energy protein-dense feed meal for dairy cattle, beef ruminants, sheep, and commercial goat rations, optimizing milk yield and fat percentage.',
    description:
      'Produced from delinted and decorticated Indian cottonseeds (Gossypium hirsutum) following oil extraction. Provides high rumen-undegradable bypass protein (RUP), phosphorus, and fiber energy that stimulate butterfat production in lactating dairy cattle and buffalo. De-oiled under controlled heating to inactivate free gossypol and enhance feed safety. Feed ingredient supplied for commercial dairy and ruminant feed millers. Parameters shown as typical trade ranges; verify via lot laboratory certificate — TODO(client).',
    specs: [
      { key: 'Crude Protein (dry basis)', value: '38.0% – 40.0% (Decorticated) / 22.0% (Undecorticated)', unit: 'wt %', verified: false, notes: 'Contract specification dependent — TODO(client)' },
      { key: 'Moisture Content', value: 'Max 10.0%', unit: 'wt %', verified: false, notes: 'Standard test' },
      { key: 'Crude Fat', value: '1.0% – 2.0%', unit: 'wt %', verified: false, notes: 'Solvent extracted DOC' },
      { key: 'Crude Fiber', value: 'Max 12.0% – 14.0%', unit: 'wt %', verified: false, notes: 'Decorticated standard' },
      { key: 'Sand & Silica (Acid Insoluble Ash)', value: 'Max 2.0%', unit: 'wt %', verified: false, notes: 'Mechanical screening' },
      { key: 'Free Gossypol', value: '< 0.05% (500 ppm)', unit: 'wt %', verified: false, notes: 'Safe for ruminant livestock — TODO(client)' },
    ],
    attributes: {
      subGroup: 'Protein Oilseed Meals',
      verified: false,
      todo: 'TODO(client) — confirm Decorticated (38-40% protein) vs Undecorticated supply options and gossypol test limits',
    },
    packing: [
      { type: 'PP Woven Bags', size: '50 kg net', notes: 'Export standard bags (~20 MT per 20ft FCL)' },
      { type: 'Jumbo FIBC Bags', size: '1,000 kg net', notes: 'Bulk handling bags' },
    ],
    moq: { value: 1, unit: '20ft FCL (~20 MT) — TODO(client)' },
    shelfLife: '6 months stored dry and cool — TODO(client)',
    storage: 'Store in well-ventilated, dry storage areas protected from rodent ingress and moisture.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Pipavav (INPAV1)', 'Nhava Sheva (INNSA1)'],
    leadTime: '10–14 business days — TODO(client)',
    isFeatured: false,
  },
  {
    name: 'Feed-grade vitamins and minerals',
    category: 'Animal Feed',
    subCategory: 'Nutritional Premixes & Additives',
    slug: 'feed-grade-vitamins-and-minerals',
    hsCode: '2309.90',
    origin: ['India — TODO(client)'],
    forms: [
      'Concentrated Trace Mineral Premix Powder (Zn, Mn, Fe, Cu, I, Se, Co)',
      'Vitamin Premix Formulation (Vitamin A, D3, E, K3, B-Complex)',
      'Combined Vitamin-Mineral Premix for Poultry / Cattle / Aqua',
      'Feed-Grade Dicalcium Phosphate (DCP) / Mineral Supplements',
    ],
    grades: ['Commercial Animal Feed Grade'],
    shortDescription:
      'Customized feed-grade trace mineral and vitamin premix formulations tailored for poultry broilers/layers, dairy cattle, swine, and commercial aquaculture mills.',
    description:
      'Scientifically blended nutritional premixes manufactured with micro-encapsulated vitamins, bioavailable inorganic and organic chelated trace mineral salts, and anti-caking food-grade carriers. Formulated to meet NRC (National Research Council) nutrient requirements across target livestock growth phases. Feed additive raw material for commercial animal feed manufacturers. Custom premix concentrations and species-specific blending available upon technical specification. Batch Certificate of Analysis and heavy metal screening provided — TODO(client).',
    specs: [
      { key: 'Premix Type & Composition', value: 'Custom formulated per target species (Poultry / Dairy / Aqua)', unit: 'Formula', verified: false, notes: 'Customer recipe or standard — TODO(client)' },
      { key: 'Carrier Matrix', value: 'Rice husk meal / Limestone powder / Corn cob grits', unit: 'Carrier', verified: false, notes: 'Free-flowing anti-caking carrier' },
      { key: 'Particle Size', value: '95% passing 40 – 60 mesh', unit: 'Mesh', verified: false, notes: 'Homogeneous feed dispersion' },
      { key: 'Moisture Content', value: '≤ 6.0%', unit: 'wt %', verified: false, notes: 'Preserves vitamin potency' },
      { key: 'Heavy Metals: Lead (Pb)', value: '≤ 10.0', unit: 'ppm', verified: false, notes: 'Feed safety standard' },
      { key: 'Heavy Metals: Arsenic (As)', value: '≤ 5.0', unit: 'ppm', verified: false, notes: 'Feed safety standard' },
      { key: 'Heavy Metals: Cadmium (Cd)', value: '≤ 2.0', unit: 'ppm', verified: false, notes: 'Feed safety standard' },
    ],
    attributes: {
      subGroup: 'Nutritional Premixes & Additives',
      verified: false,
      todo: 'TODO(client) — confirm species premix formulations (Poultry Broiler/Layer vs Dairy Cattle vs Shrimp Aquafeed)',
    },
    packing: [
      { type: 'Multi-Wall Kraft Paper Bag with PE Barrier', size: '25 kg net', notes: 'Moisture-barrier export packaging' },
      { type: 'Fiber Drum with Double PE Liners', size: '25 kg net', notes: 'High-protection packaging for concentrated vitamin premixes' },
    ],
    moq: { value: 1, unit: 'Metric Tonne (MT) or LCL Pallet (500 kg) — TODO(client)' },
    shelfLife: '12–18 months stored cool and dark — TODO(client)',
    storage: 'Store in a cool, dry place below 25°C away from heat, moisture, and direct sunlight to prevent vitamin degradation.',
    incoterms: ['FOB', 'CIF', 'CFR'],
    ports: ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)'],
    leadTime: '10–15 business days — TODO(client)',
    isFeatured: true,
  },
];

export const seedProducts = async (categoryMap) => {
  logger.info('Seeding 20 new raw material products for JHS GLOBAL...');

  let createdCount = 0;
  let updatedCount = 0;

  for (const item of productsRawData) {
    const parentCat =
      categoryMap.get(item.category) ||
      (await Product.sequelize.models.Category.findOne({ where: { name: item.category } }));

    const subCatKey = `${item.category}::${item.subCategory}`;
    const subCat =
      categoryMap.get(subCatKey) ||
      categoryMap.get(item.subCategory) ||
      (await Product.sequelize.models.Category.findOne({ where: { name: item.subCategory } }));

    const slug = item.slug || createSlug(item.name);

    // Initial illustrative image payload with clear AI / TODO disclaimer
    const imagePayload = [
      {
        url: `/images/products/${slug}.webp`,
        alt: `${item.name} commercial export grade - JHS GLOBAL`,
        isHero: true,
        width: 800,
        height: 600,
        aiGenerated: true,
        disclaimer: 'Illustrative commercial raw material image. Replace with verified batch photography — TODO(client)',
      },
    ];

    const productPayload = {
      name: item.name,
      slug,
      categoryId: parentCat?.id || null,
      subCategoryId: subCat?.id || null,
      hsCode: item.hsCode || '',
      botanicalName: item.botanicalName || null,
      origin: item.origin || ['India — TODO(client)'],
      forms: item.forms || [],
      grades: item.grades || ['Export Grade'],
      shortDescription: item.shortDescription || '',
      description: item.description || '',
      images: imagePayload,
      specs: item.specs || [],
      attributes: item.attributes || { verified: false },
      packing: item.packing || [{ type: 'Standard Export Bag', size: '25 kg', notes: 'Export standard' }],
      moq: item.moq || { value: 1, unit: '20ft FCL' },
      shelfLife: item.shelfLife || '24 months — TODO(client)',
      storage: item.storage || 'Store in a cool, dry place away from direct sunlight.',
      incoterms: item.incoterms || ['FOB', 'CIF', 'CFR'],
      ports: item.ports || ['Mundra (INMUN1)', 'Nhava Sheva (INNSA1)'],
      leadTime: item.leadTime || '10–15 business days — TODO(client)',
      tags: [
        item.name.toLowerCase(),
        ...(item.forms || []).map((f) => f.toLowerCase()),
        item.category.toLowerCase(),
        (item.subCategory || '').toLowerCase(),
      ],
      isFeatured: Boolean(item.isFeatured),
      isActive: true,
      isPrivateLabelAvailable: true,
      seo: {
        title: `${item.name} Bulk Exporter India | JHS GLOBAL`,
        description: `${item.shortDescription || item.name} exported from India with verified laboratory specifications and compliant documentation.`,
        keywords: [
          item.name.toLowerCase(),
          `${item.name.toLowerCase()} exporter`,
          'b2b raw materials india',
          item.hsCode ? `hs ${item.hsCode}` : '',
        ].filter(Boolean),
      },
    };

    let product = await Product.findOne({ where: { slug } });
    if (!product) {
      await Product.create(productPayload);
      createdCount++;
      logger.info(`  Created product: ${item.name} (${slug})`);
    } else {
      await product.update(productPayload);
      updatedCount++;
      logger.info(`  Updated product: ${item.name} (${slug})`);
    }
  }

  logger.info(
    `Products seeding completed: ${createdCount} created, ${updatedCount} updated (Total: ${productsRawData.length} products)`
  );
};

export default seedProducts;
