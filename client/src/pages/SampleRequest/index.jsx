import React, { useState } from 'react';
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
    { productName: 'Salem Turmeric Finger (Curcumin 3–5%)', qty: '250g' },
  ]);
  const [newProductName, setNewProductName] = useState('');

  const [formErrors, setFormErrors] = useState({});
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  const { mutate: sendSample, isPending: isSubmitting, error: submitError } = useSubmitSample({
    onSuccess: (data) => {
      setSubmissionSuccess(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          content="Order formal laboratory testing samples (100g–500g) with Certificate of Analysis (COA) for international importers and food processors."
        />
      </Helmet>

      {/* Signature Slow Masked Page Header */}
      <PageHeader
        title="Commercial Sample Evaluation Request"
        description="Verify physical appearance, sensory profiles, and chemical testing parameters before placing container commitments. Samples provided in 100g–500g sealed foil pouches with lot COA."
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-800/90 border border-accent-500/40 text-accent-400 text-xs font-semibold shadow-xs">
            <Truck className="w-3.5 h-3.5 text-accent-400" />
            <span>Express Courier Dispatch within 48–72 Hours</span>
          </div>
        }
      />

      <div className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {submissionSuccess ? (
          <div className="p-8 sm:p-12 rounded-2xl border-2 border-primary-800/30 bg-white shadow-card text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-status-success/10 text-status-success mx-auto flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block mb-1">
              Dispatch Ticket Created
            </span>
            <h2 className="font-serif text-3xl font-bold text-neutral-900">
              Sample Request Registered
            </h2>
            <div className="my-6 inline-block bg-primary-50 border border-primary-200 px-6 py-3 rounded-lg">
              <span className="text-xs text-neutral-500 block">Sample Reference Ticket:</span>
              <span className="font-mono text-xl font-bold text-primary-800">
                {submissionSuccess.referenceNo}
              </span>
            </div>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              Our dispatch lab will prepare your sample kit with Certificate of Analysis (COA). You will receive air waybill (AWB) tracking via email upon courier handover.
            </p>
            <div className="mt-8">
              <Button
                variant="outline"
                size="md"
                onClick={() => setSubmissionSuccess(null)}
              >
                Order Additional Commodities
              </Button>
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
                Pre-Shipment Evaluation Protocol
              </h3>
              <ul className="space-y-3 text-xs text-neutral-300 leading-relaxed">
                <li>
                  <strong>Sample Product Cost:</strong> Complimentary for verified commercial importers, distributors, and corporate food processors.
                </li>
                <li>
                  <strong>International Courier Freight:</strong> Borne by consignee via their DHL / FedEx corporate account number, or billed on actuals.
                </li>
                <li>
                  <strong>Documentation Included:</strong> Lot-specific HPLC/GC-MS testing report, phytosanitary declaration, and product technical data sheet.
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
                  1. Laboratory Consignee Contact
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
                    <label htmlFor="sample-company" className="block text-xs font-semibold text-neutral-700 mb-1">Company / QA Lab Name *</label>
                    <input
                      id="sample-company"
                      type="text"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g. BioPharm Labs Ltd"
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
                      placeholder="Add commodity name (e.g. 1121 Steam Basmati Rice)..."
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
                      placeholder="Facility / Lab street address"
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
