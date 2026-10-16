export const PRODUCT_CATEGORIES = [
  'Personal Care Raw Materials',
  'Nutraceutical Raw Materials',
  'Animal Feed',
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
  'in_review',
  'quoted',
  'sample_sent',
  'negotiation',
  'won',
  'lost',
  'spam',
  // Backward compatibility aliases
  'contacted',
  'requirement_confirmed',
  'quotation_preparing',
  'quotation_sent',
  'confirmed',
  'order_processing',
  'completed',
  'rejected',
  'on_hold',
];

export const INQUIRY_PRIORITIES = ['hot', 'warm', 'cold'];

export const USER_ROLES = ['admin', 'sales', 'editor', 'viewer'];

export const UNITS = ['MT', 'kg', 'FCL', '20ft FCL', '40ft FCL', 'metric ton'];
