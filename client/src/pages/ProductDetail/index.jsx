import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShieldCheck,
  Package,
  Anchor,
  Plus,
  MessageCircle,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useProduct, useRelatedProducts } from '../../features/products/hooks';
import { useQuoteBasket } from '../../features/quoteBasket/context';
import ProductGallery from '../../components/product/ProductGallery';
import SpecTable from '../../components/product/SpecTable';
import ProductCard from '../../components/product/ProductCard';
import Button from '../../components/ui/Button';
import Reveal from '../../components/ui/Reveal';
import JsonLd, { createProductSchema, createBreadcrumbSchema } from '../../components/seo/JsonLd';
import UnlistedSourcingBanner from '../../components/common/UnlistedSourcingBanner';
import { getRedirectUrlForSlug } from '../../utils/redirects';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useQuoteBasket();

  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderUnit, setOrderUnit] = useState('20ft FCL');
  const [selectedPacking, setSelectedPacking] = useState('');

  const { data: product, isLoading, isError, error } = useProduct(slug);
  const { data: relatedProducts = [] } = useRelatedProducts(slug);

  // Automatic 301-equivalent client redirect for legacy products
  useEffect(() => {
    const redirectTarget = getRedirectUrlForSlug(slug, 'product');
    if (redirectTarget && (isError || (!isLoading && !product))) {
      navigate(redirectTarget, { replace: true });
    }
  }, [slug, isError, isLoading, product, navigate]);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+917202907720';

  if (isLoading) {
    return (
      <div className="py-16 px-4 max-w-7xl mx-auto space-y-8">
        <div className="h-6 w-48 bg-neutral-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="h-96 bg-neutral-100 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-10 bg-neutral-100 rounded animate-pulse" />
            <div className="h-24 bg-neutral-100 rounded animate-pulse" />
            <div className="h-40 bg-neutral-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="py-20 px-4 max-w-md mx-auto text-center">
        <AlertCircle className="w-12 h-12 text-status-error mx-auto mb-3" />
        <h2 className="font-serif text-2xl font-bold text-neutral-900">Product Not Found</h2>
        <p className="text-xs text-neutral-600 mt-2">
          {error?.message || 'The requested product specification is not available in our current export catalogue.'}
        </p>
        <Link to="/products" className="mt-6 inline-block">
          <Button variant="primary" size="sm">Browse Full Catalogue</Button>
        </Link>
      </div>
    );
  }

  const handleAddToBasket = () => {
    addItem(
      product,
      orderQuantity,
      orderUnit,
      selectedPacking || product.packing?.[0]?.type || 'Standard Export Packing'
    );
  };

  const handleDirectRfq = () => {
    handleAddToBasket();
    navigate('/contact');
  };

  const productWhatsAppUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello Export Desk, I would like to request a quotation for: ${product.name} (HS: ${product.hsCode}), Quantity: ${orderQuantity} ${orderUnit}.`
  )}`;

  const siteUrl = import.meta.env.VITE_CLIENT_URL || window.location.origin;
  const breadcrumbs = [
    { name: 'Home', url: `${siteUrl}/` },
    { name: 'Catalogue', url: `${siteUrl}/products` },
    ...(product.categoryId ? [{ name: product.categoryId.name, url: `${siteUrl}/products?category=${product.categoryId.slug}` }] : []),
    { name: product.name, url: `${siteUrl}/products/${product.slug}` },
  ];

  return (
    <>
      <JsonLd data={createProductSchema(product)} />
      <JsonLd data={createBreadcrumbSchema(breadcrumbs)} />
      <Helmet>
        <title>{product.seo?.title || `${product.name} (HS ${product.hsCode}) — Indian Exporter`}</title>
        <meta
          name="description"
          content={product.seo?.description || product.shortDescription}
        />
        {product?.images?.[0]?.url && (
          <link
            rel="preload"
            as="image"
            href={product.images[0].url.replace('.webp', '-800w.webp')}
            type="image/webp"
            fetchpriority="high"
          />
        )}
      </Helmet>

      {/* Breadcrumb Navigation */}
      <div className="bg-surface-subtle border-b border-surface-border py-3 px-4 sm:px-6 lg:px-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto">
          <Link to="/" className="hover:text-primary-800 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
          <Link to="/products" className="hover:text-primary-800 transition-colors">Catalogue</Link>
          {product.categoryId && (
            <>
              <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
              <Link to={`/products?category=${product.categoryId.slug}`} className="hover:text-primary-800 truncate transition-colors">
                {product.categoryId.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
          <span className="text-neutral-900 font-semibold truncate">{product.name}</span>
        </div>
      </div>

      {/* Product Main Showcase */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal direction="up" className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Visual Gallery (Sticky Showcase) */}
          <div className="lg:col-span-6">
            <div className="lg:sticky lg:top-28 xl:top-32 space-y-8 lg:max-h-[calc(100vh-8.5rem)] lg:overflow-y-auto lg:no-scrollbar">
              <ProductGallery images={product.images} productName={product.name} product={product} />

              {/* Quality Seals */}
              <div className="p-4 rounded-xl border border-surface-border bg-surface-subtle flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-600">
                <span className="flex items-center gap-1.5 font-medium text-neutral-900">
                  <ShieldCheck className="w-4 h-4 text-primary-800" /> Export Supply Assurance:
                </span>
                <span>Commercial Purity Guarantee</span>
                <span>Batch Traceability</span>
                <span>Export Standard Packaging</span>
              </div>
            </div>
          </div>

          {/* Right Column: Commercial Overview & RFQ Action */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {product.hsCode ? (
                  <span className="font-mono text-xs font-semibold bg-primary-800 text-white px-2.5 py-0.5 rounded shadow-sm">
                    HS Code: {product.hsCode}
                  </span>
                ) : null}
                {product.botanicalName ? (
                  <span className="italic text-xs text-neutral-500 font-serif">
                    Botanical: {product.botanicalName}
                  </span>
                ) : null}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
                {product.name}
              </h1>

              <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
                {product.description || product.shortDescription}
              </p>
            </div>

            {/* Quick Metadata Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-card border border-surface-border text-xs">
              <div>
                <span className="text-neutral-400 block text-[11px]">Origin:</span>
                <span className="font-semibold text-neutral-900">
                  {Array.isArray(product.origin) && product.origin.length > 0
                    ? product.origin.join(', ')
                    : 'India'}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px]">Availability:</span>
                <span className="font-semibold text-neutral-900">{product.availability || 'Year-round'}</span>
              </div>
              {product.shelfLife ? (
                <div>
                  <span className="text-neutral-400 block text-[11px]">Shelf Life:</span>
                  <span className="font-semibold text-neutral-900">{product.shelfLife}</span>
                </div>
              ) : null}
              {product.leadTime ? (
                <div>
                  <span className="text-neutral-400 block text-[11px]">Lead Time:</span>
                  <span className="font-semibold text-neutral-900">{product.leadTime}</span>
                </div>
              ) : null}
              {Array.isArray(product.forms) && product.forms.length > 0 ? (
                <div>
                  <span className="text-neutral-400 block text-[11px]">Forms Available:</span>
                  <span className="font-semibold text-neutral-900">
                    {product.forms.join(', ')}
                  </span>
                </div>
              ) : null}
              <div>
                <span className="text-neutral-400 block text-[11px]">Incoterms 2020:</span>
                <span className="font-semibold text-neutral-900">FOB / CIF / CFR</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px]">Commercial Terms:</span>
                <span className="font-semibold text-accent-600">Price on Request</span>
              </div>
            </div>

            {/* B2B Commercial Order / Quote Box */}
            <div className="p-6 rounded-2xl border-2 border-primary-800/20 bg-white shadow-card space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <div>
                  <span className="text-xs text-neutral-500 block">Commercial Pricing:</span>
                  <span className="font-serif text-xl font-bold text-neutral-900">Price on Formal Request</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-500 block">Minimum Order (MOQ):</span>
                  <span className="font-mono text-sm font-semibold text-primary-800">
                    {product.moq ? `${product.moq.value} ${product.moq.unit}` : '1x 20ft FCL'}
                  </span>
                </div>
              </div>

              {/* Quantity and Unit Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="order-quantity" className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Target Inquiry Quantity:
                  </label>
                  <div className="flex items-center border border-surface-border rounded-lg overflow-hidden bg-surface-canvas shadow-xs">
                    <button
                      type="button"
                      onClick={() => setOrderQuantity((prev) => Math.max(1, prev - 1))}
                      aria-label="Decrease quantity"
                      className="w-11 h-11 flex items-center justify-center text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 font-bold text-lg select-none transition-colors"
                    >
                      −
                    </button>
                    <input
                      id="order-quantity"
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      aria-label="Target inquiry quantity"
                      className="flex-1 h-11 text-center text-base sm:text-sm font-semibold border-x border-surface-border bg-white focus:outline-none focus:ring-1 focus:ring-primary-800"
                    />
                    <button
                      type="button"
                      onClick={() => setOrderQuantity((prev) => prev + 1)}
                      aria-label="Increase quantity"
                      className="w-11 h-11 flex items-center justify-center text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 font-bold text-lg select-none transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="order-unit" className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Cargo Unit:
                  </label>
                  <select
                    id="order-unit"
                    value={orderUnit}
                    onChange={(e) => setOrderUnit(e.target.value)}
                    className="w-full h-11 px-3.5 py-2 text-base sm:text-sm rounded-lg border border-surface-border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800 transition-all duration-150"
                  >
                    <option value="20ft FCL">20ft Full Container Load (FCL)</option>
                    <option value="40ft FCL">40ft High Cube FCL</option>
                    <option value="Metric Tonnes (MT)">Metric Tonnes (MT)</option>
                    <option value="Kilograms (kg)">Kilograms (kg)</option>
                  </select>
                </div>
              </div>

              {/* Packing Selector */}
              {product.packing && product.packing.length > 0 && (
                <div>
                  <label htmlFor="order-packing" className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Preferred Packaging Standard:
                  </label>
                  <select
                    id="order-packing"
                    value={selectedPacking}
                    onChange={(e) => setSelectedPacking(e.target.value)}
                    className="w-full h-11 px-3.5 py-2 text-base sm:text-sm rounded-lg border border-surface-border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800 transition-all duration-150"
                  >
                    {product.packing.map((p, idx) => (
                      <option key={idx} value={`${p.type} (${p.size})`}>
                        {p.type} ({p.size}) — {p.notes || 'Standard'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conversion Buttons */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="cta"
                  size="lg"
                  onClick={handleAddToBasket}
                  className="w-full flex items-center justify-center gap-2 shadow-hover min-h-[48px] text-sm font-bold group/btn"
                >
                  <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-200" />
                  <span>Add to Quote Basket</span>
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleDirectRfq}
                  className="w-full flex items-center justify-center gap-2 min-h-[48px] text-sm font-bold group/btn"
                >
                  <span>Direct RFQ Form</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-150" />
                </Button>
              </div>

              {/* Instant WhatsApp Link */}
              <div className="pt-2">
                <a
                  href={productWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 min-h-[44px] shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire on WhatsApp about {product.name}</span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Technical Specifications Section */}
        <div className="mt-16 pt-12 border-t border-surface-border space-y-12">
          <Reveal direction="up">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block mb-1">
              Product & Chemical Specifications
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">
              Technical Specification Sheet
            </h2>
            <SpecTable specs={product.specs} />

            {/* Regulatory & Trade Compliance Notice */}
            <div className="mt-4 p-4 rounded-xl border border-neutral-200 bg-neutral-50/80 text-xs text-neutral-600 space-y-1.5">
              <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary-800" />
                <span>Trade & Regulatory Compliance Information</span>
              </span>
              <p className="leading-relaxed">
                {(product.categoryId?.slug === 'nutraceutical-raw-materials' || product.categorySlug === 'nutraceutical-raw-materials') ? (
                  'Regulatory Notice: Sourced strictly as bulk raw material ingredients for dietary supplement, nutraceutical, and functional nutrition manufacturers. Regulatory classification, allowable claims, and maximum dosage levels vary by destination market; importing buyers are responsible for compliance with statutory food and supplement regulations in their destination country.'
                ) : (product.categoryId?.slug === 'animal-feed' || product.categorySlug === 'animal-feed') ? (
                  'Feed Ingredient Notice: Supplied strictly as commercial livestock, poultry, and aquaculture feed ingredients. Export documentation provided per order with commercial shipping documents.'
                ) : (
                  'Technical Notice: Supplied strictly as raw materials and cosmetic ingredients for registered manufacturers. Technical specifications, compliance sheets, and export documentation provided upon formal request.'
                )}
              </p>
            </div>
          </Reveal>

          {/* Packaging & Container Load Section */}
          <Reveal direction="up" cascade stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl border border-surface-border bg-surface-card shadow-subtle space-y-4">
              <h3 className="font-serif text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-800" />
                <span>Export Packaging Options</span>
              </h3>
              {product.packing && product.packing.length > 0 ? (
                <ul className="space-y-3 text-xs sm:text-sm text-neutral-600">
                  {product.packing.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2 border-b border-surface-border pb-2 last:border-0">
                      <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-neutral-900">{p.type} — {p.size}:</span>{' '}
                        <span>{p.notes || 'Export standard moisture-barrier packaging'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Custom export packaging available upon request — multi-wall paper bags, PP woven sacks, fiber drums, bulk totes, or customized private-label specifications.
                </p>
              )}
            </div>

            <div className="p-6 rounded-xl border border-surface-border bg-surface-card shadow-subtle space-y-4">
              <h3 className="font-serif text-lg font-bold text-neutral-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-800" />
                <span>Export Sourcing & Supply Chain</span>
              </h3>
              <div className="space-y-3 text-xs sm:text-sm text-neutral-600">
                <div className="flex justify-between border-b border-surface-border pb-2">
                  <span className="text-neutral-500">Sourcing Model:</span>
                  <span className="font-semibold text-neutral-900">Direct Indian growing belts & processing</span>
                </div>
                <div className="flex justify-between border-b border-surface-border pb-2">
                  <span className="text-neutral-500">Consolidation:</span>
                  <span className="font-semibold text-neutral-900">Multi-commodity single container loading</span>
                </div>
                <div className="flex justify-between border-b border-surface-border pb-2">
                  <span className="text-neutral-500">Supply Chain Control:</span>
                  <span className="font-semibold text-neutral-900">End-to-end fulfillment & tracking</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Documentation:</span>
                  <span className="font-semibold text-neutral-900">Export documentation on request</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Related Category Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-8 border-t border-surface-border">
              <Reveal direction="up" className="flex items-center justify-between mb-8">
                <h3 className="font-serif text-2xl font-bold text-neutral-900">
                  Related Export Products
                </h3>
                <Link
                  to={`/products?category=${product.categoryId?.slug}`}
                  className="text-xs font-semibold text-primary-800 hover:text-accent-600 link-underline"
                >
                  View all in division →
                </Link>
              </Reveal>
              <Reveal direction="up" cascade stagger={0.07} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((rel) => (
                  <ProductCard key={rel._id} product={rel} />
                ))}
              </Reveal>
            </div>
          )}

          {/* 48-Hour Unlisted Sourcing Guarantee (REQ-03) */}
          <div className="pt-10">
            <UnlistedSourcingBanner />
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetailPage;
