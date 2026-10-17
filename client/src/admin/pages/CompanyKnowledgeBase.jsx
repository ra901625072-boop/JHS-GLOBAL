import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  FileText,
  RotateCw,
  ExternalLink,
  Layers,
  Database,
  Cpu,
  RefreshCw,
  Check,
  X,
  Lock,
  Globe,
  Loader2,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import {
  fetchAdminCompanyFacts,
  createAdminCompanyFact,
  updateAdminCompanyFact,
  deleteAdminCompanyFact,
  fetchAiDeskSummary,
  triggerAdminReindex,
} from '../api';
import Button from '../../components/ui/Button';
import {
  DataTable,
  FilterBar,
  AdminStatusBadge,
  AdminDrawer,
  AdminSkeleton,
} from '../components';

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'identity', label: 'Company Identity' },
  { id: 'certifications', label: 'Certifications & Statutory' },
  { id: 'operations', label: 'Export Operations & Ports' },
  { id: 'policy', label: 'Trade Policies & Terms' },
  { id: 'quality', label: 'Quality & Testing' },
  { id: 'contact', label: 'Official Contact' },
];

const INITIAL_FORM_STATE = {
  category: 'identity',
  factKey: '',
  label: '',
  factValue: '',
  source: 'client_document',
  sourceDocument: '',
  isVerified: true,
  isPublic: true,
  notes: '',
};

export const CompanyKnowledgeBase = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Query State
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const isVerified = searchParams.get('isVerified') || '';
  const isPublic = searchParams.get('isPublic') || '';

  // UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingFact, setEditingFact] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, fact: null });
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // TanStack Query: Fetch Company Facts
  const {
    data: factsResult,
    isLoading: loadingFacts,
    isError: errorFacts,
    refetch: refetchFacts,
  } = useQuery({
    queryKey: ['admin-company-facts', { page, search, category, isVerified, isPublic }],
    queryFn: () =>
      fetchAdminCompanyFacts({
        page,
        limit: 50,
        search,
        category: category && category !== 'all' ? category : undefined,
        isVerified: isVerified !== '' ? isVerified : undefined,
        isPublic: isPublic !== '' ? isPublic : undefined,
      }),
  });

  // TanStack Query: Fetch AI Desk & RAG Embedding Summary
  const {
    data: summaryData,
    isLoading: loadingSummary,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['admin-ai-desk-summary'],
    queryFn: fetchAiDeskSummary,
    staleTime: 30000,
  });

  const facts = factsResult?.facts || [];
  const totalCount = factsResult?.total || facts.length;

  const totalVerified = facts.filter((f) => f.isVerified).length;
  const totalUnverified = facts.filter((f) => !f.isVerified).length;

  // Mutations
  const createMutation = useMutation({
    mutationFn: createAdminCompanyFact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-company-facts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ai-desk-summary'] });
      setIsDrawerOpen(false);
      resetForm();
      showNotification('success', 'Company knowledge fact created and synchronized to vector index');
    },
    onError: (err) => {
      showNotification('error', err.response?.data?.message || 'Failed to create company fact');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminCompanyFact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-company-facts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ai-desk-summary'] });
      setIsDrawerOpen(false);
      resetForm();
      showNotification('success', 'Company knowledge fact updated and vector re-indexed');
    },
    onError: (err) => {
      showNotification('error', err.response?.data?.message || 'Failed to update company fact');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminCompanyFact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-company-facts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ai-desk-summary'] });
      setDeleteModalState({ isOpen: false, fact: null });
      showNotification('success', 'Company fact archived from knowledge repository');
    },
    onError: (err) => {
      showNotification('error', err.response?.data?.message || 'Failed to delete company fact');
    },
  });

  const reindexMutation = useMutation({
    mutationFn: triggerAdminReindex,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-ai-desk-summary'] });
      showNotification(
        'success',
        `RAG Re-indexing complete: ${result.indexedProducts || 0} products, ${result.indexedFaqs || 0} FAQs, ${result.indexedCompanyFacts || 0} company facts indexed.`
      );
    },
    onError: (err) => {
      showNotification('error', err.response?.data?.message || 'Failed to reindex vector database');
    },
  });

  // Drawer handlers
  const handleOpenCreate = () => {
    resetForm();
    setEditingFact(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (fact) => {
    setEditingFact(fact);
    setFormData({
      category: fact.category || 'identity',
      factKey: fact.factKey || '',
      label: fact.label || '',
      factValue: fact.factValue || '',
      source: fact.source || 'client_document',
      sourceDocument: fact.sourceDocument || '',
      isVerified: Boolean(fact.isVerified),
      isPublic: Boolean(fact.isPublic),
      notes: fact.notes || '',
    });
    setIsDrawerOpen(true);
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setEditingFact(null);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.factKey.trim() || !formData.label.trim() || !formData.factValue.trim()) {
      showNotification('error', 'Fact Key, Label, and Value are required fields.');
      return;
    }

    const payload = {
      category: formData.category,
      factKey: formData.factKey.trim().toLowerCase(),
      label: formData.label.trim(),
      factValue: formData.factValue.trim(),
      source: formData.source,
      sourceDocument: formData.sourceDocument.trim(),
      isVerified: Boolean(formData.isVerified),
      isPublic: Boolean(formData.isPublic),
      notes: formData.notes.trim(),
    };

    if (editingFact) {
      updateMutation.mutate({ id: editingFact.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleVerified = (fact) => {
    updateMutation.mutate({
      id: fact.id,
      data: { isVerified: !fact.isVerified },
    });
  };

  const togglePublic = (fact) => {
    updateMutation.mutate({
      id: fact.id,
      data: { isPublic: !fact.isPublic },
    });
  };

  // FilterBar configuration
  const filterConfig = useMemo(
    () => [
      {
        key: 'search',
        type: 'text',
        placeholder: 'Search facts, keys, values...',
        value: search,
      },
      {
        key: 'category',
        type: 'select',
        placeholder: 'All Categories',
        value: category,
        options: CATEGORIES.map((c) => ({
          label: c.label,
          value: c.id === 'all' ? '' : c.id,
        })),
      },
      {
        key: 'isVerified',
        type: 'select',
        placeholder: 'Verification',
        value: isVerified,
        options: [
          { label: 'All Facts', value: '' },
          { label: 'Verified (Client Documented)', value: 'true' },
          { label: 'Unverified / TODO(client)', value: 'false' },
        ],
      },
      {
        key: 'isPublic',
        type: 'select',
        placeholder: 'Visibility',
        value: isPublic,
        options: [
          { label: 'All Visibilities', value: '' },
          { label: 'Public (In RAG Index)', value: 'true' },
          { label: 'Internal Staff Only', value: 'false' },
        ],
      },
    ],
    [search, category, isVerified, isPublic]
  );

  const handleFilterChange = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleFilterReset = () => {
    setSearchParams({});
  };

  // DataTable column definitions
  const columns = [
    {
      key: 'category',
      title: 'Category',
      width: '140px',
      render: (val) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider text-[10px]">
          {val || 'General'}
        </span>
      ),
    },
    {
      key: 'factKey',
      title: 'Fact Key & Label',
      render: (_, row) => (
        <div className="space-y-1 max-w-sm">
          <div className="font-semibold text-stone-900 text-sm leading-tight">
            {row.label}
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-stone-500">
            <span className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
              {row.factKey}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'factValue',
      title: 'Fact Value / Statement',
      render: (val) => (
        <div className="max-w-md text-xs text-stone-700 font-mono leading-relaxed line-clamp-3">
          {val}
        </div>
      ),
    },
    {
      key: 'source',
      title: 'Attribution',
      width: '180px',
      render: (_, row) => (
        <div className="space-y-0.5 text-xs text-stone-500">
          <div className="font-medium text-stone-700 capitalize">
            {row.source?.replace('_', ' ') || 'Document'}
          </div>
          {row.sourceDocument && (
            <div className="text-[11px] text-stone-400 truncate max-w-[160px]" title={row.sourceDocument}>
              {row.sourceDocument}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'isVerified',
      title: 'Verified',
      width: '120px',
      render: (val, row) => (
        <button
          onClick={() => toggleVerified(row)}
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${
            row.isVerified
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
          }`}
          title="Click to toggle verification status"
        >
          {row.isVerified ? (
            <>
              <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
              <span>Verified</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
              <span>Unverified</span>
            </>
          )}
        </button>
      ),
    },
    {
      key: 'isPublic',
      title: 'Visibility',
      width: '110px',
      render: (val, row) => (
        <button
          onClick={() => togglePublic(row)}
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${
            row.isPublic
              ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
              : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
          }`}
          title="Click to toggle public search availability"
        >
          {row.isPublic ? (
            <>
              <Globe className="w-3 h-3 mr-1 text-blue-600" />
              <span>Public</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3 mr-1 text-stone-500" />
              <span>Internal</span>
            </>
          )}
        </button>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded transition-colors"
            title="Edit Fact"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteModalState({ isOpen: true, fact: row })}
            className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title="Archive Fact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Company Knowledge Base | JHS GLOBAL Admin</title>
      </Helmet>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-stone-400 hover:text-stone-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
              Company Knowledge Base & AI Grounding Desk
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-100 text-emerald-800">
              ZERO HALLUCINATION ENGINE
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Structured, versioned source of truth for verified company facts. Powers the public AI assistant and semantic search.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => reindexMutation.mutate()}
            disabled={reindexMutation.isPending}
            className="flex items-center space-x-1.5 border-emerald-700 text-emerald-800 hover:bg-emerald-50"
            title="Re-run RAG Vector Embedding across all catalogue items"
          >
            {reindexMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
            ) : (
              <RotateCw className="w-4 h-4 text-emerald-700" />
            )}
            <span>{reindexMutation.isPending ? 'Indexing...' : 'Trigger RAG Re-Index'}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-900 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Add Company Fact</span>
          </Button>
        </div>
      </div>

      {/* RAG Vector Embedding Status Strip */}
      <div className="bg-stone-900 text-stone-200 rounded-xl p-4 shadow-sm border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800/80">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <span>pgvector Embedding Store</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="text-sm text-stone-300 font-medium mt-0.5">
              {summaryData?.embeddings?.total || 0} Total Vectors Chunks Active in Knowledge Store
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-stone-400">
          <div>
            Products:{' '}
            <span className="text-emerald-400 font-bold">
              {summaryData?.embeddings?.bySource?.products || 0}
            </span>
          </div>
          <div>
            FAQs:{' '}
            <span className="text-emerald-400 font-bold">
              {summaryData?.embeddings?.bySource?.faqs || 0}
            </span>
          </div>
          <div>
            Company Facts:{' '}
            <span className="text-emerald-400 font-bold">
              {summaryData?.embeddings?.bySource?.companyFacts || 0}
            </span>
          </div>
          <div>
            Verification Rate:{' '}
            <span className="text-emerald-400 font-bold">
              {summaryData?.facts?.verificationRate || 100}%
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Facts</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{totalCount}</div>
          <div className="text-xs text-stone-500 mt-1">Repository items</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Verified Facts</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-800">{totalVerified}</div>
          <div className="text-xs text-emerald-600 mt-1">Backed by client documents</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Unverified / Pending</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-800">{totalUnverified}</div>
          <div className="text-xs text-amber-700 mt-1">Require client confirmation</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Public RAG Facts</span>
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {facts.filter((f) => f.isPublic).length}
          </div>
          <div className="text-xs text-blue-600 mt-1">Grounding visitor chats</div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filterConfig}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* Data Table */}
      {loadingFacts ? (
        <AdminSkeleton type="table" rows={6} />
      ) : errorFacts ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="text-base font-semibold text-stone-900">Failed to load company knowledge</h3>
          <p className="text-sm text-stone-500">There was an error communicating with the fact repository.</p>
          <Button variant="outline" size="sm" onClick={() => refetchFacts()}>
            Try Again
          </Button>
        </div>
      ) : facts.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-4">
          <Building2 className="w-12 h-12 text-stone-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-medium text-stone-900">No company facts found</h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              No knowledge entries matched your search criteria. Clear filters or add a new fact.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="bg-emerald-800 hover:bg-emerald-900 text-white"
          >
            Add Fact
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={facts}
          pagination={{ total: totalCount, page, limit: 50, pages: Math.ceil(totalCount / 50) || 1 }}
          onPageChange={(p) => handleFilterChange('page', p)}
        />
      )}

      {/* Slide-over Drawer for Fact Authoring */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingFact ? `Edit Fact: ${editingFact.factKey}` : 'Add Company Knowledge Fact'}
        subtitle="Verified facts are strictly used to ground AI responses and power technical semantic search."
        size="md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4">
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Category Domain <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-white"
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fact Key */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Fact Key (Unique Machine Identifier) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.factKey}
                onChange={(e) => handleFormChange('factKey', e.target.value)}
                placeholder="e.g. operations.discharge_ports"
                disabled={Boolean(editingFact)}
                className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 disabled:bg-stone-100 disabled:text-stone-500"
                required
              />
              <p className="text-[11px] text-stone-400 mt-1">Lowercase dot-notation recommended</p>
            </div>

            {/* Label */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Human Label / Specification Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => handleFormChange('label', e.target.value)}
                placeholder="e.g. Primary Ocean Export Gateways"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                required
              />
            </div>

            {/* Value */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Fact Value / Verifiable Statement <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.factValue}
                onChange={(e) => handleFormChange('factValue', e.target.value)}
                placeholder="e.g. Mundra Port (INMUN1) and Nhava Sheva (INNSA1) for FCL containerized shipments."
                className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 leading-relaxed"
                required
              />
            </div>

            {/* Source & Attribution */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Source Type
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleFormChange('source', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-white"
                >
                  <option value="client_document">Client Document</option>
                  <option value="official_register">Official Statutory Register</option>
                  <option value="founder_directive">Founder Directive</option>
                  <option value="lab_report">Lab Certificate / TDS</option>
                  <option value="admin_portal">Admin Portal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Source Document Name
                </label>
                <input
                  type="text"
                  value={formData.sourceDocument}
                  onChange={(e) => handleFormChange('sourceDocument', e.target.value)}
                  placeholder="e.g. APEDA-2024-REG"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-stone-900 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified by Client Documentation</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Verified facts can be stated with 100% confidence by the AI without escalation.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVerified}
                    onChange={(e) => handleFormChange('isVerified', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-stone-900 flex items-center space-x-1.5">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>Include in Public RAG Vector Store</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    When public, visitor chats and public search will retrieve and ground responses on this fact.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => handleFormChange('isPublic', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Internal Staff Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Internal notes or verification audit references..."
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-stone-200 pt-4 mt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-emerald-800 hover:bg-emerald-900 text-white flex items-center space-x-1.5"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              <span>{editingFact ? 'Update Fact' : 'Save & Index Fact'}</span>
            </Button>
          </div>
        </form>
      </AdminDrawer>

      {/* Delete Confirmation Modal */}
      {deleteModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-stone-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-700">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900">Archive Knowledge Fact?</h3>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              Are you sure you want to delete fact{' '}
              <strong className="text-stone-900">"{deleteModalState.fact?.label}"</strong> (
              <span className="font-mono text-xs">{deleteModalState.fact?.factKey}</span>)? This will
              remove it from the RAG vector store and disable grounding on this statement.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalState({ isOpen: false, fact: null })}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => deleteMutation.mutate(deleteModalState.fact?.id)}
                disabled={deleteMutation.isPending}
                className="bg-red-700 hover:bg-red-800 text-white flex items-center space-x-1.5"
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Confirm Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyKnowledgeBase;
