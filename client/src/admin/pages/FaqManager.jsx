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
  Edit,
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
        <p className="text-sm text-stone-400 italic">No answer content provided yet...</p>
      );
    }

    const paragraphs = text.split('\n\n');
    return (
      <div className="space-y-3 text-sm text-stone-700 leading-relaxed">
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
        <div className="flex items-center space-x-1.5 font-mono text-xs text-stone-500">
          <span className="font-semibold text-stone-800">#{row.order || 0}</span>
          <div className="flex flex-col">
            <button
              onClick={() => handleMoveOrder(row, 'up')}
              title="Move Up"
              className="hover:text-emerald-700 text-stone-400 p-0.5"
            >
              <MoveUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleMoveOrder(row, 'down')}
              title="Move Down"
              className="hover:text-emerald-700 text-stone-400 p-0.5"
            >
              <MoveDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'question',
      title: 'Question & Category',
      render: (_, row) => (
        <div className="space-y-1.5 max-w-xl">
          <div className="font-medium text-stone-900 line-clamp-2 leading-snug">
            {row.question}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Tag className="w-3 h-3 mr-1" />
              {row.group || 'General'}
            </span>
            <span className="text-stone-400 font-mono text-[11px]">
              /{row.slug}
            </span>
            <a
              href={`/faq#${row.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-emerald-700 hover:text-emerald-800 hover:underline text-[11px]"
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
      title: 'Homepage',
      width: '130px',
      render: (val, row) => (
        <button
          onClick={() => toggleHomeMutation.mutate(row.id)}
          disabled={toggleHomeMutation.isPending}
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            row.showOnHome
              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
          }`}
          title="Toggle Homepage FAQ Accordion"
        >
          <Home className="w-3 h-3 mr-1.5" />
          {row.showOnHome ? `Home #${row.homeOrder || 0}` : 'Standard'}
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
          className="focus:outline-none"
          title="Click to toggle active status"
        >
          <AdminStatusBadge status={row.isActive ? 'active' : 'archived'} />
        </button>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '110px',
      render: (_, row) => (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded transition-colors"
            title="Edit Question"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteModalState({ isOpen: true, faq: row })}
            className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title="Archive FAQ"
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
        <title>FAQ Manager Desk | JHS GLOBAL Admin</title>
      </Helmet>

      {/* Desk Notification Banner */}
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
            className="text-stone-400 hover:text-stone-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Title and Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
              Export FAQ Manager Desk
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-100 text-emerald-800">
              RAG SYNCED
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Commercial FAQ governance, category grouping, homepage featured accordion control, and RAG knowledge synchronization.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center space-x-1.5"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-900 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>New Question</span>
          </Button>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Questions</span>
            <HelpCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{metrics.total}</div>
          <div className="text-xs text-stone-500 mt-1">Export repository entries</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Homepage Featured</span>
            <Home className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{metrics.homepageFeatured}</div>
          <div className="text-xs text-amber-700 mt-1">Rendered on public index</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Active Categories</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{metrics.groupCount}</div>
          <div className="text-xs text-stone-500 mt-1">Commercial trade domains</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Draft / Inactive</span>
            <AlertCircle className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{metrics.inactive}</div>
          <div className="text-xs text-stone-500 mt-1">Hidden from public view</div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filterConfig}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* Data Table */}
      {isLoading ? (
        <AdminSkeleton type="table" rows={6} />
      ) : isError ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="text-base font-semibold text-stone-900">Failed to load FAQs</h3>
          <p className="text-sm text-stone-500">There was an error communicating with the export database.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-4">
          <HelpCircle className="w-12 h-12 text-stone-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-medium text-stone-900">No FAQ questions found</h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              No questions matched your current search filters. Clear filters or create a new FAQ entry.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="bg-emerald-800 hover:bg-emerald-900 text-white"
          >
            Create Question
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
          <div className="flex border-b border-stone-200 mb-6 -mt-2">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`py-2.5 px-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'content'
                  ? 'border-emerald-700 text-emerald-800 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Question & Grouping</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('markdown')}
              className={`py-2.5 px-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'markdown'
                  ? 'border-emerald-700 text-emerald-800 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Markdown Answer & Preview</span>
            </button>
          </div>

          {/* Tab 1: Question & Grouping */}
          {activeTab === 'content' && (
            <div className="space-y-5 flex-1 overflow-y-auto pr-1">
              {/* Question */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.question}
                  onChange={(e) => handleFormChange('question', e.target.value)}
                  placeholder="e.g., What is your standard Minimum Order Quantity (MOQ) for botanical extracts?"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
                  required
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-stone-400">
                  <span>Buyer question as queried on trade portals or WhatsApp desk</span>
                  <span>{formData.question.length}/500</span>
                </div>
              </div>

              {/* Group / Category */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Category Group <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <select
                    value={formData.group}
                    onChange={(e) => handleFormChange('group', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-white"
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
                      className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                    />
                  )}
                </div>
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  URL Anchor Slug
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleFormChange('slug', slugify(e.target.value))}
                    placeholder="standard-minimum-order-quantity-moq"
                    className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                  {formData.slug && (
                    <span className="absolute right-3 top-2.5 text-xs text-stone-400 font-mono">
                      /faq#{formData.slug}
                    </span>
                  )}
                </div>
              </div>

              {/* Sequencing Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Category Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.order}
                    onChange={(e) => handleFormChange('order', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">Lower numbers appear first</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Homepage Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.homeOrder}
                    onChange={(e) => handleFormChange('homeOrder', e.target.value)}
                    disabled={!formData.showOnHome}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 disabled:bg-stone-100 disabled:text-stone-400"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">Position on homepage (1-5)</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-stone-900 flex items-center space-x-1.5">
                      <Home className="w-4 h-4 text-amber-600" />
                      <span>Feature on Homepage FAQ Accordion</span>
                    </div>
                    <p className="text-xs text-stone-500">
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
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-stone-900 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Active on Public Website</span>
                    </div>
                    <p className="text-xs text-stone-500">
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
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
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
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Answer Content (Markdown Supported) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-stone-400">{formData.answer.length} characters</span>
                </div>
                <textarea
                  rows={8}
                  value={formData.answer}
                  onChange={(e) => handleFormChange('answer', e.target.value)}
                  placeholder="Enter detailed B2B commercial answer. Use paragraphs and bullet points..."
                  className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 leading-relaxed"
                  required
                />
              </div>

              {/* Live Rendered Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Public Site Preview</span>
                  </span>
                  {formData.slug && (
                    <a
                      href={`/faq#${formData.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 hover:text-emerald-800 inline-flex items-center space-x-1"
                    >
                      <span>Public Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="font-semibold text-stone-900 mb-2">
                    {formData.question || 'Question title will appear here'}
                  </div>
                  {renderMarkdownPreview(formData.answer)}
                </div>
              </div>
            </div>
          )}

          {/* Drawer Actions Footer */}
          <div className="border-t border-stone-200 pt-4 mt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(false)}
            >
              Cancel
            </Button>
            <div className="flex items-center space-x-2">
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
                <span>{editingFaq ? 'Update Question' : 'Publish Question'}</span>
              </Button>
            </div>
          </div>
        </form>
      </AdminDrawer>

      {/* Archive / Deletion Confirmation Modal */}
      {deleteModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-stone-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-700">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900">Archive Export FAQ?</h3>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              Are you sure you want to archive{' '}
              <strong className="text-stone-900">
                "{deleteModalState.faq?.question?.slice(0, 60)}..."
              </strong>
              ? This will soft-delete the question and remove it from public FAQ queries and RAG retrieval.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
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
