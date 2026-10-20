import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  RotateCw,
  Cpu,
  Lock,
  Globe,
  Loader2,
  FileText,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  Database,
  SlidersHorizontal,
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
  AdminPageHeader,
  AdminStatCard,
  DataTable,
  FilterBar,
  AdminStatusBadge,
  AdminDrawer,
  AdminSkeleton,
} from '../components';

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'identity', label: 'Company Identity & Founders' },
  { id: 'certifications', label: 'Certifications & Statutory' },
  { id: 'operations', label: 'Export Operations & Logistics' },
  { id: 'policy', label: 'Trade Policies & Terms' },
  { id: 'quality', label: 'Quality & Lab Standards' },
  { id: 'contact', label: 'Official Export Desks' },
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
  const [activeDrawerTab, setActiveDrawerTab] = useState('definition'); // 'definition' | 'provenance' | 'guardrails'
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
  const totalPublic = facts.filter((f) => f.isPublic).length;

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
    setActiveDrawerTab('definition');
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
    setActiveDrawerTab('definition');
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
        placeholder: 'Search facts, keys, statements...',
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
        placeholder: 'Verification Status',
        value: isVerified,
        options: [
          { label: 'All Verification Levels', value: '' },
          { label: 'Verified by Documentation', value: 'true' },
          { label: 'Unverified / TODO(client)', value: 'false' },
        ],
      },
      {
        key: 'isPublic',
        type: 'select',
        placeholder: 'RAG Visibility',
        value: isPublic,
        options: [
          { label: 'All Visibilities', value: '' },
          { label: 'Public RAG Grounding', value: 'true' },
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
      title: 'Domain / Category',
      width: '150px',
      render: (val) => {
        const item = CATEGORIES.find((c) => c.id === val);
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-[var(--admin-border)] uppercase tracking-wider">
            {item ? item.label.split(' ')[0] : (val || 'General')}
          </span>
        );
      },
    },
    {
      key: 'factKey',
      title: 'Fact Key & Label',
      width: '260px',
      render: (_, row) => (
        <div className="space-y-1">
          <div className="font-semibold text-neutral-900 text-sm leading-snug">
            {row.label}
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="inline-block px-1.5 py-0.5 text-[11px] font-mono text-neutral-600 bg-neutral-50 rounded border border-[var(--admin-border)]">
              {row.factKey}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'factValue',
      title: 'Verifiable Statement / Parameter',
      render: (val) => (
        <div className="max-w-md text-xs text-neutral-700 font-mono leading-relaxed line-clamp-3">
          {val}
        </div>
      ),
    },
    {
      key: 'source',
      title: 'Attribution',
      width: '180px',
      render: (_, row) => (
        <div className="space-y-0.5 text-xs text-neutral-600">
          <div className="font-medium text-neutral-800 capitalize">
            {row.source?.replace('_', ' ') || 'Document'}
          </div>
          {row.sourceDocument ? (
            <div className="text-[11px] text-neutral-500 font-mono truncate max-w-[160px]" title={row.sourceDocument}>
              {row.sourceDocument}
            </div>
          ) : (
            <span className="text-[11px] text-neutral-400 italic">No document ref</span>
          )}
        </div>
      ),
    },
    {
      key: 'isVerified',
      title: 'Verification',
      width: '130px',
      render: (val, row) => (
        <button
          onClick={() => toggleVerified(row)}
          className="focus:outline-none focus:ring-2 focus:ring-primary-700 rounded-full"
          title="Click to toggle verification status"
        >
          <AdminStatusBadge
            status={row.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
            variant={row.isVerified ? 'success' : 'warning'}
            dot
          />
        </button>
      ),
    },
    {
      key: 'isPublic',
      title: 'RAG Visibility',
      width: '120px',
      render: (val, row) => (
        <button
          onClick={() => togglePublic(row)}
          className="focus:outline-none focus:ring-2 focus:ring-primary-700 rounded-full"
          title="Click to toggle public search availability"
        >
          <AdminStatusBadge
            status={row.isPublic ? 'PUBLIC' : 'INTERNAL'}
            variant={row.isPublic ? 'info' : 'neutral'}
          />
        </button>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '90px',
      render: (_, row) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-neutral-500 hover:text-primary-800 hover:bg-neutral-100 rounded-md transition-colors"
            title="Edit Knowledge Fact"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteModalState({ isOpen: true, fact: row })}
            className="p-1.5 text-neutral-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            title="Archive Fact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <Helmet>
        <title>Company Knowledge Base | JHS GLOBAL Admin</title>
      </Helmet>

      {/* Symmetrical Page Header */}
      <AdminPageHeader
        breadcrumbs={[
          { label: 'JHS GLOBAL Desk', to: '/admin' },
          { label: 'Company Knowledge', to: '/admin/company-knowledge' },
        ]}
        title="Company & Team Intelligence Base"
        badge="RAG GROUNDED"
        description="Structured, versioned source of truth for verified corporate facts, export licenses, founder directives, and operational parameters grounding the AI assistant."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => reindexMutation.mutate()}
              disabled={reindexMutation.isPending}
              className="flex items-center space-x-1.5 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              title="Re-run RAG Vector Embedding across all catalogue items"
            >
              {reindexMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary-800" />
              ) : (
                <RotateCw className="w-4 h-4 text-neutral-600" />
              )}
              <span>{reindexMutation.isPending ? 'Indexing...' : 'Trigger RAG Re-Index'}</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="flex items-center space-x-1.5 bg-accent-600 hover:bg-accent-700 text-neutral-950 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add Knowledge Fact</span>
            </Button>
          </div>
        }
      />

      {/* Notification Toast/Banner */}
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
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Symmetrical 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Total Facts"
          value={totalCount}
          sublabel="Repository statements"
          icon={Database}
        />
        <AdminStatCard
          label="Verified Facts"
          value={totalVerified}
          sublabel="Backed by client documentation"
          icon={ShieldCheck}
          badge={{
            text: `${summaryData?.facts?.verificationRate || 100}% rate`,
            variant: 'success',
          }}
        />
        <AdminStatCard
          label="Pending Verification"
          value={totalUnverified}
          sublabel="Require client confirmation"
          icon={AlertTriangle}
          badge={
            totalUnverified > 0
              ? { text: `${totalUnverified} action req.`, variant: 'warning' }
              : { text: 'All verified', variant: 'success' }
          }
        />
        <AdminStatCard
          label="Public RAG Facts"
          value={totalPublic}
          sublabel="Grounding visitor interactions"
          icon={Globe}
          badge={{ text: 'Live in Index', variant: 'info' }}
        />
      </div>

      {/* RAG Vector Embedding Telemetry Strip */}
      <div className="elevation-flat border border-[var(--admin-border)] bg-white rounded-admin-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-neutral-100 text-primary-900 rounded-lg border border-[var(--admin-border)]">
            <Cpu className="w-5 h-5 text-primary-900" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-primary-900 font-semibold flex items-center space-x-2">
              <span>pgvector Embedding Store</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="text-sm text-neutral-700 font-medium mt-0.5">
              <span className="tabular-nums font-semibold text-neutral-900">
                {summaryData?.embeddings?.total || 0}
              </span>{' '}
              Active Vector Chunks in Grounding Knowledge Store
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-600">
          <div className="bg-neutral-50 px-2.5 py-1 rounded border border-[var(--admin-border)]">
            Products:{' '}
            <span className="text-primary-900 font-bold tabular-nums">
              {summaryData?.embeddings?.bySource?.products || 0}
            </span>
          </div>
          <div className="bg-neutral-50 px-2.5 py-1 rounded border border-[var(--admin-border)]">
            FAQs:{' '}
            <span className="text-primary-900 font-bold tabular-nums">
              {summaryData?.embeddings?.bySource?.faqs || 0}
            </span>
          </div>
          <div className="bg-neutral-50 px-2.5 py-1 rounded border border-[var(--admin-border)]">
            Company Facts:{' '}
            <span className="text-primary-900 font-bold tabular-nums">
              {summaryData?.embeddings?.bySource?.companyFacts || 0}
            </span>
          </div>
          <div className="bg-neutral-50 px-2.5 py-1 rounded border border-[var(--admin-border)]">
            Status:{' '}
            <span className="text-emerald-700 font-bold">Synchronized</span>
          </div>
        </div>
      </div>

      {/* Unified Filter Bar */}
      <FilterBar
        filters={filterConfig}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* Main Data Table */}
      {loadingFacts ? (
        <AdminSkeleton type="table" rows={6} />
      ) : errorFacts ? (
        <div className="elevation-flat bg-white rounded-admin-lg border border-red-200 p-8 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="text-base font-semibold text-neutral-900">Failed to load company knowledge</h3>
          <p className="text-sm text-neutral-500">There was an error communicating with the fact repository.</p>
          <Button variant="outline" size="sm" onClick={() => refetchFacts()}>
            Try Again
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

      {/* Slide-over Drawer for Fact Authoring & Editing */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingFact ? `Edit Fact: ${editingFact.factKey}` : 'Add Knowledge Fact'}
        subtitle="Verified facts are strictly used to ground AI responses and power technical semantic search."
        size="md"
      >
        <div className="flex flex-col h-full">
          {/* Drawer Tabs */}
          <div className="flex border-b border-[var(--admin-border)] mb-5 -mt-2">
            <button
              type="button"
              onClick={() => setActiveDrawerTab('definition')}
              className={`pb-2.5 px-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                activeDrawerTab === 'definition'
                  ? 'border-primary-900 text-primary-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Fact Definition
            </button>
            <button
              type="button"
              onClick={() => setActiveDrawerTab('provenance')}
              className={`pb-2.5 px-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                activeDrawerTab === 'provenance'
                  ? 'border-primary-900 text-primary-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Provenance & Attribution
            </button>
            <button
              type="button"
              onClick={() => setActiveDrawerTab('guardrails')}
              className={`pb-2.5 px-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                activeDrawerTab === 'guardrails'
                  ? 'border-primary-900 text-primary-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              RAG Guardrails
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-y-auto">
            {activeDrawerTab === 'definition' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Category Domain <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 bg-white"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Fact Key (Unique Machine Identifier) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.factKey}
                    onChange={(e) => handleFormChange('factKey', e.target.value)}
                    placeholder="e.g. operations.discharge_ports"
                    disabled={Boolean(editingFact)}
                    className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 disabled:bg-neutral-100 disabled:text-neutral-500"
                    required
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">Lowercase dot-notation recommended for machine retrieval</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Human Label / Specification Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => handleFormChange('label', e.target.value)}
                    placeholder="e.g. Primary Ocean Export Gateways"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Fact Value / Verifiable Statement <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.factValue}
                    onChange={(e) => handleFormChange('factValue', e.target.value)}
                    placeholder="e.g. Mundra Port (INMUN1) and Nhava Sheva (INNSA1) for FCL containerized shipments."
                    className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 leading-relaxed"
                    required
                  />
                </div>
              </div>
            )}

            {activeDrawerTab === 'provenance' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Source Attribution Type
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => handleFormChange('source', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 bg-white"
                  >
                    <option value="client_document">Client Document</option>
                    <option value="official_register">Official Statutory Register</option>
                    <option value="founder_directive">Founder Directive</option>
                    <option value="lab_report">Lab Certificate / TDS</option>
                    <option value="admin_portal">Admin Portal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Source Document Reference
                  </label>
                  <input
                    type="text"
                    value={formData.sourceDocument}
                    onChange={(e) => handleFormChange('sourceDocument', e.target.value)}
                    placeholder="e.g. APEDA-2024-REG / Founder Directive Nov 2024"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Internal Staff Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Internal audit notes or compliance verification references..."
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900"
                  />
                </div>
              </div>
            )}

            {activeDrawerTab === 'guardrails' && (
              <div className="space-y-4">
                <div className="flex items-start justify-between p-3.5 bg-neutral-50 rounded-lg border border-[var(--admin-border)]">
                  <div className="space-y-1 pr-4">
                    <div className="text-sm font-semibold text-neutral-900 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified by Client Documentation</span>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Verified statements are cited with 100% confidence by the export AI assistant without human escalation.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={(e) => handleFormChange('isVerified', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-900"></div>
                  </label>
                </div>

                <div className="flex items-start justify-between p-3.5 bg-neutral-50 rounded-lg border border-[var(--admin-border)]">
                  <div className="space-y-1 pr-4">
                    <div className="text-sm font-semibold text-neutral-900 flex items-center space-x-1.5">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Include in Public RAG Vector Store</span>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      When enabled, buyer inquiries and semantic catalog search will retrieve and ground responses using this parameter.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => handleFormChange('isPublic', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-900"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Drawer Action Bar */}
            <div className="border-t border-[var(--admin-border)] pt-4 mt-8 flex items-center justify-between">
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
                className="bg-accent-600 hover:bg-accent-700 text-neutral-950 font-medium flex items-center space-x-1.5"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                )}
                <span>{editingFact ? 'Update Fact' : 'Save & Index Fact'}</span>
              </Button>
            </div>
          </form>
        </div>
      </AdminDrawer>

      {/* Delete Confirmation Modal */}
      {deleteModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs">
          <div className="elevation-overlay bg-white rounded-admin-lg border border-[var(--admin-border)] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center space-x-3 text-amber-700">
              <div className="p-2.5 bg-amber-50 rounded-full border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">Archive Knowledge Fact?</h3>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Are you sure you want to delete fact{' '}
              <strong className="text-neutral-900">"{deleteModalState.fact?.label}"</strong> (
              <span className="font-mono text-xs">{deleteModalState.fact?.factKey}</span>)? This will
              remove it from the RAG vector store and disable grounding on this statement.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100">
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
                <span>Confirm Archive</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyKnowledgeBase;
