import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Clock,
  ShieldCheck,
  Send,
  MessageCircle,
  Package,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  Wand2,
  Copy,
  Check,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { useQuoteBasket } from '../../features/quoteBasket/context';
import { useSubmitRfq } from '../../features/inquiry/hooks';
import { parseRfqText } from '../../features/ai/api';
import Button from '../ui/Button';

export const QuoteForm = () => {
  const { items, clearBasket, updateItemQuantity, removeItem, addItem } = useQuoteBasket();
  const [customItemName, setCustomItemName] = useState('');

  // AI Quick-Fill State
  const [quickFillOpen, setQuickFillOpen] = useState(false);
  const [rawRfqText, setRawRfqText] = useState('');
  const [isParsingRfq, setIsParsingRfq] = useState(false);
  const [parseNotice, setParseNotice] = useState(null);
  const [parseError, setParseError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    whatsapp: '',
    designation: '',
    website: '',
    country: '',
    city: '',
    buyerType: 'importer',
    destinationPort: '',
    incoterm: 'CIF',
    targetShipmentMonth: '',
    paymentTerm: 'TT',
    needsPrivateLabel: false,
    needsSample: false,
    message: '',
    website_hp: '', // Honeypot field
  });

  const [formErrors, setFormErrors] = useState({});
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [submittedBuyer, setSubmittedBuyer] = useState({ name: '', email: '' });
  const [copiedRef, setCopiedRef] = useState(false);

  const { mutate: sendRfq, isPending: isSubmitting, error: submitError } = useSubmitRfq({
    onSuccess: (data) => {
      setSubmissionSuccess(data);
      clearBasket();
      const formCard = document.getElementById('rfq-form-card') || document.querySelector('.order-1');
      if (formCard) {
        formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddCustomCommodity = (e) => {
    e.preventDefault();
    if (!customItemName.trim()) return;

    addItem(
      {
        _id: `custom-${Date.now()}`,
        name: customItemName.trim(),
        slug: '',
        hsCode: 'Custom Spec',
      },
      1,
      '20ft FCL',
      'Export Standard'
    );
    setCustomItemName('');
  };

  const handleAiQuickFill = async (e) => {
    e.preventDefault();
    if (!rawRfqText.trim()) return;

    setIsParsingRfq(true);
    setParseError(null);
    setParseNotice(null);

    try {
      const parsed = await parseRfqText(rawRfqText);

      setFormData((prev) => ({
        ...prev,
        name: parsed.buyer?.name || prev.name,
        email: parsed.buyer?.email || prev.email,
        company: parsed.buyer?.company || prev.company,
        phone: parsed.buyer?.phone || prev.phone,
        country: parsed.buyer?.country || prev.country,
        designation: parsed.buyer?.designation || prev.designation,
        destinationPort: parsed.logistics?.destinationPort || prev.destinationPort,
        incoterm: parsed.logistics?.incoterm || prev.incoterm,
        targetShipmentMonth: parsed.logistics?.targetShipmentMonth || prev.targetShipmentMonth,
        paymentTerm: parsed.logistics?.paymentTerm || prev.paymentTerm,
        needsSample:
          typeof parsed.logistics?.needsSample === 'boolean'
            ? parsed.logistics.needsSample
            : prev.needsSample,
        message: parsed.message || prev.message,
      }));

      let addedItemCount = 0;
      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        parsed.items.forEach((item) => {
          if (item.productName) {
            addItem(
              {
                _id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                name: item.productName,
                slug: '',
                hsCode: 'Custom Spec',
              },
              item.quantity || 1,
              item.unit || 'MT',
              item.packing || 'Export Standard'
            );
            addedItemCount++;
          }
        });
      }

      setParseNotice({
        itemCount: addedItemCount,
        hasBuyer: !!(parsed.buyer?.name || parsed.buyer?.company),
        hasLogistics: !!(parsed.logistics?.destinationPort || parsed.logistics?.incoterm),
      });
      setQuickFillOpen(false);
    } catch (err) {
      console.warn('AI Quick fill failed:', err);
      setParseError(
        err.message || 'AI Quick-Fill temporarily unavailable. You can enter details manually below.'
      );
    } finally {
      setIsParsingRfq(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side quick check
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Contact name must be at least 2 characters';
    }
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid business email address';
    }
    if (!formData.company.trim() || formData.company.trim().length < 2) {
      errors.company = 'Company name must be at least 2 characters';
    }
    if (!formData.country.trim() || formData.country.trim().length < 2) {
      errors.country = 'Destination country is required (min 2 characters)';
    }

    if (items.length === 0 && !formData.message.trim()) {
      errors.items = 'Please select at least one commodity from the basket or provide specifications in the message.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorKey = Object.keys(errors)[0];
      const targetElement =
        document.getElementById(firstErrorKey === 'items' ? 'items-section' : `buyer-${firstErrorKey}`) ||
        document.querySelector(`[name="${firstErrorKey}"]`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof targetElement.focus === 'function') {
          targetElement.focus();
        }
      }
      return;
    }

    setSubmittedBuyer({
      name: formData.name.trim(),
      email: formData.email.trim(),
    });

    sendRfq({
      ...formData,
      items: items.map((i) => {
        const isCustom = typeof i.productId === 'string' && i.productId.startsWith('custom-');
        return {
          productId: isCustom ? null : (i.productId != null ? i.productId : null),
          productName: i.productName,
          quantity: Number(i.quantity) || 1,
          unit: i.unit || 'MT',
          packing: i.packing || '',
        };
      }),
    });
  };

  const handleCopyReference = () => {
    if (submissionSuccess?.referenceNo) {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(submissionSuccess.referenceNo);
      }
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+917202907720';

  // Success State View
  if (submissionSuccess) {
    return (
      <div id="rfq-success-card" className="p-8 sm:p-12 rounded-2xl border-2 border-emerald-600/30 bg-white shadow-card text-center animate-in fade-in duration-300 relative overflow-hidden">
        {/* Animated checkmark icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-6 ring-8 ring-emerald-500/10 animate-in zoom-in-95 duration-300">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 stroke-[2.2]" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-100/70 border border-emerald-300 mb-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Inquiry Successfully Received</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight">
          Thank You{submittedBuyer.name ? `, ${submittedBuyer.name}` : ''}! We've Received Your Quote Request
        </h2>

        <p className="mt-3 text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
          Thank you for your interest in partnering with JHS Global. Our international trade desk has received your commodity specifications and is preparing your customized proforma quotation.
        </p>

        {/* Copyable Reference ID */}
        <div className="my-6 inline-flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-50 border border-neutral-200/90 rounded-xl px-5 py-3.5 max-w-md w-full mx-auto shadow-xs">
          <div className="text-left">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Official RFQ Reference ID
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

        {/* 3-Point Buyer Next Steps Card */}
        <div className="p-5 sm:p-6 rounded-xl bg-surface-subtle border border-surface-border max-w-xl mx-auto text-left space-y-3.5 text-xs sm:text-sm text-neutral-600">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-100/60 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Email Confirmation Dispatched</p>
              <p className="text-neutral-600 text-xs mt-0.5">
                An automated receipt with your inquiry summary has been dispatched to{' '}
                <strong className="text-neutral-800">{submittedBuyer.email || 'your email'}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent-100/60 text-accent-800 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Guaranteed 48-Hour Turnaround</p>
              <p className="text-neutral-600 text-xs mt-0.5">
                Our trade desk calculates Incoterms 2020 CIF/FOB freight, container stuffing plans, and certificate of analysis (COA) tolerances within 48 business hours.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary-100/60 text-primary-800 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Direct Trade Officer Assignment</p>
              <p className="text-neutral-600 text-xs mt-0.5">
                A dedicated international trade officer has been assigned to coordinate your order and lab samples.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <a
            href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              `Hello JHS GLOBAL team, I have just submitted RFQ reference: ${submissionSuccess.referenceNo}. Please verify.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-sm min-h-[44px] transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Follow up via WhatsApp</span>
          </a>

          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setSubmissionSuccess(null);
              setFormData({
                name: '',
                email: '',
                company: '',
                phone: '',
                whatsapp: '',
                designation: '',
                website: '',
                country: '',
                city: '',
                buyerType: 'importer',
                destinationPort: '',
                incoterm: 'CIF',
                targetShipmentMonth: '',
                paymentTerm: 'TT',
                needsPrivateLabel: false,
                needsSample: false,
                message: '',
                website_hp: '',
              });
            }}
          >
            Submit Another RFQ
          </Button>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-primary-900 hover:text-accent-700 transition-colors"
          >
            <span>Explore More Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-8">
      {/* Top Banner & Error Alert */}
      {submitError && (
        <div className="p-4 rounded-lg bg-red-50 border border-status-error/30 text-xs text-status-error flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Submission Error:</span>
            <span>{submitError.message || 'Please review the fields below and correct errors.'}</span>
          </div>
        </div>
      )}

      {/* Hidden Anti-Bot Honeypot */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label htmlFor="website_hp">Leave empty</label>
        <input
          id="website_hp"
          type="text"
          name="website_hp"
          tabIndex="-1"
          autoComplete="off"
          value={formData.website_hp}
          onChange={handleInputChange}
        />
      </div>

      {/* AI Quick-Fill Accordion Card */}
      <div className="rounded-xl border border-primary-200/80 bg-primary-50/40 p-4 sm:p-5 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-800 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 text-accent-300" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                <span>AI Quick-Fill Assistant</span>
                <span className="text-[10px] font-medium bg-primary-200/70 text-primary-800 px-2 py-0.5 rounded-full">
                  Time Saver
                </span>
              </h4>
              <p className="text-[11px] text-neutral-600">
                Paste your existing procurement text, email, or RFQ specs to auto-fill this entire form.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setQuickFillOpen((prev) => !prev)}
            className="text-xs font-semibold text-primary-800 hover:text-primary-900 px-3 py-1.5 rounded-md hover:bg-primary-100/60 transition-colors flex items-center gap-1 shrink-0"
          >
            <span>{quickFillOpen ? 'Hide' : 'Quick Fill'}</span>
            {quickFillOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {quickFillOpen && (
          <div className="mt-4 pt-3 border-t border-primary-200/60 space-y-3 animate-in fade-in duration-200">
            <label htmlFor="raw-rfq-text" className="block text-xs font-medium text-neutral-700">
              Procurement Message / Tender Specifications:
            </label>
            <textarea
              id="raw-rfq-text"
              rows={4}
              value={rawRfqText}
              onChange={(e) => setRawRfqText(e.target.value)}
              placeholder="e.g. We are EuroFoods GmbH (Munich). Sourcing 20 MT Soybean Meal DOC (50kg PP bags) and 5 MT Ashwagandha Extract (25kg drums) to Hamburg CIF, Nov shipment. Contact: procurement@eurofoods.de / +4989123456."
              maxLength={2000}
              className="w-full text-xs sm:text-sm rounded-lg border border-primary-200 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-primary-800 placeholder:text-neutral-400"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-neutral-500">
                {rawRfqText.length} / 2000 characters
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickFillOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAiQuickFill}
                  disabled={isParsingRfq || !rawRfqText.trim()}
                  className="px-4 py-2 text-xs font-semibold rounded-md bg-primary-800 hover:bg-primary-900 text-white disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {isParsingRfq ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting Specifications...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5 text-accent-300" />
                      <span>Auto-Fill Quote Form</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            {parseError && (
              <p className="text-xs text-status-error bg-red-50 p-2 rounded border border-red-200">
                {parseError}
              </p>
            )}
          </div>
        )}

        {parseNotice && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">
                Fields Auto-Filled Successfully!
              </span>
              <span>
                Buyer credentials and logistics parameters were mapped, and{' '}
                <strong>{parseNotice.itemCount}</strong> commodity item(s) were added to your quote
                basket. Please inspect all details below before final submission.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Section 1: Buyer Information */}
      <div className="space-y-4">
        <div className="border-b border-surface-border pb-2 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-neutral-900">
            1. Buyer & Company Identification
          </h3>
          <span className="text-[11px] text-neutral-500">* Required fields</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="buyer-name" className="block text-xs font-semibold text-neutral-700 mb-1">
              Contact Name *
            </label>
            <input
              id="buyer-name"
              type="text"
              name="name"
              autoComplete="name"
              required
              aria-invalid={formErrors.name ? 'true' : 'false'}
              aria-describedby={formErrors.name ? 'buyer-name-error' : undefined}
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Michael Vance"
              className={`w-full h-11 px-3.5 py-2 text-base sm:text-sm rounded-lg border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800 ${
                formErrors.name ? 'border-status-error ring-1 ring-status-error' : 'border-surface-border'
              }`}
            />
            {formErrors.name && (
              <span id="buyer-name-error" role="alert" className="text-[11px] text-status-error mt-1 block">
                {formErrors.name}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="buyer-email" className="block text-xs font-semibold text-neutral-700 mb-1">
              Corporate / Business Email *
            </label>
            <input
              id="buyer-email"
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              required
              aria-invalid={formErrors.email ? 'true' : 'false'}
              aria-describedby={formErrors.email ? 'buyer-email-error' : undefined}
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g. procurement@company.com"
              className={`w-full h-11 px-3.5 py-2 text-base sm:text-sm rounded-lg border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800 ${
                formErrors.email ? 'border-status-error ring-1 ring-status-error' : 'border-surface-border'
              }`}
            />
            {formErrors.email && (
              <span id="buyer-email-error" role="alert" className="text-[11px] text-status-error mt-1 block">
                {formErrors.email}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="buyer-company" className="block text-xs font-semibold text-neutral-700 mb-1">
              Registered Company Name *
            </label>
            <input
              id="buyer-company"
              type="text"
              name="company"
              autoComplete="organization"
              required
              aria-invalid={formErrors.company ? 'true' : 'false'}
              aria-describedby={formErrors.company ? 'buyer-company-error' : undefined}
              value={formData.company}
              onChange={handleInputChange}
              placeholder="e.g. EuroFoods Import GmbH"
              className={`w-full h-11 px-3.5 py-2 text-base sm:text-sm rounded-lg border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800 ${
                formErrors.company ? 'border-status-error ring-1 ring-status-error' : 'border-surface-border'
              }`}
            />
            {formErrors.company && (
              <span id="buyer-company-error" role="alert" className="text-[11px] text-status-error mt-1 block">
                {formErrors.company}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="buyer-designation" className="block text-xs font-semibold text-neutral-700 mb-1">
              Designation / Role
            </label>
            <input
              id="buyer-designation"
              type="text"
              name="designation"
              autoComplete="organization-title"
              value={formData.designation}
              onChange={handleInputChange}
              placeholder="e.g. Sourcing Director, Procurement Lead"
              className="w-full h-11 px-3.5 py-2 text-base sm:text-sm rounded-lg border border-surface-border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
          </div>

          <div>
            <label htmlFor="buyer-phone" className="block text-xs font-semibold text-neutral-700 mb-1">
              Phone / WhatsApp Number
            </label>
            <input
              id="buyer-phone"
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+49 40 12345678"
              className="w-full h-11 px-3.5 py-2 text-base sm:text-sm rounded-lg border border-surface-border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
          </div>

          <div>
            <label htmlFor="buyer-type" className="block text-xs font-semibold text-neutral-700 mb-1">
              I am a: (Buyer Type)
            </label>
            <select
              id="buyer-type"
              name="buyerType"
              value={formData.buyerType}
              onChange={handleInputChange}
              className="w-full h-11 px-3.5 py-2 text-base sm:text-sm rounded-lg border border-surface-border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800"
            >
              <option value="importer">Direct Importer / Wholesale Trader</option>
              <option value="distributor">Regional Food Distributor</option>
              <option value="manufacturer">Food / Ingredient Manufacturer</option>
              <option value="retailer">Supermarket Chain / Retail Brand</option>
              <option value="other">Institutional Procurement / Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="buyer-country" className="block text-xs font-semibold text-neutral-700 mb-1">
              Destination Country *
            </label>
            <input
              id="buyer-country"
              type="text"
              name="country"
              autoComplete="country-name"
              required
              aria-invalid={formErrors.country ? 'true' : 'false'}
              aria-describedby={formErrors.country ? 'buyer-country-error' : undefined}
              value={formData.country}
              onChange={handleInputChange}
              placeholder="e.g. Germany, UAE, USA, Japan"
              className={`w-full h-11 px-3.5 py-2 text-base sm:text-sm rounded-lg border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800 ${
                formErrors.country ? 'border-status-error ring-1 ring-status-error' : 'border-surface-border'
              }`}
            />
            {formErrors.country && (
              <span id="buyer-country-error" role="alert" className="text-[11px] text-status-error mt-1 block">
                {formErrors.country}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="buyer-city" className="block text-xs font-semibold text-neutral-700 mb-1">
              City / State
            </label>
            <input
              id="buyer-city"
              type="text"
              name="city"
              autoComplete="address-level2"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="e.g. Hamburg, Dubai, New York"
              className="w-full h-11 px-3.5 py-2 text-base sm:text-sm rounded-lg border border-surface-border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Commodity Specifications Matrix */}
      <div id="items-section" className="space-y-4">
        <div className="border-b border-surface-border pb-2 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-neutral-900">
            2. Selected Commodities for Quotation
          </h3>
          <span className="text-xs text-primary-800 font-semibold">{items.length} in basket</span>
        </div>

        {formErrors.items && (
          <div id="items-error" role="alert" className="p-3 bg-red-50 text-status-error text-xs rounded-lg border border-status-error/30">
            {formErrors.items}
          </div>
        )}

        {/* Items List */}
        {items.length === 0 ? (
          <div className="p-6 border border-dashed border-surface-border rounded-xl text-center bg-surface-canvas">
            <Package className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-neutral-700">No commodities in quote basket yet</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              You can add items from the catalogue or add custom commodities below.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="p-3.5 rounded-lg border border-surface-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-neutral-900 truncate">
                    {item.productName}
                  </h4>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {item.hsCode ? `HS: ${item.hsCode}` : 'Export Grade'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <label htmlFor={`item-qty-${item.productId}`} className="text-xs text-neutral-500">Qty:</label>
                    <input
                      id={`item-qty-${item.productId}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value, 10) || 1)}
                      className="w-16 px-2 py-1 text-xs border border-surface-border rounded focus:ring-1 focus:ring-primary-800"
                    />
                    <select
                      value={item.unit}
                      onChange={(e) => updateItemQuantity(item.productId, item.quantity, e.target.value)}
                      className="px-2 py-1 text-xs border border-surface-border rounded bg-white"
                    >
                      <option value="20ft FCL">20ft FCL</option>
                      <option value="40ft FCL">40ft FCL</option>
                      <option value="MT">MT</option>
                      <option value="kg">kg</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="p-1.5 text-neutral-400 hover:text-status-error min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add custom commodity inline input */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={customItemName}
            onChange={(e) => setCustomItemName(e.target.value)}
            placeholder="Add unlisted commodity (e.g. Fenugreek Seeds 99%, Dried Ginger Flakes)..."
            className="flex-1 px-3 py-2 text-xs border border-surface-border rounded-lg bg-surface-canvas focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-800"
          />
          <button
            type="button"
            onClick={handleAddCustomCommodity}
            className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors min-h-[38px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Section 3: Commercial Logistics & Banking Specifications */}
      <div className="space-y-4">
        <div className="border-b border-surface-border pb-2">
          <h3 className="font-serif text-lg font-bold text-neutral-900">
            3. Maritime Logistics & Banking Conditions
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="rfq-destination-port" className="block text-xs font-semibold text-neutral-700 mb-1">
              Destination Port (Discharge)
            </label>
            <input
              id="rfq-destination-port"
              type="text"
              name="destinationPort"
              value={formData.destinationPort}
              onChange={handleInputChange}
              placeholder="e.g. Jebel Ali, Hamburg, Felixstowe"
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-surface-border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
          </div>

          <div>
            <label htmlFor="rfq-incoterm" className="block text-xs font-semibold text-neutral-700 mb-1">
              Requested Incoterm (2020)
            </label>
            <select
              id="rfq-incoterm"
              name="incoterm"
              value={formData.incoterm}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-surface-border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800"
            >
              <option value="CIF">CIF (Cost, Insurance & Freight)</option>
              <option value="FOB">FOB (Free On Board - Indian Gateway Port)</option>
              <option value="CFR">CFR (Cost & Freight)</option>
              <option value="EXW">EXW (Ex Works Facility)</option>
              <option value="CIP">CIP (Carriage and Insurance Paid)</option>
            </select>
          </div>

          <div>
            <label htmlFor="rfq-target-shipment" className="block text-xs font-semibold text-neutral-700 mb-1">
              Target Shipment Month
            </label>
            <input
              id="rfq-target-shipment"
              type="text"
              name="targetShipmentMonth"
              value={formData.targetShipmentMonth}
              onChange={handleInputChange}
              placeholder="e.g. November 2026 / Prompt"
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-surface-border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
          </div>

          <div>
            <label htmlFor="rfq-payment-term" className="block text-xs font-semibold text-neutral-700 mb-1">
              Preferred Payment Term
            </label>
            <select
              id="rfq-payment-term"
              name="paymentTerm"
              value={formData.paymentTerm}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-surface-border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800"
            >
              <option value="TT">Telegraphic Transfer (TT Deposit + BL)</option>
              <option value="LC">Irrevocable LC at Sight</option>
              <option value="CAD">Cash Against Documents (CAD)</option>
              <option value="Other">Custom Commercial Terms</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-surface-border bg-surface-canvas cursor-pointer hover:bg-neutral-50 min-h-[48px] active:scale-[0.99] transition-all">
            <input
              type="checkbox"
              name="needsPrivateLabel"
              checked={formData.needsPrivateLabel}
              onChange={handleInputChange}
              className="w-5 h-5 rounded text-primary-800 focus:ring-primary-800 shrink-0"
            />
            <span className="text-xs text-neutral-800 font-medium leading-snug">
              Require Custom Private Label OEM Packaging
            </span>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-surface-border bg-surface-canvas cursor-pointer hover:bg-neutral-50 min-h-[48px] active:scale-[0.99] transition-all">
            <input
              type="checkbox"
              name="needsSample"
              checked={formData.needsSample}
              onChange={handleInputChange}
              className="w-5 h-5 rounded text-primary-800 focus:ring-primary-800 shrink-0"
            />
            <span className="text-xs text-neutral-800 font-medium leading-snug">
              Require Courier Lab Sample Dispatch (DHL / FedEx)
            </span>
          </label>
        </div>
      </div>

      {/* Section 4: Specifications & Notes */}
      <div className="space-y-4">
        <div className="border-b border-surface-border pb-2">
          <h3 className="font-serif text-lg font-bold text-neutral-900">
            4. Detailed Product Specifications & Tolerances
          </h3>
        </div>

        <div>
          <label htmlFor="rfq-message" className="block text-xs font-semibold text-neutral-700 mb-1">
            <span>Chemical Specs, Moisture Limits, Packaging Details, or Special Certifications:</span>
            {items.length === 0 && (
              <span className="text-accent-800 font-medium ml-1.5 text-[11px]">
                *(Required if no commodities are added in Section 2)
              </span>
            )}
          </label>
          <textarea
            id="rfq-message"
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="e.g. Require Turmeric powder, packing in 25kg bags. Please quote CIF Hamburg with export documentation on request."
            className={`w-full p-3 text-xs sm:text-sm rounded-lg border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800 ${
              formErrors.items && items.length === 0
                ? 'border-status-error ring-1 ring-status-error'
                : 'border-surface-border'
            }`}
          />
          {formErrors.items && items.length === 0 && (
            <span id="rfq-message-error" role="alert" className="text-[11px] text-status-error mt-1 block font-medium">
              {formErrors.items}
            </span>
          )}
        </div>
      </div>

      {/* Prominent Error Alert Above Submit Button */}
      {(submitError || Object.keys(formErrors).length > 0) && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border-2 border-status-error/40 text-xs text-status-error space-y-2 animate-in fade-in"
        >
          <div className="flex items-center gap-2 font-bold text-sm text-status-error">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>
              {submitError
                ? 'Submission failed. Please check the error below:'
                : 'Please complete the required details before submitting:'}
            </span>
          </div>

          {submitError && (
            <p className="text-neutral-800 font-medium">
              {submitError.message || 'Unable to submit quotation request. Please check your internet connection and try again.'}
            </p>
          )}

          {Object.keys(formErrors).length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-neutral-800 font-medium pl-1">
              {formErrors.name && <li>Contact Name: {formErrors.name}</li>}
              {formErrors.email && <li>Business Email: {formErrors.email}</li>}
              {formErrors.company && <li>Company Name: {formErrors.company}</li>}
              {formErrors.country && <li>Destination Country: {formErrors.country}</li>}
              {formErrors.items && <li>Commodity / Requirements: {formErrors.items}</li>}
            </ul>
          )}
        </div>
      )}

      {/* Trust Commitment & Submit Button */}
      <div className="pt-4 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <ShieldCheck className="w-4 h-4 text-primary-800 shrink-0" />
          <span>Non-disclosure protected • Binding proforma issued within 48h</span>
        </div>

        <Button
          type="submit"
          variant="cta"
          size="lg"
          loading={isSubmitting}
          className="w-full sm:w-auto px-8 flex items-center justify-center gap-2 shadow-hover text-sm min-h-[48px]"
        >
          <Send className="w-4 h-4" />
          <span>Submit Request for Quotation (RFQ)</span>
        </Button>
      </div>
    </form>
  );
};

export default QuoteForm;
