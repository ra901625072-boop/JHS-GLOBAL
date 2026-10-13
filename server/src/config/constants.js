export const PRODUCT_CATEGORIES = [
  'Herbal Powder',
  'Spices and Seasoning',
  'Superfoods',
  'Personal Care Raw Materials',
  'Pulses, Rice & Agriculture Commodities',
  'Fresh Fruit & Vegetables',
  'Animal Feed',
  'Nutraceutical Raw Materials',
  'Dehydrated Vegetables & Fruit',
  'Others',
];

export const INCOTERMS = ['FOB', 'CIF', 'CFR', 'EXW', 'CIP', 'DDP'];

export const BUYER_TYPES = [
  'importer',
  'distributor',
  'manufacturer',
  'retailer',
  'other',
];

export const INQUIRY_STATUSES = [
  'new',
  'contacted',
  'requirement_confirmed',
  'quotation_preparing',
  'quotation_sent',
  'negotiation',
  'confirmed',
  'order_processing',
  'completed',
  'rejected',
  'lost',
  'on_hold',
  // Backward compatibility with initial seeds/tests
  'in_review',
  'quoted',
  'sample_sent',
  'won',
  'spam',
];

export const INQUIRY_PRIORITIES = ['hot', 'warm', 'cold'];

export const USER_ROLES = ['admin', 'sales', 'editor'];

export const UNITS = ['MT', 'kg', 'FCL', '20ft FCL', '40ft FCL', 'metric ton'];
