import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Package } from 'lucide-react';
import { useQuoteBasket } from '../../features/quoteBasket/context';
import Button from '../ui/Button';

export const ProductCard = ({ product }) => {
  const { addItem } = useQuoteBasket();

  const primaryImage = product.images?.[0]?.url;
  const moqText = product.moq ? `${product.moq.value} ${product.moq.unit}` : '1x 20ft FCL';
  const packingText = product.packing?.[0]
    ? `${product.packing[0].type} (${product.packing[0].size})`
    : '25 kg PP Bags';
  const originText = Array.isArray(product.origin) ? product.origin.join(', ') : 'India';

  return (
    <article
      className="group rounded-xl border border-surface-border bg-surface-card hover:border-accent-500/50 hover:shadow-card hover:-translate-y-1 transition-all duration-300 transform-gpu flex flex-col justify-between overflow-hidden"
      style={{ transitionTimingFunction: 'var(--ease-standard)' }}
    >
      <div>
        {/* Card Header & Media Container */}
        <div className="relative aspect-[4/3] bg-neutral-100 border-b border-surface-border overflow-hidden flex items-center justify-center">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 transform-gpu"
              style={{ transitionTimingFunction: 'var(--ease-standard)' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}

          {/* Clean Placeholder when image is missing */}
          <div
            className={`w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-neutral-50 to-neutral-200 ${
              primaryImage ? 'hidden' : 'flex'
            }`}
          >
            <Package className="w-10 h-10 text-neutral-400 mb-2 group-hover:scale-105 transition-transform duration-300" />
            <span className="font-serif font-semibold text-neutral-700 text-sm">{product.name}</span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
              Specification on Request
            </span>
          </div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="font-mono text-[11px] font-semibold bg-primary-800 text-white px-2 py-0.5 rounded shadow-sm">
              HS {product.hsCode}
            </span>
            {product.isFeatured && (
              <span className="text-[10px] font-semibold bg-accent-500 text-white px-2 py-0.5 rounded shadow-sm">
                Export Grade
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {product.categoryId && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-600 block mb-1">
              {product.categoryId.name}
            </span>
          )}

          <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-900 group-hover:text-primary-800 transition-colors duration-150 leading-snug line-clamp-2 min-h-[2.75rem] flex items-center">
            <Link to={`/products/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>

          <p className="mt-2 text-xs text-neutral-600 line-clamp-2 leading-relaxed">
            {product.shortDescription || 'Manufacturer-grade raw material meeting international specifications.'}
          </p>

          {/* Specifications Snapshot */}
          <div className="mt-4 pt-3 border-t border-surface-border space-y-1.5 text-xs text-neutral-600">
            <div className="flex items-start justify-between gap-2">
              <span className="text-neutral-500 shrink-0 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Origin:</span>
              </span>
              <span className="font-medium text-neutral-800 text-right truncate max-w-[170px]" title={originText}>
                {originText}
              </span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-neutral-500 shrink-0">MOQ:</span>
              <span className="font-medium text-neutral-800 text-right truncate max-w-[170px]" title={moqText}>
                {moqText}
              </span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-neutral-500 shrink-0">Packing:</span>
              <span className="font-medium text-neutral-800 text-right truncate max-w-[170px]" title={packingText}>
                {packingText}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Controls */}
      <div className="p-4 sm:p-5 pt-0 grid grid-cols-2 gap-2">
        <Link
          to={`/products/${product.slug}`}
          className="w-full inline-flex items-center justify-center text-xs font-semibold px-2 sm:px-3 py-2 rounded-lg border border-neutral-300 hover:border-primary-800 text-neutral-700 hover:text-primary-800 hover:bg-neutral-50 active:scale-[0.98] transition-all duration-150 min-h-[44px] lg:min-h-0 lg:h-10 whitespace-nowrap"
        >
          <span>View Specs</span>
        </Link>

        <Button
          variant="cta"
          size="sm"
          onClick={() => addItem(product, 1, product.moq?.unit || '20ft FCL')}
          className="w-full flex items-center justify-center gap-1.5 text-xs shadow-none min-h-[44px] lg:min-h-0 lg:h-10 px-2 whitespace-nowrap group/btn"
          aria-label={`Add ${product.name} to Quote Basket`}
        >
          <Plus className="w-3.5 h-3.5 shrink-0 group-hover/btn:rotate-90 transition-transform duration-200" />
          <span>Add to Quote</span>
        </Button>
      </div>
    </article>
  );
};

export default ProductCard;
