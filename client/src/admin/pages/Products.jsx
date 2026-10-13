import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  X,
  ExternalLink,
  Tag,
  Boxes,
  Sparkles,
  ShieldCheck,
  Loader2,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
} from 'lucide-react';
import {
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  generateAiProductContent,
  fetchAiCatalogueAudit,
} from '../api';
import { fetchProducts, fetchCategories } from '../../features/products/api';
import Button from '../../components/ui/Button';
import AdminStatusBadge from '../components/AdminStatusBadge';
import AdminTableShell from '../components/AdminTableShell';
import Reveal from '../../components/ui/Reveal';

export const Products = () => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDraftNotice, setAiDraftNotice] = useState('');
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditData, setAuditData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    hsCode: '',
    origin: 'India',
    shortDescription: '',
    moqValue: 1,
    moqUnit: 'MT',
    packingType: 'PP Bag',
    packingSize: '25 kg',
    shelfLifeMonths: 24,
    isFeatured: false,
    isActive: true,
    isPrivateLabelAvailable: true,
  });

  // Fetch Categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Fetch Products
  const { data: productData, isLoading } = useQuery({
    queryKey: ['admin-products', selectedCategory, searchQuery],
    queryFn: () =>
      fetchProducts({
        category: selectedCategory || undefined,
        q: searchQuery || undefined,
        limit: 50,
      }),
  });

  const products = productData?.products || [];

  const createMutation = useMutation({
    mutationFn: (data) => createAdminProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      queryClient.invalidateQueries(['products']);
      setModalOpen(false);
      setFeedback('Product added to catalogue successfully');
      setTimeout(() => setFeedback(''), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      queryClient.invalidateQueries(['products']);
      setModalOpen(false);
      setEditingProduct(null);
      setFeedback('Product updated successfully');
      setTimeout(() => setFeedback(''), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAdminProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      queryClient.invalidateQueries(['products']);
      setFeedback('Product deactivated');
      setTimeout(() => setFeedback(''), 4000);
    },
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?._id || '',
      hsCode: '',
      origin: 'India',
      shortDescription: '',
      moqValue: 1,
      moqUnit: 'MT',
      packingType: 'PP Bag',
      packingSize: '25 kg',
      shelfLifeMonths: 24,
      isFeatured: false,
      isActive: true,
      isPrivateLabelAvailable: true,
    });
    setErrorMsg('');
    setAiDraftNotice('');
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId?._id || product.categoryId || '',
      hsCode: product.hsCode || '',
      origin: product.origin || 'India',
      shortDescription: product.shortDescription || '',
      moqValue: product.moq?.value || 1,
      moqUnit: product.moq?.unit || 'MT',
      packingType: product.packing?.[0]?.type || 'PP Bag',
      packingSize: product.packing?.[0]?.size || '25 kg',
      shelfLifeMonths: product.shelfLifeMonths || 24,
      isFeatured: !!product.isFeatured,
      isActive: product.isActive !== false,
      isPrivateLabelAvailable: !!product.isPrivateLabelAvailable,
    });
    setErrorMsg('');
    setAiDraftNotice('');
    setModalOpen(true);
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setErrorMsg('');
    try {
      const data = await fetchAiCatalogueAudit();
      setAuditData(data);
      setAuditModalOpen(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to complete catalogue audit');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!formData.name) {
      setErrorMsg('Please enter a commodity name first before invoking AI assist.');
      return;
    }
    setErrorMsg('');
    setAiGenerating(true);
    setAiDraftNotice('');
    try {
      const catObj = categories.find((c) => c._id === formData.categoryId);
      const res = await generateAiProductContent({
        productName: formData.name,
        categoryName: catObj?.name || 'Agro Commodities',
        origin: formData.origin || 'India',
        targetMarkets: ['Middle East', 'Europe', 'North America'],
      });
      const generated = res?.data || res;
      if (generated) {
        setFormData((prev) => ({
          ...prev,
          shortDescription:
            generated.shortDescription || generated.description || prev.shortDescription,
          hsCode:
            generated.specSuggestions?.suggestedHsCode ||
            generated.suggestedHsCode ||
            prev.hsCode,
          moqValue:
            generated.specSuggestions?.suggestedMoq?.value ||
            generated.suggestedMoq?.value ||
            prev.moqValue,
          moqUnit:
            generated.specSuggestions?.suggestedMoq?.unit ||
            generated.suggestedMoq?.unit ||
            prev.moqUnit,
          packingType:
            generated.specSuggestions?.suggestedPacking || prev.packingType,
        }));
        setAiDraftNotice('AI draft applied! Review specifications and HS code before saving.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate AI content');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const payload = {
      name: formData.name,
      categoryId: formData.categoryId,
      hsCode: formData.hsCode,
      origin: formData.origin,
      shortDescription: formData.shortDescription,
      moq: {
        value: Number(formData.moqValue),
        unit: formData.moqUnit,
      },
      packing: [{ type: formData.packingType, size: formData.packingSize }],
      shelfLifeMonths: Number(formData.shelfLifeMonths),
      isFeatured: formData.isFeatured,
      isActive: formData.isActive,
      isPrivateLabelAvailable: formData.isPrivateLabelAvailable,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <>
      <Helmet>
        <title>Export Commodities Catalogue — Admin Suite</title>
      </Helmet>

      {/* Header */}
      <Reveal direction="up" distance={16} duration={0.5} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold mb-2">
              <Package className="w-3.5 h-3.5 text-neutral-900" />
              <span>COMMODITY SPECIFICATIONS & HS CODE REPOSITORY</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Export Commodities Catalogue
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
              Maintain technical laboratory specifications, container packing metrics, 6-digit HS codes, and OEM private label options.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              type="button"
              onClick={handleRunAudit}
              variant="outline"
              disabled={isAuditing}
              className="text-xs py-2 flex items-center gap-1.5 font-semibold"
            >
              {isAuditing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-700" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
              )}
              <span>{isAuditing ? 'Auditing...' : 'Quality Audit'}</span>
            </Button>

            <Button
              onClick={openCreateModal}
              variant="cta"
              className="text-xs py-2 flex items-center gap-1.5 font-bold shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Commodity</span>
            </Button>
          </div>
        </div>
      </Reveal>

      {feedback && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{feedback}</span>
        </div>
      )}

      {/* Product Table / Grid using AdminTableShell */}
      <Reveal direction="up" distance={20} duration={0.5}>
        <AdminTableShell
          title="Commodity Specification Database"
        description="Publicly listed and internal export catalogue products"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search commodities or HS Code..."
        totalCount={products.length}
        actions={
          <div className="flex items-center gap-1 bg-neutral-100/90 p-1 rounded-lg border border-neutral-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-primary-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Dense Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Merchandising Visual Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>
        }
        filters={
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 font-medium focus:ring-2 focus:ring-primary-800 focus:bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        }
        loading={isLoading}
        empty={products.length === 0}
        emptyMessage="No commodities match the selected search or category filters."
      >
        {viewMode === 'table' ? (
          <table className="min-w-full divide-y divide-neutral-200 text-left text-xs">
            <thead className="bg-neutral-50/90 text-neutral-600 font-semibold border-b border-neutral-200">
              <tr>
                <th className="px-5 py-3">Commodity Name</th>
                <th className="px-5 py-3">HS Code</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Minimum Order (MOQ)</th>
                <th className="px-5 py-3">Export Packing</th>
                <th className="px-5 py-3">Catalogue Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700 bg-white">
              {products.map((p) => {
                const imgUrl = p.images?.[0]?.url || p.images?.[0] || `/images/products/${p.slug}.webp`;
                return (
                  <tr key={p._id} className="hover:bg-primary-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 relative group/thumb">
                          <img
                            src={imgUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900 text-sm">{p.name}</div>
                          <div className="text-neutral-400 text-[11px] font-mono mt-0.5">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono font-bold bg-neutral-100 text-neutral-800 border border-neutral-200 px-2 py-0.5 rounded text-xs">
                        {p.hsCode || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-neutral-700 font-medium">{p.categoryId?.name || 'Standard'}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-neutral-900">
                      {p.moq?.value} {p.moq?.unit}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-neutral-600">
                      {p.packing?.[0] ? `${p.packing[0].size} ${p.packing[0].type}` : 'Standard PP'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <AdminStatusBadge status={p.isActive !== false ? 'active' : 'cold'} />
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-neutral-600 hover:text-primary-900 hover:bg-neutral-100 rounded-md transition-colors"
                        title="Edit commodity"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deactivate ${p.name} from public catalogue?`)) {
                            deleteMutation.mutate(p._id);
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Deactivate commodity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5 p-5 bg-[#FBFBF9]/30">
            {products.map((p) => {
              const imgUrl = p.images?.[0]?.url || p.images?.[0] || `/images/products/${p.slug}.webp`;
              return (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-subtle hover:border-neutral-400 transition-all p-4.5 flex flex-col justify-between group space-y-3"
                >
                  <div>
                    {/* Card Top Pill Row */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200">
                        {p.categoryId?.name || 'Raw Material'}
                      </span>
                      <AdminStatusBadge status={p.isActive !== false ? 'active' : 'cold'} />
                    </div>

                    {/* Product Image Preview with TODO(client) Badge */}
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 mb-3 border border-neutral-200">
                      <img
                        src={imgUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-amber-950/85 backdrop-blur-xs text-amber-200 text-[10px] font-medium px-2 py-0.5 rounded text-center truncate border border-amber-500/30">
                        Illustrative image (replace with real photo) — TODO(client)
                      </div>
                    </div>

                    {/* Title & HS Code */}
                    <div className="space-y-1">
                      <h3 className="font-serif text-base font-bold text-neutral-900 group-hover:text-primary-900 transition-colors">
                        {p.name}
                      </h3>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                        HS {p.hsCode || 'Pending'}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-medium">Origin: {p.origin || 'India'}</span>
                    </div>
                  </div>

                  {/* Description snippet */}
                  {p.shortDescription && (
                    <p className="text-xs text-neutral-500 line-clamp-2 mt-2 leading-relaxed">
                      {p.shortDescription}
                    </p>
                  )}

                  {/* Specifications Pill Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-neutral-100 text-[11px]">
                    <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Min. Order (MOQ)</span>
                      <span className="font-mono font-bold text-neutral-800">{p.moq?.value} {p.moq?.unit}</span>
                    </div>
                    <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Packing Standard</span>
                      <span className="font-medium text-neutral-800 truncate block">
                        {p.packing?.[0] ? `${p.packing[0].size} ${p.packing[0].type}` : 'Standard PP'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs">
                  <a
                    href={`/products/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-primary-800 flex items-center gap-1 font-medium text-[11px] transition-colors"
                  >
                    <span>Live Preview</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(p)}
                      className="px-2.5 py-1 text-xs font-semibold text-primary-900 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors flex items-center gap-1 active:scale-[0.98]"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deactivate ${p.name} from public catalogue?`)) {
                          deleteMutation.mutate(p._id);
                        }
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors"
                      title="Deactivate commodity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </AdminTableShell>
      </Reveal>

      {/* Modal for Create/Edit Commodity */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-neutral-200 max-h-[90vh] flex flex-col transform-gpu animate-in zoom-in-95 duration-200"
            style={{ transitionTimingFunction: 'var(--ease-enter)' }}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-900">
                  {editingProduct ? `Edit Commodity: ${editingProduct.name}` : 'Register New Export Commodity'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Laboratory parameters, HS code classification, and export packaging specifications
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              {/* AI Content Drafting Card matching Visitor Hero styling */}
              <div className="bg-gradient-to-br from-[#06180E] via-[#0A2619] to-[#04120A] text-white rounded-xl p-4 border border-primary-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <p className="font-serif text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>AI Commodity Content & HS Code Assistant</span>
                  </p>
                  <p className="text-[11px] text-neutral-300 mt-0.5">
                    Enter the commodity title below and let AI propose export specs, HS codes, and container sizes.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline-light"
                  size="sm"
                  loading={aiGenerating}
                  onClick={handleAiGenerate}
                  className="shrink-0 text-xs font-semibold py-2 px-3 border-white/20 text-white hover:bg-white/10"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-white" />
                  Draft with AI
                </Button>
              </div>

              {aiDraftNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-medium">{aiDraftNotice}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Commodity Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Salem Turmeric Finger (High Curcumin)"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    HS Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hsCode}
                    onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
                    placeholder="e.g. 0910.30"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Country of Origin
                  </label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Technical Specifications & Summary
                </label>
                <textarea
                  rows={3}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Aroma, purity %, moisture content, Sortex cleaning grade, origin belt..."
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">MOQ Value</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.moqValue}
                    onChange={(e) => setFormData({ ...formData, moqValue: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">MOQ Unit</label>
                  <input
                    type="text"
                    value={formData.moqUnit}
                    onChange={(e) => setFormData({ ...formData, moqUnit: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Packing Size</label>
                  <input
                    type="text"
                    value={formData.packingSize}
                    onChange={(e) => setFormData({ ...formData, packingSize: e.target.value })}
                    placeholder="25 kg"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Packing Type</label>
                  <input
                    type="text"
                    value={formData.packingType}
                    onChange={(e) => setFormData({ ...formData, packingType: e.target.value })}
                    placeholder="PP Bag"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPrivateLabelAvailable}
                    onChange={(e) =>
                      setFormData({ ...formData, isPrivateLabelAvailable: e.target.checked })
                    }
                    className="rounded text-primary-800 focus:ring-primary-800"
                  />
                  <span className="text-neutral-700 font-medium">Private Label OEM Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-primary-800 focus:ring-primary-800"
                  />
                  <span className="text-neutral-700 font-medium">Feature in Public Showcase</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="cta"
                  size="sm"
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingProduct ? 'Save Changes' : 'Confirm & Register'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Catalogue Quality Audit Modal */}
      {auditModalOpen && auditData && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200 transform-gpu animate-in zoom-in-95 duration-200"
            style={{ transitionTimingFunction: 'var(--ease-enter)' }}
          >
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <span>Export Quality & HS Compliance Audit</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-800 border border-primary-200 font-mono">
                      Health Score: {auditData.catalogueHealthScore}%
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {auditData.summary}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuditModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Health Score Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                  <span className="text-[11px] text-neutral-500 block uppercase font-medium">
                    Total Audited
                  </span>
                  <span className="font-serif text-2xl font-bold text-neutral-900">
                    {auditData.totalAudited}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[11px] text-emerald-700 block uppercase font-medium">
                    Fully Compliant
                  </span>
                  <span className="font-serif text-2xl font-bold text-emerald-800">
                    {auditData.healthyCount}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-[11px] text-amber-700 block uppercase font-medium">
                    Needs Attention
                  </span>
                  <span className="font-serif text-2xl font-bold text-amber-800">
                    {auditData.flawedCount}
                  </span>
                </div>
              </div>

              {/* Issues List */}
              {auditData.issues && auditData.issues.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Commodities Requiring Enrichment ({auditData.issues.length})
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {auditData.issues.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-neutral-900 text-sm">
                              {item.productName}
                            </span>
                            <span className="text-[11px] text-neutral-500 ml-2">
                              ({item.category})
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              item.severity === 'high'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : item.severity === 'medium'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-sky-100 text-sky-800 border border-sky-200'
                            }`}
                          >
                            {item.severity} priority
                          </span>
                        </div>

                        {/* Missing Fields Badges */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.missingFields.map((field, fIdx) => (
                            <span
                              key={fIdx}
                              className="text-[11px] bg-white border border-neutral-300 text-neutral-700 px-2 py-0.5 rounded font-mono"
                            >
                              Missing: {field}
                            </span>
                          ))}
                        </div>

                        {/* Suggested Fixes */}
                        {item.suggestedFixes && item.suggestedFixes.length > 0 && (
                          <ul className="text-xs text-neutral-600 list-disc list-inside space-y-0.5 pt-1">
                            {item.suggestedFixes.map((fix, fxIdx) => (
                              <li key={fxIdx}>{fix}</li>
                            ))}
                          </ul>
                        )}

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const found = products.find((p) => p._id === item.productId);
                              if (found) {
                                setAuditModalOpen(false);
                                openEditModal(found);
                              }
                            }}
                            className="text-xs font-semibold text-neutral-900 hover:text-black underline"
                          >
                            Open in Editor & Fix
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-serif text-base font-bold text-emerald-900">
                    All Active Products Are 100% Export Compliant!
                  </h4>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    Every active commodity has valid 6-digit HS codes, verified laboratory specs, packaging configurations, and SEO metadata.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-200 bg-neutral-50/70 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAuditModalOpen(false)}
              >
                Close Audit Dossier
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;
