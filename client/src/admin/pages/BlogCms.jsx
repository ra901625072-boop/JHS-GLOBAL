import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  FileText,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  X,
  ExternalLink,
  Tag,
  Clock,
  Calendar,
  User,
  Image as ImageIcon,
  Globe,
  Sparkles,
  Eye,
  Loader2,
  Check,
  ChevronRight,
  Layers,
  Send,
  Archive,
} from 'lucide-react';
import {
  fetchAdminBlogPosts,
  fetchAdminBlogPostById,
  createAdminBlogPost,
  updateAdminBlogPost,
  deleteAdminBlogPost,
  updateAdminBlogPostStatus,
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

const BLOG_CATEGORIES = [
  'Nutraceutical Raw Materials',
  'Personal Care Raw Materials',
  'Animal Feed',
  'Export Quality & Compliance',
  'Trade Regulations & Logistics',
];

export const BlogCms = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('core'); // 'core' | 'taxonomy' | 'media' | 'seo'
  const [editingPost, setEditingPost] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Deletion Modal State
  const [deleteModalPost, setDeleteModalPost] = useState(null);

  // Feedback Notifications
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Default Form State
  const defaultFormData = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: {
      url: '/images/placeholders/blog-default.jpg',
      alt: 'Commodity export intelligence',
    },
    author: {
      name: 'Export Quality Desk',
      designation: 'International Trade & QA Specialist',
      avatar: '/images/placeholders/avatar-default.jpg',
    },
    category: 'Nutraceutical Raw Materials',
    tagsInput: 'HPLC, Quality Standards, Procurement',
    status: 'published',
    publishedAt: new Date().toISOString().split('T')[0],
    seo: {
      title: '',
      description: '',
      keywordsInput: '',
    },
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Query: Blog Posts List
  const {
    data: blogResult = { posts: [], meta: { total: 0, page: 1, limit: 15, pages: 1 } },
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ['admin-blog-posts', { page, limit: pageSize, status: statusFilter, category: categoryFilter, q: searchQuery }],
    queryFn: () =>
      fetchAdminBlogPosts({
        page,
        limit: pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        q: searchQuery || undefined,
      }),
  });

  const posts = blogResult.posts || [];
  const meta = blogResult.meta || { total: 0, page: 1, limit: 15, pages: 1 };

  // Query: All posts for metric strip
  const { data: allBlogResult = { posts: [] } } = useQuery({
    queryKey: ['admin-blog-posts-all'],
    queryFn: () => fetchAdminBlogPosts({ limit: 100 }),
  });
  const allPosts = allBlogResult.posts || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createAdminBlogPost(data),
    onSuccess: (newPost) => {
      queryClient.invalidateQueries(['admin-blog-posts']);
      queryClient.invalidateQueries(['admin-blog-posts-all']);
      queryClient.invalidateQueries(['blog-posts']);
      setIsDrawerOpen(false);
      setIsCreatingNew(false);
      setEditingPost(null);
      setFeedback(`Article "${newPost.title}" created successfully`);
      setTimeout(() => setFeedback(''), 4500);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create article');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminBlogPost(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries(['admin-blog-posts']);
      queryClient.invalidateQueries(['admin-blog-posts-all']);
      queryClient.invalidateQueries(['blog-posts']);
      setIsDrawerOpen(false);
      setEditingPost(null);
      setFeedback(`Article "${updated.title}" updated successfully`);
      setTimeout(() => setFeedback(''), 4500);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update article');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAdminBlogPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-blog-posts']);
      queryClient.invalidateQueries(['admin-blog-posts-all']);
      queryClient.invalidateQueries(['blog-posts']);
      setDeleteModalPost(null);
      if (isDrawerOpen) setIsDrawerOpen(false);
      setFeedback('Article archived successfully');
      setTimeout(() => setFeedback(''), 4500);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to archive article');
      setDeleteModalPost(null);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateAdminBlogPostStatus(id, { status }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries(['admin-blog-posts']);
      queryClient.invalidateQueries(['admin-blog-posts-all']);
      queryClient.invalidateQueries(['blog-posts']);
      setFeedback(`Article status changed to ${updated.status}`);
      setTimeout(() => setFeedback(''), 3000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update status');
    },
  });

  // Calculate Operational Metrics
  const metrics = useMemo(() => {
    const total = allPosts.length;
    const publishedCount = allPosts.filter((p) => p.status === 'published').length;
    const draftCount = allPosts.filter((p) => p.status === 'draft').length;
    const scheduledCount = allPosts.filter((p) => p.status === 'scheduled').length;
    return {
      total,
      publishedCount,
      draftCount,
      scheduledCount,
    };
  }, [allPosts]);

  // Open Create Drawer
  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setEditingPost(null);
    setErrorMsg('');
    setDrawerTab('core');
    setFormData(defaultFormData);
    setIsDrawerOpen(true);
  };

  // Open Edit Drawer
  const handleOpenEdit = (post) => {
    setIsCreatingNew(false);
    setEditingPost(post);
    setErrorMsg('');
    setDrawerTab('core');

    const fmtDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      coverImage: {
        url: post.coverImage?.url || '/images/placeholders/blog-default.jpg',
        alt: post.coverImage?.alt || 'Commodity export intelligence',
      },
      author: {
        name: post.author?.name || 'Export Quality Desk',
        designation: post.author?.designation || 'International Trade & QA Specialist',
        avatar: post.author?.avatar || '/images/placeholders/avatar-default.jpg',
      },
      category: post.category || 'Nutraceutical Raw Materials',
      tagsInput: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      status: post.status || 'published',
      publishedAt: fmtDate(post.publishedAt) || fmtDate(new Date()),
      seo: {
        title: post.seo?.title || '',
        description: post.seo?.description || '',
        keywordsInput: Array.isArray(post.seo?.keywords) ? post.seo.keywords.join(', ') : '',
      },
    });
    setIsDrawerOpen(true);
  };

  // Handle Form Title Change (auto slug)
  const handleTitleChange = (val) => {
    setFormData((prev) => {
      const next = { ...prev, title: val };
      if (isCreatingNew && (!prev.slug || prev.slug === slugify(prev.title))) {
        next.slug = slugify(val);
      }
      return next;
    });
  };

  // Form Submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Article title is required.');
      setDrawerTab('core');
      return;
    }
    if (!formData.content.trim()) {
      setErrorMsg('Article content body is required.');
      setDrawerTab('core');
      return;
    }

    const tags = formData.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const keywords = formData.seo.keywordsInput
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || slugify(formData.title),
      excerpt: formData.excerpt.trim() || formData.title.trim(),
      content: formData.content,
      coverImage: formData.coverImage,
      author: formData.author,
      category: formData.category,
      tags,
      status: formData.status,
      publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : new Date().toISOString(),
      seo: {
        title: formData.seo.title.trim(),
        description: formData.seo.description.trim(),
        keywords,
      },
    };

    if (isCreatingNew) {
      createMutation.mutate(payload);
    } else if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: payload });
    }
  };

  // Quick Toggle Status
  const handleQuickToggleStatus = (post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    toggleStatusMutation.mutate({ id: post.id, status: nextStatus });
  };

  // Table Columns
  const columns = [
    {
      key: 'title',
      label: 'Article Title & Excerpt',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-12 h-10 rounded-lg border border-neutral-200 bg-neutral-100 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            {row.coverImage?.url ? (
              <img
                src={row.coverImage.url}
                alt={row.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerHTML = '<span class="text-neutral-400 font-serif font-bold text-[10px]">JHS</span>';
                }}
              />
            ) : (
              <BookOpen className="w-4 h-4 text-primary-800" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handleOpenEdit(row)}
                className="font-semibold text-xs text-neutral-900 hover:text-primary-800 transition-colors text-left truncate block"
              >
                {row.title}
              </button>
              {row.status === 'published' && (
                <a
                  href={`/blog/${row.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-primary-800 transition-colors"
                  title="View live article on public site"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="text-[11px] text-neutral-500 truncate max-w-sm mt-0.5">
              {row.excerpt || row.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Division Category',
      render: (_, row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
          <Layers className="w-3 h-3 text-neutral-400" />
          <span>{row.category}</span>
        </span>
      ),
    },
    {
      key: 'author',
      label: 'Author',
      render: (_, row) => (
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-neutral-800 truncate max-w-[150px]">
            {row.author?.name || 'Export Quality Desk'}
          </div>
          <div className="text-[10px] text-neutral-400 truncate max-w-[150px]">
            {row.author?.designation || 'QA Specialist'}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Publish Status',
      render: (_, row) => (
        <button
          onClick={() => handleQuickToggleStatus(row)}
          title={`Click to switch between Published and Draft (currently ${row.status})`}
          className="inline-flex items-center gap-1.5 cursor-pointer focus:outline-none"
        >
          <AdminStatusBadge status={row.status} />
        </button>
      ),
    },
    {
      key: 'readMinutes',
      label: 'Read Time',
      render: (_, row) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600">
          <Clock className="w-3 h-3 text-neutral-400" />
          <span>{row.readMinutes || 5} min</span>
        </span>
      ),
    },
    {
      key: 'publishedAt',
      label: 'Publish Date',
      sortable: true,
      render: (_, row) => (
        <span className="text-[11px] font-mono text-neutral-500">
          {row.publishedAt ? new Date(row.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'published' && (
            <a
              href={`/blog/${row.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-neutral-500 hover:text-primary-800 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Preview on Public Site"
            >
              <Eye className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Article"
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteModalPost(row)}
            title="Archive Article"
            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Blog & Trade Intelligence CMS Desk | JHS GLOBAL Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Top Header & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Editorial & Market Intelligence</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-neutral-900 tracking-tight mt-0.5">
              Blog & Trade Intelligence CMS
            </h1>
            <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
              Publish technical market monographs, regulatory guidance (EU/US FDA MRLs), and crop harvest intelligence across JHS GLOBAL’s 3 commercial export divisions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Article</span>
            </Button>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {feedback && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs font-medium text-emerald-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback('')} className="p-1 hover:bg-emerald-100 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs font-medium text-rose-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-rose-100 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl border border-neutral-200/90 bg-white shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Total Articles
            </span>
            <div className="text-2xl font-bold font-serif text-neutral-900 mt-1">
              {metrics.total}
            </div>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Knowledge Base Entries
            </span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/90 bg-white shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Published on Site
            </span>
            <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">
              {metrics.publishedCount}
            </div>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Live on /blog Index
            </span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/90 bg-white shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Drafts in Progress
            </span>
            <div className="text-2xl font-bold font-serif text-neutral-800 mt-1">
              {metrics.draftCount}
            </div>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Unpublished Manuscripts
            </span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/90 bg-white shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Scheduled Releases
            </span>
            <div className="text-2xl font-bold font-serif text-amber-700 mt-1">
              {metrics.scheduledCount}
            </div>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Automated Publishing
            </span>
          </div>
        </div>

        {/* FilterBar */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-2xs space-y-3">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={(val) => {
              setSearchQuery(val);
              setPage(1);
              setSearchParams((prev) => {
                if (val) prev.set('q', val);
                else prev.delete('q');
                return prev;
              });
            }}
            searchPlaceholder="Search articles by title, keywords, excerpt, or author..."
            statusOptions={[
              { id: 'all', label: 'All Articles' },
              { id: 'published', label: 'Published' },
              { id: 'draft', label: 'Drafts' },
              { id: 'scheduled', label: 'Scheduled' },
              { id: 'archived', label: 'Archived' },
            ]}
            selectedStatus={statusFilter}
            onStatusChange={(val) => {
              setStatusFilter(val);
              setPage(1);
              setSearchParams((prev) => {
                if (val && val !== 'all') prev.set('status', val);
                else prev.delete('status');
                return prev;
              });
            }}
            extraFilters={
              <div className="flex items-center gap-1.5">
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategoryFilter(val);
                    setPage(1);
                    setSearchParams((prev) => {
                      if (val && val !== 'all') prev.set('category', val);
                      else prev.delete('category');
                      return prev;
                    });
                  }}
                  className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-800/30 text-neutral-800"
                >
                  <option value="all">All Divisions / Topics</option>
                  {BLOG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            }
            onClear={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCategoryFilter('all');
              setPage(1);
              setSearchParams({});
            }}
          />
        </div>

        {/* Articles Data Table */}
        <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs overflow-hidden">
          <DataTable
            columns={columns}
            data={posts}
            loading={isLoading}
            page={meta.page}
            totalPages={meta.pages}
            totalCount={meta.total}
            onPageChange={(p) => setPage(p)}
            emptyMessage={
              searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No trade intelligence articles match the active filter criteria.'
                : 'No blog articles recorded in database.'
            }
          />
        </div>
      </div>

      {/* Slide-Over Inspector & Editor Drawer */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingPost(null);
          setIsCreatingNew(false);
        }}
        title={isCreatingNew ? 'Compose Trade Intelligence Article' : editingPost?.title || 'Article Editor'}
        subtitle={
          editingPost
            ? `/${editingPost.slug} • ${editingPost.category}`
            : 'Author technical market guides, QA specifications, and crop harvest analysis'
        }
        badge={
          editingPost ? (
            <AdminStatusBadge status={editingPost.status} />
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-700">
              New Draft
            </span>
          )
        }
        tabs={
          <div className="flex border-b border-neutral-200/80 -mb-4">
            <button
              onClick={() => setDrawerTab('core')}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                drawerTab === 'core'
                  ? 'border-neutral-900 text-neutral-900 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              1. Core & Content
            </button>
            <button
              onClick={() => setDrawerTab('taxonomy')}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                drawerTab === 'taxonomy'
                  ? 'border-neutral-900 text-neutral-900 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              2. Author & Taxonomy
            </button>
            <button
              onClick={() => setDrawerTab('media')}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                drawerTab === 'media'
                  ? 'border-neutral-900 text-neutral-900 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              3. Media & Cover Image
            </button>
            <button
              onClick={() => setDrawerTab('seo')}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                drawerTab === 'seo'
                  ? 'border-neutral-900 text-neutral-900 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              4. SEO & Publishing
            </button>
          </div>
        }
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {editingPost && (
                <button
                  type="button"
                  onClick={() => setDeleteModalPost(editingPost)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archive Article</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setEditingPost(null);
                  setIsCreatingNew(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleFormSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="inline-flex items-center gap-1.5"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>{isCreatingNew ? 'Publish Article' : 'Save Changes'}</span>
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* TAB 1: CORE & CONTENT */}
          {drawerTab === 'core' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Article Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Curcumin Biomarker Chemistry: HPLC Standardization Guide for Importers"
                  required
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  URL Slug Segment
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                  placeholder="curcumin-biomarker-chemistry-hplc-guide"
                  className="w-full px-3.5 py-2 text-xs font-mono border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Public site URL: /blog/{formData.slug || 'slug'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Executive Excerpt / Lead Summary <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Concise 2–3 sentence executive summary of the technical procurement insights..."
                  required
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700">
                    Article Body Content (Markdown Supported) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {formData.content.split(/\s+/).filter(Boolean).length} words • ~
                    {Math.max(1, Math.ceil(formData.content.split(/\s+/).filter(Boolean).length / 200))} min read
                  </span>
                </div>
                <textarea
                  rows={14}
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="## 1. Introduction...&#10;&#10;Write comprehensive technical specifications, tables, analytical thresholds, and procurement advice..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-mono border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: AUTHOR & TAXONOMY */}
          {drawerTab === 'taxonomy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/90 space-y-1">
                <span className="text-xs font-bold text-neutral-900 block">
                  Commercial Division Categorization
                </span>
                <p className="text-xs text-neutral-500">
                  Articles are organized under the 3 official commercial divisions to guide B2B importers to relevant commodities.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Primary Category Division
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none bg-white"
                >
                  {BLOG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Technical Tags (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tagsInput: e.target.value }))}
                  placeholder="e.g. HPLC, Curcumin, USP 467, Analytical Methods"
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-neutral-200/80 space-y-4">
                <span className="text-xs font-bold text-neutral-900 block">
                  Author Profile Attribution
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={formData.author.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          author: { ...prev.author, name: e.target.value },
                        }))
                      }
                      placeholder="e.g. Dr. R. Natarajan"
                      className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Designation / Trade Role
                    </label>
                    <input
                      type="text"
                      value={formData.author.designation}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          author: { ...prev.author, designation: e.target.value },
                        }))
                      }
                      placeholder="e.g. Head of QA & Phytochemistry"
                      className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Author Avatar URL
                  </label>
                  <input
                    type="text"
                    value={formData.author.avatar}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: { ...prev.author, avatar: e.target.value },
                      }))
                    }
                    placeholder="/images/placeholders/avatar-default.jpg"
                    className="w-full px-3.5 py-2 text-xs font-mono border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA & COVER IMAGE */}
          {drawerTab === 'media' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Cover Hero Image URL
                </label>
                <input
                  type="text"
                  value={formData.coverImage.url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      coverImage: { ...prev.coverImage, url: e.target.value },
                    }))
                  }
                  placeholder="/images/products/turmeric-curcumin-extract.webp"
                  className="w-full px-3.5 py-2 text-xs font-mono border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Image Descriptive Alt Text
                </label>
                <input
                  type="text"
                  value={formData.coverImage.alt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      coverImage: { ...prev.coverImage, alt: e.target.value },
                    }))
                  }
                  placeholder="Curcumin 95% HPLC testing and extraction analytical guide"
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
              </div>

              {/* Cover Image Preview Card */}
              {formData.coverImage.url && (
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                    Cover Preview
                  </span>
                  <div className="w-full h-48 rounded-xl overflow-hidden border border-neutral-200 bg-white">
                    <img
                      src={formData.coverImage.url}
                      alt={formData.coverImage.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-neutral-400">Image failed to load</div>';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SEO & PUBLISHING */}
          {drawerTab === 'seo' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none bg-white font-medium"
                  >
                    <option value="published">Published (Live on Public Site)</option>
                    <option value="draft">Draft (Private in CMS)</option>
                    <option value="scheduled">Scheduled (Future Release)</option>
                    <option value="archived">Archived (Delisted)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Publication Timestamp Date
                  </label>
                  <input
                    type="date"
                    value={formData.publishedAt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, publishedAt: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seo.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, title: e.target.value },
                    }))
                  }
                  placeholder="e.g. Curcumin 95% HPLC Purity & Standards | JHS GLOBAL"
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  SEO Meta Description
                </label>
                <textarea
                  rows={3}
                  value={formData.seo.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, description: e.target.value },
                    }))
                  }
                  placeholder="Learn HPLC biomarker standards, residual solvent limits, and purity criteria for importing Curcumin..."
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
              </div>

              {/* Public Live Preview Link */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                  Public Article Link Preview
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-700">
                    /blog/{formData.slug || 'slug'}
                  </span>
                  <a
                    href={`/blog/${formData.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-800 hover:underline"
                  >
                    <span>Inspect Public Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </form>
      </AdminDrawer>

      {/* Deletion / Archive Safeguard Modal */}
      {deleteModalPost && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setDeleteModalPost(null)}
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs animate-in fade-in"
          />

          <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200/90 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800 shrink-0">
                <Archive className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-900">
                  Archive "{deleteModalPost.title}"?
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Are you sure you want to archive <strong>{deleteModalPost.title}</strong>? It will be immediately delisted from the public /blog index and search engines.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalPost(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => deleteMutation.mutate(deleteModalPost.id)}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Archive</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlogCms;
