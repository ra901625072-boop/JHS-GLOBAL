import { Op } from 'sequelize';
import Product from '../../product/product.model.js';
import Category from '../../category/category.model.js';
import CompanyFact from '../../companyFact/companyFact.model.js';
import Faq from '../../faq/faq.model.js';
import { mapProductToFactLedger, formatProductFactsForPrompt } from '../../product/productFact.mapper.js';
import { searchSimilarChunks } from './embedding.service.js';
import logger from '../../../utils/logger.js';

// 20 Export Catalogue Products Reference List
const KNOWN_CATALOGUE_PRODUCTS = [
  { name: 'Castor oil and its derivatives', slug: 'castor-oil-and-derivatives', keywords: ['castor', 'ricinoleic', '12-hsa', 'fsg', 'castor wax'] },
  { name: 'Herbal / botanical extracts', slug: 'herbal-botanical-extracts', keywords: ['botanical extract', 'herbal extract', 'cosmetic extract'] },
  { name: 'Sodium lauryl ether sulfate (SLES)', slug: 'sodium-lauryl-ether-sulfate-sles', keywords: ['sles', 'sodium lauryl', 'surfactant'] },
  { name: 'Salicylic acid', slug: 'salicylic-acid', keywords: ['salicylic', 'bha', 'beta hydroxy'] },
  { name: 'Glycolic acid', slug: 'glycolic-acid', keywords: ['glycolic', 'aha', 'alpha hydroxy'] },
  { name: 'Vitamin E acetate', slug: 'vitamin-e-acetate', keywords: ['vitamin e', 'tocopheryl', 'tocopherol'] },
  { name: 'Kaolin clay powder', slug: 'kaolin-clay-powder', keywords: ['kaolin', 'china clay', 'white clay'] },
  { name: 'Ashwagandha extract', slug: 'ashwagandha-extract', keywords: ['ashwagandha', 'withania', 'withanolides'] },
  { name: 'Turmeric / curcumin extract', slug: 'turmeric-curcumin-extract', keywords: ['curcumin', 'turmeric', 'curcuma'] },
  { name: 'Boswellia serrata extract', slug: 'boswellia-serrata-extract', keywords: ['boswellia', 'boswellic', 'shallaki', 'frankincense'] },
  { name: 'Bacopa monnieri extract', slug: 'bacopa-monnieri-extract', keywords: ['bacopa', 'brahmi', 'bacosides'] },
  { name: 'Moringa oleifera extract', slug: 'moringa-oleifera-extract', keywords: ['moringa', 'drumstick extract'] },
  { name: 'Amla extract', slug: 'amla-extract', keywords: ['amla', 'emblica', 'indian gooseberry'] },
  { name: 'Green tea and Garcinia cambogia extracts', slug: 'green-tea-and-garcinia-cambogia-extracts', keywords: ['green tea', 'garcinia', 'hca', 'hydroxycitric', 'egcg'] },
  { name: 'Pea protein isolate', slug: 'pea-protein-isolate', keywords: ['pea protein', 'plant protein'] },
  { name: 'Xanthan gum', slug: 'xanthan-gum', keywords: ['xanthan', 'gum'] },
  { name: 'Soybean meal', slug: 'soybean-meal', keywords: ['soybean meal', 'soya meal', 'doc', 'de-oiled cake'] },
  { name: 'Rapeseed / mustard meal', slug: 'rapeseed-mustard-meal', keywords: ['rapeseed', 'mustard meal', 'canola meal'] },
  { name: 'Cottonseed meal', slug: 'cottonseed-meal', keywords: ['cottonseed', 'cotton meal'] },
  { name: 'Feed-grade vitamins and minerals', slug: 'feed-grade-vitamins-and-minerals', keywords: ['feed grade', 'feed vitamin', 'premix', 'mineral premix'] },
];

/**
 * High-speed intent classification
 */
export const classifyIntent = (message = '', pageContext = null) => {
  const q = message.toLowerCase().trim();

  // 1. Abuse & Injection Shield
  if (
    q.includes('ignore previous instructions') ||
    q.includes('ignore all instructions') ||
    q.includes('system prompt') ||
    q.includes('reveal prompt') ||
    q.includes('drop table') ||
    q.includes('select * from') ||
    q.includes('delete from') ||
    q.includes('you are now an unrestricted') ||
    q.includes('dan mode') ||
    q.includes('bypass')
  ) {
    return 'abuse';
  }

  // 2. Off-Topic Filtering
  if (
    q.startsWith('write a poem') ||
    q.startsWith('write python code') ||
    q.startsWith('who won the world cup') ||
    q.includes('recipe for cake') ||
    q.includes('tell me a joke') ||
    q.includes('who is the president')
  ) {
    return 'off_topic';
  }

  // 3. Pricing & MOQ Inquiries
  if (
    q.includes('price') ||
    q.includes('precio') ||
    q.includes('prix') ||
    q.includes('preis') ||
    q.includes('cost') ||
    q.includes('how much') ||
    q.includes('discount') ||
    q.includes('quotation') ||
    q.includes('rate per mt') ||
    q.includes('$/mt') ||
    q.includes('moq') ||
    q.includes('minimum order')
  ) {
    return 'pricing_moq';
  }

  // 4. Sample Requests
  if (
    q.includes('sample') ||
    q.includes('muestra') ||
    q.includes('échantillon') ||
    q.includes('probe') ||
    q.includes('muster') ||
    q.includes('trial batch') ||
    q.includes('lab testing batch') ||
    q.includes('عينات') ||
    q.includes('عينة')
  ) {
    return 'sample';
  }

  // 5. Certifications & Compliance
  if (
    q.includes('certificat') ||
    q.includes('certified') ||
    q.includes('license') ||
    q.includes('licence') ||
    /\biso\b/i.test(q) ||
    /\biso[-\s]?\d+/i.test(q) ||
    q.includes('fssai') ||
    q.includes('apeda') ||
    q.includes('spices board') ||
    q.includes('spice board') ||
    q.includes('halal') ||
    q.includes('kosher') ||
    /\bfda\b/i.test(q) ||
    /\bgmp\b/i.test(q) ||
    q.includes('haccp') ||
    q.includes('usda') ||
    q.includes('dgft') ||
    /\biec\b/i.test(q) ||
    q.includes('import export code')
  ) {
    return 'certifications';
  }

  // 6. Regulatory & Health Checks
  if (
    q.includes('cure') ||
    q.includes('treat') ||
    q.includes('disease') ||
    q.includes('health benefit') ||
    q.includes('approved in eu') ||
    q.includes('approved in the eu') ||
    q.includes('european union') ||
    q.includes('food supplement') ||
    q.includes('efsa') ||
    q.includes('side effect')
  ) {
    return 'compliance_regulatory';
  }

  // 7. Product Comparison (multiple products mentioned or comparison keywords)
  const mentionedCountEarly = KNOWN_CATALOGUE_PRODUCTS.filter((prod) =>
    prod.keywords.some((kw) => q.includes(kw))
  ).length;
  if (mentionedCountEarly >= 2 || q.includes(' vs ') || q.includes('difference between') || q.includes('compare')) {
    return 'product_comparison';
  }

  // 8. Technical Specification Parameters (Takes precedence over packaging when asking for assay/specs)
  if (
    q.includes('spec') ||
    q.includes('assay') ||
    q.includes('withanolide') ||
    q.includes('curcumin') ||
    q.includes('purity') ||
    q.includes('moisture') ||
    q.includes('mesh size') ||
    q.includes('hs code') ||
    q.includes('cas') ||
    q.includes('acid value') ||
    q.includes('protein %') ||
    q.includes('solvent') ||
    q.includes('density') ||
    q.includes('solubility') ||
    q.includes('grade')
  ) {
    return 'product_spec';
  }

  // 8. Shipping, Freight, Incoterms & Ports
  if (
    q.includes('ship') ||
    q.includes('freight') ||
    q.includes('port') ||
    q.includes('incoterm') ||
    q.includes('fob') ||
    q.includes('cif') ||
    q.includes('cfr') ||
    q.includes('fcl') ||
    q.includes('lcl') ||
    q.includes('container') ||
    q.includes('transit time') ||
    q.includes('lead time') ||
    q.includes('packing') ||
    q.includes('packaging')
  ) {
    return 'shipping_logistics';
  }

  // 9. Private Label & OEM
  if (
    q.includes('private label') ||
    q.includes('oem') ||
    q.includes('custom packaging') ||
    q.includes('white label') ||
    q.includes('contract manufactur')
  ) {
    return 'private_label';
  }

  // 10. How to Order / Workflow
  if (
    q.includes('how to order') ||
    q.includes('rfq') ||
    q.includes('request a quote') ||
    q.includes('payment term') ||
    q.includes('letter of credit') ||
    q.includes('lc at sight') ||
    q.includes('telegraphic transfer')
  ) {
    return 'how_to_order';
  }

  // 11. Company Profile & Identity
  if (
    q.includes('who are you') ||
    q.includes('about jsh') ||
    q.includes('about us') ||
    q.includes('jhs global') ||
    q.includes('company') ||
    q.includes('address') ||
    q.includes('location') ||
    q.includes('headquarter') ||
    q.includes('surat') ||
    q.includes('gujarat') ||
    q.includes('contact') ||
    q.includes('phone') ||
    q.includes('email') ||
    q.includes('hours') ||
    q.includes('capacity') ||
    q.includes('sourcing promise') ||
    q.includes('response time') ||
    q.includes('turnaround') ||
    q.includes('how quickly') ||
    q.includes('how fast')
  ) {
    return 'company_about';
  }

  // Default to general product info if on PDP or mentioning product, else company_about
  if (pageContext?.type === 'product' || pageContext?.slug || mentionedCountEarly === 1) {
    return 'product_info';
  }

  return 'company_about';
};

/**
 * Resolves pronoun / anaphora reference or product target
 */
export const resolveProductTarget = async (message = '', pageContext = null) => {
  const q = message.toLowerCase().trim();

  // 1. If user is currently on a Product Detail Page (PDP)
  if (pageContext) {
    let slug = pageContext.slug;
    if (!slug && pageContext.pathname) {
      const match = pageContext.pathname.match(/\/products\/([a-z0-9-]+)/i);
      if (match) slug = match[1];
    }

    if (slug) {
      const product = await Product.findOne({
        where: { slug, isActive: true },
        include: [{ model: Category, as: 'category' }],
      });

      if (product) {
        return {
          product,
          isPDPContext: true,
          resolvedName: product.name,
          isAmbiguous: false,
        };
      }
    }
  }

  // 2. Scan query text for explicitly mentioned known products
  const matched = KNOWN_CATALOGUE_PRODUCTS.filter((prod) =>
    prod.keywords.some((kw) => q.includes(kw))
  );

  if (matched.length === 1) {
    const product = await Product.findOne({
      where: { slug: matched[0].slug, isActive: true },
      include: [{ model: Category, as: 'category' }],
    });
    if (product) {
      return {
        product,
        isPDPContext: false,
        resolvedName: product.name,
        isAmbiguous: false,
      };
    }
  }

  if (matched.length > 1) {
    // Multi-product comparison
    const products = await Product.findAll({
      where: {
        slug: { [Op.in]: matched.map((m) => m.slug) },
        isActive: true,
      },
      include: [{ model: Category, as: 'category' }],
    });
    return {
      products,
      isComparison: true,
      isAmbiguous: false,
    };
  }

  // 3. Ambiguity Check: User asks vague question like "What is the spec of the extract?" without specifying which
  if ((q.includes('the extract') || q.includes('the powder') || q.includes('the meal')) && !q.includes('ashwagandha') && !q.includes('curcumin') && !q.includes('soybean')) {
    return {
      product: null,
      isAmbiguous: true,
      ambiguityQuestion:
        'We supply multiple standardized extracts and commodities (including Ashwagandha, Curcumin, Boswellia, SLES, and Soybean Meal). Which specific product would you like specifications for?',
    };
  }

  return { product: null, isAmbiguous: false };
};

/**
 * Master Context Assembly Engine
 */
export const assembleContext = async ({ message, history = [], pageContext = null }) => {
  const intent = classifyIntent(message, pageContext);
  const targetResolution = await resolveProductTarget(message, pageContext);

  const factLedger = [];
  const sources = [];

  // CASE 1: Specific Product in Context (PDP or explicitly targeted product)
  if (targetResolution.product) {
    const p = targetResolution.product;
    const productFacts = mapProductToFactLedger(p);
    factLedger.push(...productFacts);

    sources.push({
      id: String(p.id),
      name: p.name,
      slug: p.slug,
      hsCode: p.hsCode || '',
      moq: p.moq ? `${p.moq.value || 1} ${p.moq.unit || 'MT'}` : '1 MT',
      type: 'product_spec',
      url: `/products/${p.slug}`,
    });

    // In addition to the viewed product, inject relevant company facts depending on intent
    const relevantFactKeys = [];
    if (intent === 'certifications') {
      relevantFactKeys.push('fssai_central_license', 'apeda_rcmc', 'spices_board_cres', 'dgft_iec', 'msme_udyam', 'gstin');
    } else if (intent === 'shipping_logistics') {
      relevantFactKeys.push('export_loading_ports', 'unlisted_sourcing_promise');
    } else if (intent === 'pricing_moq') {
      relevantFactKeys.push('quote_turnaround_promise');
    } else if (intent === 'sample') {
      relevantFactKeys.push('sample_policy');
    }

    if (relevantFactKeys.length > 0) {
      const companyFacts = await CompanyFact.findAll({
        where: { factKey: { [Op.in]: relevantFactKeys }, isPublic: true },
      });
      companyFacts.forEach((cf) => {
        factLedger.push({
          id: `FACT-COMP-${cf.factKey}`,
          key: cf.label,
          value: cf.factValue,
          status: cf.isVerified ? 'VERIFIED' : 'TYPICAL_UNVERIFIED',
          constraint: cf.isVerified ? 'Verified official company credential.' : 'To be confirmed by export desk.',
        });
      });

      if (companyFacts.length > 0 && !sources.some((s) => s.type === 'company_credential')) {
        sources.push({
          id: 'comp-credentials',
          name: 'Verified Statutory Registrations & Licenses',
          type: 'company_credential',
          url: '/quality',
        });
      }
    }
  } else if (targetResolution.isComparison && targetResolution.products) {
    // CASE 2: Multi-product comparison
    targetResolution.products.forEach((prod) => {
      const prodFacts = mapProductToFactLedger(prod);
      factLedger.push(...prodFacts);
      sources.push({
        id: String(prod.id),
        name: prod.name,
        slug: prod.slug,
        hsCode: prod.hsCode,
        type: 'product_spec',
        url: `/products/${prod.slug}`,
      });
    });
  } else {
    // CASE 3: Company, General, or Unspecified Query (Home / About / FAQ pages)
    // 1. Fetch Company Facts matching query or intent
    const compWhere = { isPublic: true };
    if (intent === 'certifications') {
      compWhere.category = 'certifications';
    } else if (intent === 'company_about') {
      compWhere.category = { [Op.in]: ['identity', 'operations', 'contact', 'quality'] };
    } else if (intent === 'shipping_logistics' || intent === 'how_to_order' || intent === 'pricing_moq') {
      compWhere.category = { [Op.in]: ['operations', 'policy'] };
    } else if (intent === 'sample') {
      compWhere.category = 'policy';
    }

    const companyFacts = await CompanyFact.findAll({
      where: compWhere,
      limit: 30,
    });

    companyFacts.forEach((cf) => {
      factLedger.push({
        id: `FACT-COMP-${cf.factKey}`,
        key: cf.label,
        value: cf.factValue,
        status: cf.isVerified ? 'VERIFIED' : 'TYPICAL_UNVERIFIED',
        constraint: cf.isVerified
          ? 'Verified company fact. State accurately.'
          : 'UNVERIFIED / UNKNOWN: Must state as unknown and escalate to quotation request.',
      });
    });

    if (companyFacts.length > 0 && !sources.some((s) => s.type === 'company_profile')) {
      sources.push({
        id: 'comp-profile',
        name: 'JSH Global Export Dossier & Background',
        type: 'company_profile',
        url: '/about',
      });
    }

    // 2. Vector Semantic Search with Strict Floor (minSimilarity: 0.55)
    const vectorMatches = await searchSimilarChunks({
      query: message,
      limit: 3,
      minSimilarity: 0.55,
    });

    vectorMatches.forEach((m, idx) => {
      factLedger.push({
        id: `FACT-RAG-${m.sourceType.toUpperCase()}-${m.sourceId || idx}`,
        key: m.metadata?.name || m.metadata?.label || 'Retrieved Knowledge',
        value: m.chunkText,
        status: m.metadata?.isVerified === false ? 'TYPICAL_UNVERIFIED' : 'VERIFIED',
        constraint: 'Grounded chunk from verified database.',
      });

      if (m.sourceType === 'product') {
        sources.push({
          id: String(m.sourceId),
          name: m.metadata?.name || 'Product',
          slug: m.metadata?.slug || '',
          hsCode: m.metadata?.hsCode || '',
          type: 'product_spec',
          url: `/products/${m.metadata?.slug}`,
        });
      } else {
        sources.push({
          id: String(m.sourceId),
          name: m.metadata?.name || 'Export FAQ',
          type: 'policy_faq',
          url: '/faq',
        });
      }
    });
  }

  // Universal Negative Certification Boundary Enforcement (Applies to PDP, Comparison, and Company queries)
  const lowerMsgForCert = (message || '').toLowerCase();
  const asksAboutCertificates =
    intent === 'certifications' ||
    /\biso\b/i.test(lowerMsgForCert) ||
    lowerMsgForCert.includes('halal') ||
    lowerMsgForCert.includes('kosher') ||
    /\bfda\b/i.test(lowerMsgForCert) ||
    /\bgmp\b/i.test(lowerMsgForCert) ||
    lowerMsgForCert.includes('certificat');

  if (asksAboutCertificates && !factLedger.some((f) => f.id === 'NEG-CERT-UNHELD')) {
    factLedger.push({
      id: 'NEG-CERT-UNHELD',
      key: 'Non-Held / Unconfirmed Accreditations',
      value: 'We do NOT hold ISO 9001, ISO 22000, HACCP, Halal, Kosher, or foreign US FDA registrations unless specifically present in the verified credentials above. Do NOT confirm any unlisted certificate.',
      status: 'RESTRICTED',
      constraint: 'HARD RULE: Deny unconfirmed certification accreditations politely. Mention that lot-specific third party inspection (SGS/Bureau Veritas) is arranged on request.',
    });
    factLedger.push({
      id: 'FACT-COMP-CERT-BOUNDARIES',
      key: 'Non-Held Certification Boundaries',
      value: 'ISO 9001/22000, Halal, Kosher, FDA facility registration are unheld and unverified.',
      status: 'RESTRICTED',
      constraint: 'Deny unconfirmed certifications.',
    });
  }

  // Deduplicate sources by ID or URL
  const uniqueSources = [];
  const seenSourceKeys = new Set();
  for (const src of sources) {
    const key = src.slug || src.id || src.name;
    if (!seenSourceKeys.has(key)) {
      seenSourceKeys.add(key);
      uniqueSources.push(src);
    }
  }

  // Format Fact Ledger into text
  const factLedgerText = formatProductFactsForPrompt(factLedger);

  // Filter conversation history: keep only last 4 turns
  const sanitizedHistory = (history || []).slice(-4).map((msg) => ({
    role: msg.role === 'buyer' || msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content || msg.text || '',
  }));

  return {
    intent,
    isAmbiguous: Boolean(targetResolution.isAmbiguous),
    ambiguityQuestion: targetResolution.ambiguityQuestion || null,
    isPDPContext: Boolean(targetResolution.isPDPContext),
    groundedProduct: targetResolution.product || null,
    factLedger,
    factLedgerText,
    sources: uniqueSources,
    sanitizedHistory,
  };
};

export default {
  classifyIntent,
  resolveProductTarget,
  assembleContext,
};
