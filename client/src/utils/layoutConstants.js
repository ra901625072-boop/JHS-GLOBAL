/**
 * Shared Layout Dimension Contracts for Zero-CLS Stability
 *
 * Skeletons and real components share these exact Tailwind classes and dimensions
 * to guarantee Cumulative Layout Shift (CLS) = 0 across viewports.
 */

export const PRODUCT_CARD_LAYOUT = {
  article:
    'group rounded-xl border border-surface-border bg-surface-card flex flex-col justify-between overflow-hidden',
  mediaContainer:
    'relative aspect-[4/3] bg-neutral-100 border-b border-surface-border overflow-hidden flex items-center justify-center',
  body: 'p-5',
  category: 'text-[11px] font-semibold uppercase tracking-wider block mb-1',
  title:
    'font-serif text-base sm:text-lg font-bold leading-snug line-clamp-2 min-h-[2.75rem] flex items-center',
  description: 'mt-2 text-xs line-clamp-2 leading-relaxed min-h-[2.25rem]',
  specSnapshot: 'mt-4 pt-3 border-t border-surface-border space-y-1.5 text-xs',
  actionGrid: 'p-4 sm:p-5 pt-0 grid grid-cols-2 gap-2',
  actionButton: 'min-h-[44px] lg:min-h-0 lg:h-10 rounded-lg',
};

export const PRODUCT_GRID_LAYOUT = {
  featured: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',
  listing: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
  related: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',
};

export const SPEC_TABLE_LAYOUT = {
  container: 'overflow-hidden rounded-xl border border-surface-border bg-white shadow-subtle',
  header: 'bg-surface-subtle px-4 sm:px-5 py-3 border-b border-surface-border',
  mobileCard: 'p-3.5 rounded-xl border border-surface-border bg-neutral-50/70 space-y-1.5',
  tableHeaderCell: 'py-3 px-5',
  tableBodyCell: 'py-3.5 px-5',
};

export const CERTIFICATE_CARD_LAYOUT = {
  card: 'bg-white rounded-2xl border border-surface-border p-5 shadow-subtle flex flex-col justify-between',
  media: 'relative aspect-[1/1.22] w-full bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200/80 p-2 sm:p-3 flex items-center justify-center',
  footer: 'pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between',
};

export const BLOG_CARD_LAYOUT = {
  card: 'bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs flex flex-col justify-between',
  body: 'p-6',
  footer: 'px-6 pb-6 pt-3 border-t border-neutral-100 flex items-center justify-between mt-auto',
};

export const ADMIN_STAT_CARD_LAYOUT = {
  card: 'relative rounded-xl border p-5 shadow-subtle flex flex-col justify-between',
};
