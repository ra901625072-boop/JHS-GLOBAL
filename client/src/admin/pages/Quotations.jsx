import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Plus,
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Send,
  Anchor,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  Trash2,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import {
  fetchAdminQuotations,
  fetchAdminQuotationById,
  createAdminQuotation,
  updateAdminQuotationStatus,
  getQuotationPdfDownloadUrl,
} from '../api';
import Button from '../../components/ui/Button';
import AdminStatusBadge from '../components/AdminStatusBadge';
import AdminTableShell from '../components/AdminTableShell';
import AdminDrawer from '../components/AdminDrawer';
import Reveal from '../../components/ui/Reveal';

export const Quotations = () => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [feedback, setFeedback] = useState('');

  // New Quotation Form State
  const [formData, setFormData] = useState({
    buyer: {
      name: '',
      email: '',
      company: '',
      country: '',
      phone: '',
      address: '',
    },
    items: [
      {
        productName: '',
        specification: '',
        quantity: 20,
        unit: 'MT',
        unitPrice: 1800,
        total: 36000,
      },
    ],
    currency: 'USD',
    shippingCharges: 2200,
    insuranceCharges: 300,
    otherCharges: 200,
    incoterm: 'CIF',
    portOfLoading: 'Mundra Port / JNPT, India',
    portOfDischarge: '',
    paymentTerms: '30% Advance TT, 70% against BL copy',
    validityDays: 14,
    deliveryTime: '15-20 business days post order confirmation',
    notes: 'Price includes standard export packaging, phytosanitary inspection, and certificate of origin.',
  });

  // Fetch Quotations List
  const { data: quoteData, isLoading } = useQuery({
    queryKey: ['admin-quotations', selectedStatus, searchQuery],
    queryFn: () =>
      fetchAdminQuotations({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        q: searchQuery.trim() || undefined,
        limit: 50,
      }),
  });

  // Fetch Selected Quotation Details
  const { data: activeQuotation, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-quotation-detail', selectedQuoteId],
    queryFn: () => fetchAdminQuotationById(selectedQuoteId),
    enabled: !!selectedQuoteId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createAdminQuotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-quotations']);
      setCreateModalOpen(false);
      setFeedback('Quotation issued successfully');
      setTimeout(() => setFeedback(''), 4000);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateAdminQuotationStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-quotations']);
      queryClient.invalidateQueries(['admin-quotation-detail', selectedQuoteId]);
      setFeedback('Quotation status updated');
      setTimeout(() => setFeedback(''), 4000);
    },
  });

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      const q = parseFloat(field === 'quantity' ? value : updated[index].quantity) || 0;
      const p = parseFloat(field === 'unitPrice' ? value : updated[index].unitPrice) || 0;
      updated[index].total = q * p;
    }
    setFormData({ ...formData, items: updated });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productName: '',
          specification: '',
          quantity: 10,
          unit: 'MT',
          unitPrice: 1500,
          total: 15000,
        },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
  const totalAmount =
    subtotal +
    (parseFloat(formData.shippingCharges) || 0) +
    (parseFloat(formData.insuranceCharges) || 0) +
    (parseFloat(formData.otherCharges) || 0);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + parseInt(formData.validityDays || 14, 10));

    createMutation.mutate({
      buyer: formData.buyer,
      items: formData.items,
      currency: formData.currency,
      subtotal,
      shippingCharges: parseFloat(formData.shippingCharges) || 0,
      insuranceCharges: parseFloat(formData.insuranceCharges) || 0,
      otherCharges: parseFloat(formData.otherCharges) || 0,
      totalAmount,
      incoterm: formData.incoterm,
      portOfLoading: formData.portOfLoading,
      portOfDischarge: formData.portOfDischarge,
      paymentTerms: formData.paymentTerms,
      validityDate,
      deliveryTime: formData.deliveryTime,
      notes: formData.notes,
      status: 'sent',
    });
  };

  const quotations = quoteData?.quotations || [];

  const statusOptions = ['all', 'sent', 'negotiation', 'accepted', 'rejected', 'expired'];

  return (
    <>
      <Helmet>
        <title>Commercial Quotations & Proforma PDFs — Admin Suite</title>
      </Helmet>

      {/* Header */}
      <Reveal direction="up" distance={16} duration={0.5} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold mb-2">
              <FileText className="w-3.5 h-3.5 text-neutral-900" />
              <span>EXPORT PROFORMA ENGINE • INCOTERMS 2020</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Commercial Quotations & Proformas
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
              Issue binding price commitments, calculate CIF/CFR freight breakdowns, and generate official stamped PDF proformas.
            </p>
          </div>

          <Button
            variant="cta"
            size="md"
            onClick={() => setCreateModalOpen(true)}
            className="text-xs font-bold flex items-center gap-1.5 shadow-subtle shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create New Proforma</span>
          </Button>
        </div>
      </Reveal>

      {feedback && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{feedback}</span>
        </div>
      )}

      {/* Status Segmented Tabs */}
      <Reveal direction="up" distance={12} duration={0.4} className="mb-5">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-neutral-200/90 rounded-xl shadow-2xs overflow-x-auto">
          {statusOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelectedStatus(opt)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide capitalize transition-all whitespace-nowrap ${
                selectedStatus === opt
                  ? 'bg-primary-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
              }`}
            >
              {opt === 'all' ? 'All Proformas' : opt}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Quotations High-Density Table */}
      <Reveal direction="up" distance={20} duration={0.5}>
        <AdminTableShell
          title="Issued Proforma Register"
        description="Official commercial commitments issued to overseas consignees with ICC Incoterms validity"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by Quote Ref, Buyer Company, or Commodity..."
        totalCount={quotations.length}
        loading={isLoading}
        empty={quotations.length === 0}
        emptyMessage="No commercial quotations match the selected filters."
      >
        <table className="min-w-full divide-y divide-neutral-200 text-left text-xs">
          <thead className="bg-neutral-50/90 text-neutral-600 font-semibold border-b border-neutral-200">
            <tr>
              <th className="px-5 py-3">Quote Ref</th>
              <th className="px-5 py-3">Buyer Company</th>
              <th className="px-5 py-3">Destination</th>
              <th className="px-5 py-3">Commodities</th>
              <th className="px-5 py-3">Total Amount</th>
              <th className="px-5 py-3">Incoterm</th>
              <th className="px-5 py-3">Trade Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-700 bg-white">
            {quotations.map((q) => (
              <tr
                key={q._id}
                onClick={() => setSelectedQuoteId(q._id)}
                className={`transition-colors cursor-pointer ${
                  selectedQuoteId === q._id
                    ? 'bg-primary-50/80 font-medium border-l-4 border-l-primary-800'
                    : 'hover:bg-neutral-50/80'
                }`}
              >
                <td className="px-5 py-4 font-mono font-bold text-primary-900 whitespace-nowrap">
                  {q.quotationNumber}
                </td>
                <td className="px-5 py-4">
                  <div className="font-semibold text-neutral-900">{q.buyer?.company}</div>
                  <div className="text-neutral-500 text-[11px]">{q.buyer?.name}</div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap font-medium text-neutral-800">
                  {q.buyer?.country || 'Export'}
                </td>
                <td className="px-5 py-4">
                  <div className="max-w-xs truncate text-neutral-700">
                    {q.items?.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-neutral-900">
                  {q.currency} {Number(q.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-4 whitespace-nowrap font-mono font-semibold text-neutral-800">
                  {q.incoterm}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <AdminStatusBadge status={q.status} />
                </td>
                <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={getQuotationPdfDownloadUrl(q._id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-primary-800 hover:text-primary-900 rounded-lg bg-primary-50 hover:bg-primary-100 border border-primary-200 transition-colors"
                      title="Download PDF Proforma"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setSelectedQuoteId(q._id)}
                      className="px-2.5 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>
      </Reveal>

      {/* Quotation Detail Slide-over Drawer using AdminDrawer */}
      <AdminDrawer
        isOpen={!!selectedQuoteId && !!activeQuotation}
        onClose={() => setSelectedQuoteId(null)}
        title={activeQuotation?.quotationNumber || 'Loading Proforma...'}
        subtitle={`Commercial Proforma Invoice • ${activeQuotation ? activeQuotation.buyer?.company : ''}`}
        badge={activeQuotation && <AdminStatusBadge status={activeQuotation.status} />}
        maxWidth="max-w-2xl"
        footer={
          activeQuotation && (
            <div className="flex items-center justify-between w-full">
              <a
                href={getQuotationPdfDownloadUrl(activeQuotation._id)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-800 hover:bg-primary-900 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF Proforma</span>
              </a>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedQuoteId(null)}
              >
                Close Drawer
              </Button>
            </div>
          )
        }
      >
        {activeQuotation && (
          <div className="space-y-6 text-xs">
            {/* Status Selector Bar */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/90 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Update Proforma Status</span>
                <select
                  value={activeQuotation.status}
                  onChange={(e) =>
                    updateStatusMutation.mutate({ id: activeQuotation._id, status: e.target.value })
                  }
                  className="font-semibold text-xs p-2 bg-white border border-neutral-300 rounded-lg capitalize text-neutral-800 focus:ring-2 focus:ring-primary-800"
                >
                  {['draft', 'sent', 'negotiation', 'accepted', 'rejected', 'expired'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total Proforma Value</span>
                <span className="font-mono text-base font-bold text-primary-900">
                  {activeQuotation.currency} {Number(activeQuotation.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Consignee Details */}
            <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-3">
              <h3 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary-800" />
                <span>Consignee & Destination Data</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Company</span>
                  <strong className="text-neutral-900 text-sm">{activeQuotation.buyer?.company}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Contact Person</span>
                  <strong className="text-neutral-900 text-sm">{activeQuotation.buyer?.name}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Destination Country</span>
                  <span className="text-neutral-800 font-medium">{activeQuotation.buyer?.country}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Corporate Email</span>
                  <span className="text-primary-800 font-medium">{activeQuotation.buyer?.email}</span>
                </div>
              </div>
            </div>

            {/* Commodities & Pricing */}
            <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-3">
              <h3 className="font-serif text-sm font-bold text-neutral-900">
                Commodity Line Items
              </h3>
              <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden">
                {activeQuotation.items?.map((it, idx) => (
                  <div key={idx} className="p-3.5 bg-neutral-50/50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-neutral-900 text-sm">{it.productName}</div>
                      <div className="text-neutral-500 text-[11px] mt-0.5">{it.specification}</div>
                      <div className="text-[11px] text-neutral-600 mt-0.5 font-mono">
                        {it.quantity} {it.unit} @ {activeQuotation.currency} {it.unitPrice}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-neutral-900 text-sm">
                      {activeQuotation.currency} {it.total.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-3 space-y-1.5 text-right font-mono text-xs border-t border-neutral-100">
                <div className="text-neutral-500">
                  FOB Base Subtotal: {activeQuotation.currency} {activeQuotation.subtotal?.toLocaleString()}
                </div>
                {activeQuotation.shippingCharges > 0 && (
                  <div className="text-neutral-500">
                    Ocean Freight ({activeQuotation.incoterm}): {activeQuotation.currency}{' '}
                    {activeQuotation.shippingCharges?.toLocaleString()}
                  </div>
                )}
                {activeQuotation.insuranceCharges > 0 && (
                  <div className="text-neutral-500">
                    Marine Insurance: {activeQuotation.currency}{' '}
                    {activeQuotation.insuranceCharges?.toLocaleString()}
                  </div>
                )}
                <div className="pt-2 border-t border-neutral-200 text-sm font-bold text-primary-900">
                  Total CIF Destination: {activeQuotation.currency}{' '}
                  {activeQuotation.totalAmount?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Trade Terms & Incoterms */}
            <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-3">
              <h3 className="font-serif text-sm font-bold text-neutral-900">
                International Trade Terms & Incoterms
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Incoterm</span>
                  <span className="font-mono font-bold text-neutral-900">{activeQuotation.incoterm}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Port of Loading</span>
                  <span className="font-medium text-neutral-900">{activeQuotation.portOfLoading}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Discharge Port</span>
                  <span className="font-medium text-neutral-900">{activeQuotation.portOfDischarge || 'To be specified'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Payment Terms</span>
                  <span className="font-medium text-neutral-900">{activeQuotation.paymentTerms}</span>
                </div>
              </div>

              {activeQuotation.notes && (
                <div className="mt-3 p-3 bg-neutral-50 rounded-lg text-xs text-neutral-600 leading-relaxed border border-neutral-200/60">
                  <strong className="block text-neutral-800 text-[10px] uppercase mb-1">Contract Notes</strong>
                  {activeQuotation.notes}
                </div>
              )}
            </div>
          </div>
        )}
      </AdminDrawer>

      {/* Create New Quotation Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-neutral-200 transform-gpu animate-in zoom-in-95 duration-200"
            style={{ transitionTimingFunction: 'var(--ease-enter)' }}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-900">
                  Issue Official Commercial Proforma
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Calculate freight, packaging, and generate binding export quote
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
              {/* Buyer Information Section */}
              <div className="space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-neutral-800 text-[11px] border-b border-neutral-100 pb-1">
                  1. Buyer & Consignee Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.buyer.company}
                      onChange={(e) =>
                        setFormData({ ...formData, buyer: { ...formData.buyer, company: e.target.value } })
                      }
                      placeholder="e.g. Al-Madina Foodstuffs LLC"
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Contact Officer Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.buyer.name}
                      onChange={(e) =>
                        setFormData({ ...formData, buyer: { ...formData.buyer, name: e.target.value } })
                      }
                      placeholder="e.g. Tariq Mansoor"
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Corporate Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.buyer.email}
                      onChange={(e) =>
                        setFormData({ ...formData, buyer: { ...formData.buyer, email: e.target.value } })
                      }
                      placeholder="e.g. procurement@almadina.ae"
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Destination Country *</label>
                    <input
                      type="text"
                      required
                      value={formData.buyer.country}
                      onChange={(e) =>
                        setFormData({ ...formData, buyer: { ...formData.buyer, country: e.target.value } })
                      }
                      placeholder="e.g. United Arab Emirates"
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Commodities Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-1">
                  <h4 className="font-bold uppercase tracking-wider text-neutral-800 text-[11px]">
                    2. Commodity Line Items
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-neutral-900 hover:text-black font-bold flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Line Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-12 gap-2.5 items-end"
                    >
                      <div className="col-span-4">
                        <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Commodity</label>
                        <input
                          type="text"
                          required
                          value={it.productName}
                          onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                          placeholder="e.g. Organic Cumin Seeds (Machine Cleaned)"
                          className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Quantity</label>
                        <input
                          type="number"
                          required
                          value={it.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Unit</label>
                        <select
                          value={it.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                        >
                          <option value="MT">MT (Tonne)</option>
                          <option value="KG">KG</option>
                          <option value="FCL">FCL Container</option>
                          <option value="Bags">Bags</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Unit Price ($)</label>
                        <input
                          type="number"
                          required
                          value={it.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-1 text-right font-mono font-bold text-neutral-900 pb-2">
                        ${it.total.toLocaleString()}
                      </div>
                      <div className="col-span-1 pb-1 text-right">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Freight, Charges & Incoterms */}
              <div className="space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-neutral-800 text-[11px] border-b border-neutral-100 pb-1">
                  3. Freight, Insurance & Commercial Conditions
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Incoterm</label>
                    <select
                      value={formData.incoterm}
                      onChange={(e) => setFormData({ ...formData, incoterm: e.target.value })}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono font-semibold"
                    >
                      <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                      <option value="FOB">FOB (Free On Board - Mundra)</option>
                      <option value="CFR">CFR (Cost & Freight)</option>
                      <option value="EXW">EXW (Ex Works)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Ocean Freight ($)</label>
                    <input
                      type="number"
                      value={formData.shippingCharges}
                      onChange={(e) => setFormData({ ...formData, shippingCharges: e.target.value })}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Marine Insurance ($)</label>
                    <input
                      type="number"
                      value={formData.insuranceCharges}
                      onChange={(e) => setFormData({ ...formData, insuranceCharges: e.target.value })}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Discharge Port</label>
                    <input
                      type="text"
                      value={formData.portOfDischarge}
                      onChange={(e) => setFormData({ ...formData, portOfDischarge: e.target.value })}
                      placeholder="e.g. Jebel Ali / Rotterdam"
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="p-4 bg-primary-50 rounded-xl border border-primary-200/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-primary-900 block">Total Calculated Commercial Quotation:</span>
                    <span className="text-neutral-500 text-[11px]">Includes base FOB goods + ocean carriage + transit insurance</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-primary-900">
                    USD ${totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="cta"
                  size="sm"
                  loading={createMutation.isPending}
                  className="font-bold"
                >
                  Confirm & Issue Proforma
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Quotations;
