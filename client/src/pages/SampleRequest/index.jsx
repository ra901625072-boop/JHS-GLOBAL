import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Send,
  Plus,
  Trash2,
  Package,
  Copy,
  Check,
  Mail,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useSubmitSample } from '../../features/inquiry/hooks';
import { useCategories } from '../../features/products/hooks';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/layout/PageHeader';
import Reveal from '../../components/ui/Reveal';

export const SampleRequestPage = () => {
  const brandName = import.meta.env.VITE_BRAND_NAME || 'JHS GLOBAL';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    country: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    courierProvider: 'DHL',
    courierAccount: '',
    testingParameters: '',
  });

  const [sampleProducts, setSampleProducts] = useState([
    { productName: 'Standardized Ashwagandha Extract (Withanolides 2.5–5%)', qty: '250g' },
  ]);
  const [newProductName, setNewProductName] = useState('');

  const [formErrors, setFormErrors] = useState({});
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [submittedBuyer, setSubmittedBuyer] = useState({ name: '', email: '' });
  const [copiedRef, setCopiedRef] = useState(false);

  const handleCopyReference = () => {
    if (submissionSuccess?.referenceNo) {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(submissionSuccess.referenceNo);
      }
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  const { mutate: sendSample, isPending: isSubmitting, error: submitError } = useSubmitSample({
    onSuccess: (data) => {
      setSubmissionSuccess(data);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    },
    onError: (err) => {
      if (err.details && Array.isArray(err.details)) {
        const errorsObj = {};
        err.details.forEach((d) => {
          errorsObj[d.field] = d.message;
        });
        setFormErrors(errorsObj);
      }
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddSampleItem = () => {
    if (!newProductName.trim()) return;
    if (sampleProducts.length >= 3) {
      alert('Maximum 3 sample commodities allowed per dispatch batch.');
      return;
    }
    setSampleProducts((prev) => [...prev, { productName: newProductName.trim(), qty: '250g' }]);
    setNewProductName('');
  };

  const handleRemoveSampleItem = (index) => {
    setSampleProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = {};
    if (!formData.name.trim()) errors.name = 'Contact name is required';
    if (!formData.email.trim()) errors.email = 'Business email is required';
    if (!formData.company.trim()) errors.company = 'Company name is required';
    if (!formData.country.trim()) errors.country = 'Destination country is required';
    if (!formData.street.trim()) errors.street = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.postalCode.trim()) errors.postalCode = 'Postal code is required';

    if (sampleProducts.length === 0) {
      errors.products = 'Please specify at least one product for sample evaluation';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmittedBuyer({
      name: formData.name.trim(),
      email: formData.email.trim(),
    });

    sendSample({
      name: formData.name,
      email: formData.email,
      company: formData.company,
      phone: formData.phone,
      country: formData.country,
      products: sampleProducts,
      shippingAddress: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      },
      courierAccount: {
        provider: formData.courierProvider,
        accountNumber: formData.courierAccount,
      },
      testingParameters: formData.testingParameters,
    });
  };

  return (
    <>
      <Helmet>
        <title>Commercial Sample Request (DHL/FedEx Dispatch) — {brandName}</title>
        <meta
          name="description"
          content="Request commercial evaluation samples (100g–500g) with technical specifications for international importers and food processors."
        />
      </Helmet>

      {/* Signature Slow Masked Page Header */}
      <PageHeader
        title="Commercial Sample Evaluation Request"
        description="Verify physical appearance, sensory profiles, and product specifications before placing container commitments. Samples provided in 100g–500g sealed pouches with technical specification sheets."
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-800/90 border border-accent-500/40 text-accent-400 text-xs font-semibold shadow-xs">
            <Truck className="w-3.5 h-3.5 text-accent-400" />
            <span>Express Courier Dispatch within 48–72 Hours</span>
          </div>
        }
      />

      <div className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {submissionSuccess ? (
          <div id="sample-success-card" className="p-8 sm:p-12 rounded-2xl border-2 border-emerald-600/30 bg-white shadow-card text-center max-w-2xl mx-auto animate-in fade-in duration-300 relative overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-6 ring-8 ring-emerald-500/10 animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 stroke-[2.2]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-100/70 border border-emerald-300 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Sample Ticket Created</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight">
              Thank You{submittedBuyer.name ? `, ${submittedBuyer.name}` : ''}! We've Received Your Sample Request
            </h2>

            <p className="mt-3 text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
              Thank you for requesting evaluation samples from JHS Global. Our export fulfillment team is preparing your sample kit with technical specification sheets.
            </p>

            {/* Copyable Reference ID */}
            <div className="my-6 inline-flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-50 border border-neutral-200/90 rounded-xl px-5 py-3.5 max-w-md w-full mx-auto shadow-xs">
              <div className="text-left">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Sample Reference Ticket
                </span>
                <span className="font-mono text-lg sm:text-xl font-bold text-primary-900 select-all tracking-wide">
                  {submissionSuccess.referenceNo}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyReference}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
                title="Copy Reference ID"
              >
                {copiedRef ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            {/* 3-Point Details Card */}
            <div className="p-5 sm:p-6 rounded-xl bg-surface-subtle border border-surface-border max-w-xl mx-auto text-left space-y-3.5 text-xs sm:text-sm text-neutral-600">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100/60 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Email Receipt & Dispatch Tracking</p>
                  <p className="text-neutral-600 text-xs mt-0.5">
                    Order confirmation dispatched to{' '}
                    <strong className="text-neutral-800">{submittedBuyer.email || 'your email'}</strong>. You will receive express courier air waybill (AWB) tracking upon handover.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-accent-100/60 text-accent-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Dispatch Window: 48–72 Hours</p>
                  <p className="text-neutral-600 text-xs mt-0.5">
                    Evaluation sample lots are drawn, sealed in protective pouches, and released for international courier transit.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary-100/60 text-primary-800 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Technical Dossier Included</p>
                  <p className="text-neutral-600 text-xs mt-0.5">
                    Technical specification sheets and product analysis accompany each dispatch pouch.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => setSubmissionSuccess(null)}
              >
                Order Additional Commodities
              </Button>

              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-primary-900 hover:text-accent-700 transition-colors"
              >
                <span>Browse Product Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <Reveal direction="up" cascade stagger={0.08} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Policy Information Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-primary-900 text-white space-y-4">
              <div className="flex items-center gap-2 text-accent-400 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Sample Policy & Standards</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-white">
                Commercial Evaluation Protocol
              </h3>
              <ul className="space-y-3 text-xs text-neutral-300 leading-relaxed">
                <li>
                  <strong>Sample Product Cost:</strong> Complimentary for verified commercial importers, distributors, and corporate food processors.
                </li>
                <li>
                  <strong>International Courier Freight:</strong> Borne by consignee via their DHL / FedEx corporate account number, or billed on actuals.
                </li>
                <li>
                  <strong>Documentation Included:</strong> Lot-specific specification sheet, product technical data sheet, and export documentation on request.
                </li>
                <li>
                  <strong>Standard Quantity:</strong> 250 grams per commodity (custom quantities available for pilot production runs).
                </li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-8 p-6 sm:p-10 rounded-2xl border border-surface-border bg-surface-card shadow-card">
            <form onSubmit={handleSubmit} className="space-y-8">
              {submitError && (
                <div className="p-4 rounded-lg bg-red-50 border border-status-error/30 text-xs text-status-error flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError.message || 'Please correct errors before submitting.'}</span>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-neutral-900 border-b border-surface-border pb-2">
                  1. Consignee Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sample-name" className="block text-xs font-semibold text-neutral-700 mb-1">Contact Name *</label>
                    <input
                      id="sample-name"
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Dr. Sarah Connor"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-border rounded-lg bg-surface-canvas focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="sample-email" className="block text-xs font-semibold text-neutral-700 mb-1">Business Email *</label>
                    <input
                      id="sample-email"
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. qa@company.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-border rounded-lg bg-surface-canvas focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="sample-company" className="block text-xs font-semibold text-neutral-700 mb-1">Company Name *</label>
                    <input
                      id="sample-company"
                      type="text"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g. EuroFoods GmbH"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-border rounded-lg bg-surface-canvas focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="sample-phone" className="block text-xs font-semibold text-neutral-700 mb-1">Courier Contact Phone *</label>
                    <input
                      id="sample-phone"
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+44 20 7946 0958"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-border rounded-lg bg-surface-canvas focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Commodities Selector */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-neutral-900 border-b border-surface-border pb-2">
                  2. Requested Commodities (Up to 3)
                </h3>
                {sampleProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-surface-border rounded-lg bg-white">
                    <span className="text-xs font-medium text-neutral-900">{p.productName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500 font-mono">{p.qty}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSampleItem(idx)}
                        className="text-neutral-400 hover:text-status-error min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {sampleProducts.length < 3 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      placeholder="Add commodity name (e.g. Organic Psyllium Husk 99% / Ashwagandha Extract)..."
                      className="flex-1 px-3 py-2 text-xs border border-surface-border rounded-lg bg-surface-canvas"
                    />
                    <button
                      type="button"
                      onClick={handleAddSampleItem}
                      className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-neutral-900 border-b border-surface-border pb-2">
                  3. Express Courier Delivery Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="sample-street" className="block text-xs font-semibold text-neutral-700 mb-1">Street Address *</label>
                    <input
                      id="sample-street"
                      type="text"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Delivery / Office street address"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-border rounded-lg bg-surface-canvas focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="sample-city" className="block text-xs font-semibold text-neutral-700 mb-1">City *</label>
                    <input
                      id="sample-city"
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-border rounded-lg bg-surface-canvas focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="sample-postal" className="block text-xs font-semibold text-neutral-700 mb-1">Postal / ZIP Code *</label>
                    <input
                      id="sample-postal"
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="Postal code"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-border rounded-lg bg-surface-canvas focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="sample-country" className="block text-xs font-semibold text-neutral-700 mb-1">Destination Country *</label>
                    <input
                      id="sample-country"
                      type="text"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Country"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-border rounded-lg bg-surface-canvas focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="sample-courier-account" className="block text-xs font-semibold text-neutral-700 mb-1">
                      Courier Account Number (DHL / FedEx)
                    </label>
                    <input
                      id="sample-courier-account"
                      type="text"
                      name="courierAccount"
                      value={formData.courierAccount}
                      onChange={handleInputChange}
                      placeholder="e.g. 968541235"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-border rounded-lg bg-surface-canvas focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-surface-border flex justify-end">
                <Button
                  type="submit"
                  variant="cta"
                  size="lg"
                  loading={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Sample Request Ticket</span>
                </Button>
              </div>
            </form>
          </div>
        </Reveal>
      )}
    </div>
  </>
);
};

export default SampleRequestPage;
