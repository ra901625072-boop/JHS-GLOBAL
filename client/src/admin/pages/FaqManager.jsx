import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HelpCircle,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Tag,
  Home,
  Check,
  Eye,
  Loader2,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Layers,
  Sparkles,
  FileText,
  RotateCw,
} from 'lucide-react';
import {
  fetchAdminFaqs,
  createAdminFaq,
  updateAdminFaq,
  deleteAdminFaq,
  toggleAdminFaqHome,
  toggleAdminFaqActive,
  reorderAdminFaqs,
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

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const FAQ_GROUP_PRESETS = [
  'Ordering & Minimum Quantities (MOQ)',
  'Product Quality & Technical Specifications',
  'Sample Dispatch & Laboratory Testing',
  'Shipping, Logistics & Incoterms',
  'Payment Terms & Commercial Settlement',
  'Export Documentation & Statutory Compliance',
  'Packaging, Labelling & Private Label',
];

const INITIAL_FORM_STATE = {
  question: '',
  answer: '',
  group: 'Ordering & Minimum Quantities (MOQ)',
  customGroup: '',
  order: 0,
  slug: '',
  showOnHome: false,
  homeOrder: 0,
  isActive: true,
};

export const FaqManager = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query State
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const group = searchParams.get('group') || '';
  const showOnHome = searchParams.get('showOnHome') || '';
  const isActive = searchParams.get('isActive') || '';

  // UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'markdown'
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, faq: null });
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // TanStack Query: Fetch FAQs
  const {
    data: queryResult,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-faqs', { page, search, group, showOnHome, isActive }],
    queryFn: () =>
      fetchAdminFaqs({
        page,
        limit: 50,
        search,
        group,
        showOnHome,
        isActive,
      }),
  });

  const faqs = queryResult?.faqs || [];
  const groups = queryResult?.groups || [];
  const metrics = queryResult?.metrics || {
    total: 0,
    active: 0,
    inactive: 0,
    homepageFeatured: 0,
    groupCount: 0,
  };
  const pagination = queryResult?.meta || { total: 0, page: 1, limit: 50, pages: 1 };

  // Mutations
  const createMutation = useMutation({
    mutationFn: createAdminFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setIsDrawerOpen(false);
      resetForm();
      showNotification('success', 'FAQ question successfully created and published');
    },
    onError: (err) => {
      showNotification('error', err.response?.data?.message || 'Failed to create FAQ');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminFaq(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setIsDrawerOpen(false);
      resetForm();
      showNotification('success', 'FAQ updated and RAG index refreshed');
    },
    onError: (err) => {
      showNotification('error', err.response?.data?.message || 'Failed to update FAQ');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setDeleteModalState({ isOpen: false, faq: null });
      showNotification('success', 'FAQ archived from public view');
    },
    onError: (err) => {
      showNotification('error', err.response?.data?.message || 'Failed to archive FAQ');
    },
  });

  const toggleHomeMutation = useMutation({
    mutationFn: toggleAdminFaqHome,
    onSuccess: (updatedFaq) => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      showNotification(
        'success',
        updatedFaq.showOnHome
          ? `Added to Homepage FAQ Section (Order #${updatedFaq.homeOrder})`
          : 'Removed from Homepage FAQ Section'
      );
    },
    onError: (err) => {
      showNotification('error', err.response?.data?.message || 'Failed to toggle homepage visibility');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: toggleAdminFaqActive,
    onSuccess: (updatedFaq) => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      showNotification(
        'success',
        updatedFaq.isActive ? 'FAQ activated on public site' : 'FAQ deactivated/hidden'
      );
    },
    onError: (err) => {
      showNotification('error', err.response?.data?.message || 'Failed to toggle active status');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: reorderAdminFaqs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      showNotification('success', 'FAQ sequence reordered successfully');
    },
    onError: (err) => {
      showNotification('error', err.response?.data?.message || 'Failed to reorder FAQs');
    },
  });

  // Drawer handlers
  const handleOpenCreate = () => {
    resetForm();
    setEditingFaq(null);
    setActiveTab('content');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      group: FAQ_GROUP_PRESETS.includes(faq.group) ? faq.group : 'Other',
      customGroup: FAQ_GROUP_PRESETS.includes(faq.group) ? '' : faq.group || '',
      order: faq.order || 0,
      slug: faq.slug || '',
      showOnHome: Boolean(faq.showOnHome),
      homeOrder: faq.homeOrder || 0,
      isActive: faq.isActive !== false,
    });
    setActiveTab('content');
    setIsDrawerOpen(true);
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setEditingFaq(null);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'question' && !editingFaq) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      showNotification('error', 'Question and Answer are both required.');
      return;
    }

    const resolvedGroup =
      formData.group === 'Other' && formData.customGroup.trim()
        ? formData.customGroup.trim()
        : formData.group;

    const payload = {
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      group: resolvedGroup,
      order: parseInt(formData.order, 10) || 0,
      slug: formData.slug.trim() || slugify(formData.question),
      showOnHome: Boolean(formData.showOnHome),
      homeOrder: parseInt(formData.homeOrder, 10) || 0,
      isActive: Boolean(formData.isActive),
    };

    if (editingFaq) {
      updateMutation.mutate({ id: editingFaq.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleMoveOrder = (faq, direction) => {
    const currentIndex = faqs.findIndex((f) => f.id === faq.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const targetFaq = faqs[targetIndex];

    const updatedItems = [
      { id: faq.id, order: targetFaq.order || targetIndex + 1 },
      { id: targetFaq.id, order: faq.order || currentIndex + 1 },
    ];

    reorderMutation.mutate(updatedItems);
  };

  // Render Markdown Answer preview
  const renderMarkdownPreview = (text) => {
    if (!text) {
      return (
        <p className="text-xs text-neutral-400 italic">No answer content provided yet...</p>
      );
    }

    const paragraphs = text.split('\n\n');
    return (
      <div className="space-y-3 text-xs text-neutral-700 leading-relaxed">
        {paragraphs.map((para, i) => {
          if (para.startsWith('- ') || para.startsWith('* ')) {
            const listItems = para.split('\n').filter(Boolean);
            return (
              <ul key={i} className="list-disc pl-5 space-y-1">
                {listItems.map((item, j) => (
                  <li key={j}>{item.replace(/^[-*]\s*/, '')}</li>
                ))}
              </ul>
            );
          }
          return <p key={i}>{para}</p>;
        })}
      </div>
    );
  };

  // FilterBar configuration
  const filterConfig = useMemo(
    () => [
      {
        key: 'search',
        type: 'text',
        placeholder: 'Search questions, answers, keywords...',
        value: search,
      },
      {
        key: 'group',
        type: 'select',
        placeholder: 'All Categories',
        value: group,
        options: [
          { label: 'All Categories', value: '' },
          ...Array.from(new Set([...FAQ_GROUP_PRESETS, ...groups])).map((g) => ({
            label: g,
            value: g,
          })),
        ],
      },
      {
        key: 'showOnHome',
        type: 'select',
        placeholder: 'Homepage Visibility',
        value: showOnHome,
        options: [
          { label: 'All FAQs', value: '' },
          { label: 'Featured on Homepage', value: 'true' },
          { label: 'Full FAQ Page Only', value: 'false' },
        ],
      },
      {
        key: 'isActive',
        type: 'select',
        placeholder: 'Status',
        value: isActive,
        options: [
          { label: 'All Statuses', value: '' },
          { label: 'Active', value: 'true' },
          { label: 'Inactive / Draft', value: 'false' },
        ],
      },
    ],
    [search, group, showOnHome, isActive, groups]
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
      key: 'order',
      title: 'Seq',
      width: '80px',
      render: (val, row) => (
        <div className="flex items-center space-x-1 font-mono text-xs text-neutral-500">
          <span className="font-semibold text-neutral-800 tabular-nums">#{row.order || 0}</span>
          <div className="flex flex-col">
            <button
              onClick={() => handleMoveOrder(row, 'up')}
              title="Move Up"
              className="hover:text-primary-800 text-neutral-400 p-0.5 rounded transition-colors"
            >
              <MoveUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleMoveOrder(row, 'down')}
              title="Move Down"
              className="hover:text-primary-800 text-neutral-400 p-0.5 rounded transition-colors"
            >
              <MoveDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'question',
      title: 'Question & Commercial Category',
      render: (_, row) => (
        <div className="space-y-1 max-w-xl">
          <div className="font-semibold text-neutral-900 text-sm line-clamp-2 leading-snug">
            {row.question}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
              <Tag className="w-3 h-3 mr-1 text-neutral-500" />
              {row.group || 'General'}
            </span>
            <span className="text-neutral-400 font-mono text-[11px]">
              /{row.slug}
            </span>
            <a
              href={`/faq#${row.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary-900 hover:text-accent-700 hover:underline text-[11px]"
              title="View on public site"
            >
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>
      ),
    },
    {
      key: 'showOnHome',
      title: 'Homepage Accordion',
      width: '140px',
      render: (val, row) => (
        <button
          onClick={() => toggleHomeMutation.mutate(row.id)}
          disabled={toggleHomeMutation.isPending}
          className="focus:outline-none focus:ring-2 focus:ring-primary-700 rounded-full"
          title="Toggle Homepage FAQ Accordion"
        >
          {row.showOnHome ? (
            <AdminStatusBadge
              status={`Home #${row.homeOrder || 0}`}
              variant="accent"
              dot
            />
          ) : (
            <AdminStatusBadge status="Standard" variant="neutral" />
          )}
        </button>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      width: '110px',
      render: (val, row) => (
        <button
          onClick={() => toggleActiveMutation.mutate(row.id)}
          disabled={toggleActiveMutation.isPending}
          className="focus:outline-none focus:ring-2 focus:ring-primary-700 rounded-full"
          title="Click to toggle active status"
        >
          <AdminStatusBadge
            status={row.isActive ? 'ACTIVE' : 'ARCHIVED'}
            variant={row.isActive ? 'success' : 'neutral'}
            dot
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
            title="Edit Question"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteModalState({ isOpen: true, faq: row })}
            className="p-1.5 text-neutral-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            title="Archive FAQ"
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
        <title>FAQ Manager Desk | JHS GLOBAL Admin</title>
      </Helmet>

      {/* Symmetrical Page Header */}
      <AdminPageHeader
        breadcrumb={[
          { label: 'JHS GLOBAL Desk', to: '/admin' },
          { label: 'FAQ Manager', to: '/admin/faqs' },
        ]}
        title="Export FAQ & Knowledge Desk"
        badge="RAG SYNCED"
        description="Commercial FAQ governance, category grouping, homepage featured accordion control, and RAG knowledge synchronization."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="flex items-center space-x-1.5 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              <RotateCw className="w-4 h-4 text-neutral-600" />
              <span>Refresh Desk</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="flex items-center space-x-1.5 bg-accent-600 hover:bg-accent-700 text-neutral-950 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Question</span>
            </Button>
          </div>
        }
      />

      {/* Desk Notification Toast */}
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
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
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
          label="Total Questions"
          value={metrics.total}
          sublabel="Export repository entries"
          icon={HelpCircle}
        />
        <AdminStatCard
          label="Homepage Featured"
          value={metrics.homepageFeatured}
          sublabel="Rendered on public index"
          icon={Home}
          badge={{ text: 'Front Page', variant: 'accent' }}
        />
        <AdminStatCard
          label="Active Categories"
          value={metrics.groupCount}
          sublabel="Commercial trade domains"
          icon={Layers}
        />
        <AdminStatCard
          label="Draft / Inactive"
          value={metrics.inactive}
          sublabel="Hidden from public view"
          icon={AlertCircle}
          badge={
            metrics.inactive > 0
              ? { text: `${metrics.inactive} draft`, variant: 'neutral' }
              : { text: 'All live', variant: 'success' }
          }
        />
      </div>

      {/* Unified Filter Bar */}
      <FilterBar
        filters={filterConfig}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* Data Table */}
      {isLoading ? (
        <AdminSkeleton type="table" rows={6} />
      ) : isError ? (
        <div className="elevation-flat bg-white rounded-admin-lg border border-red-200 p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="text-base font-semibold text-neutral-900">Failed to load FAQs</h3>
          <p className="text-sm text-neutral-500">There was an error communicating with the export database.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={faqs}
          pagination={pagination}
          onPageChange={(p) => handleFilterChange('page', p)}
        />
      )}

      {/* Slide-over AdminDrawer for Create/Edit */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingFaq ? `Edit Question #${editingFaq.id}` : 'Create New FAQ Entry'}
        subtitle={
          editingFaq
            ? 'Update question text, commercial category grouping, and homepage visibility'
            : 'Add a new verified question and markdown answer to the JHS GLOBAL knowledge repository'
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Drawer Tabs */}
          <div className="flex border-b border-neutral-200 mb-6 -mt-2">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`py-2.5 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'content'
                  ? 'border-primary-900 text-primary-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Question & Grouping</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('markdown')}
              className={`py-2.5 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'markdown'
                  ? 'border-primary-900 text-primary-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Markdown Answer & Preview</span>
            </button>
          </div>

          {/* Tab 1: Question & Grouping */}
          {activeTab === 'content' && (
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {/* Question */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.question}
                  onChange={(e) => handleFormChange('question', e.target.value)}
                  placeholder="e.g., What is your standard Minimum Order Quantity (MOQ) for botanical extracts?"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 transition-colors"
                  required
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-neutral-400">
                  <span>Buyer question as queried on trade portals or WhatsApp desk</span>
                  <span className="tabular-nums">{formData.question.length}/500</span>
                </div>
              </div>

              {/* Group / Category */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Category Group <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <select
                    value={formData.group}
                    onChange={(e) => handleFormChange('group', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 bg-white"
                  >
                    {FAQ_GROUP_PRESETS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="Other">Other / Custom Group Name...</option>
                  </select>

                  {formData.group === 'Other' && (
                    <input
                      type="text"
                      value={formData.customGroup}
                      onChange={(e) => handleFormChange('customGroup', e.target.value)}
                      placeholder="Enter custom category name..."
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900"
                    />
                  )}
                </div>
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  URL Anchor Slug
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleFormChange('slug', slugify(e.target.value))}
                    placeholder="standard-minimum-order-quantity-moq"
                    className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900"
                  />
                  {formData.slug && (
                    <span className="absolute right-3 top-2.5 text-xs text-neutral-400 font-mono">
                      /faq#{formData.slug}
                    </span>
                  )}
                </div>
              </div>

              {/* Sequencing Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Category Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.order}
                    onChange={(e) => handleFormChange('order', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 tabular-nums"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">Lower numbers appear first</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Homepage Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.homeOrder}
                    onChange={(e) => handleFormChange('homeOrder', e.target.value)}
                    disabled={!formData.showOnHome}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 disabled:bg-neutral-100 disabled:text-neutral-400 tabular-nums"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">Position on homepage (1-5)</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-neutral-900 flex items-center space-x-1.5">
                      <Home className="w-4 h-4 text-accent-700" />
                      <span>Feature on Homepage FAQ Accordion</span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      When enabled, this question will appear in the curated 5-item FAQ section on the public homepage.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showOnHome}
                      onChange={(e) => handleFormChange('showOnHome', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-neutral-900 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Active on Public Website</span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Unchecking this hides the question from visitor queries and disables deep-link resolution.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleFormChange('isActive', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-900"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Markdown Answer & Preview */}
          {activeTab === 'markdown' && (
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Answer Content (Markdown Supported) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-neutral-400 tabular-nums">{formData.answer.length} characters</span>
                </div>
                <textarea
                  rows={8}
                  value={formData.answer}
                  onChange={(e) => handleFormChange('answer', e.target.value)}
                  placeholder="Enter detailed B2B commercial answer. Use paragraphs and bullet points..."
                  className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 leading-relaxed"
                  required
                />
              </div>

              {/* Live Rendered Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-primary-900" />
                    <span>Live Public Site Preview</span>
                  </span>
                  {formData.slug && (
                    <a
                      href={`/faq#${formData.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-900 hover:text-accent-700 inline-flex items-center space-x-1"
                    >
                      <span>Public Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="font-semibold text-neutral-900 mb-2">
                    {formData.question || 'Question title will appear here'}
                  </div>
                  {renderMarkdownPreview(formData.answer)}
                </div>
              </div>
            </div>
          )}

          {/* Drawer Actions Footer */}
          <div className="border-t border-neutral-200 pt-4 mt-6 flex items-center justify-between">
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
              <span>{editingFaq ? 'Update Question' : 'Publish Question'}</span>
            </Button>
          </div>
        </form>
      </AdminDrawer>

      {/* Archive / Deletion Confirmation Modal */}
      {deleteModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs">
          <div className="elevation-overlay bg-white rounded-admin-lg border border-neutral-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center space-x-3 text-amber-700">
              <div className="p-2.5 bg-amber-50 rounded-full border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">Archive Export FAQ?</h3>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Are you sure you want to archive{' '}
              <strong className="text-neutral-900">
                "{deleteModalState.faq?.question?.slice(0, 60)}..."
              </strong>
              ? This will soft-delete the question and remove it from public FAQ queries and RAG retrieval.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalState({ isOpen: false, faq: null })}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => deleteMutation.mutate(deleteModalState.faq?.id)}
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

export default FaqManager;
