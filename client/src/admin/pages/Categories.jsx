import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  FolderTree,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  X,
  ExternalLink,
  Tag,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Boxes,
  HelpCircle,
  ShieldAlert,
  Loader2,
  Check,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  toggleAdminCategoryActive,
  reorderAdminCategories,
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

const CANONICAL_DIVISIONS = [
  { slug: 'personal-care-raw-materials', name: 'Personal Care Raw Materials', hs: '33' },
  { slug: 'nutraceutical-raw-materials', name: 'Nutraceutical Raw Materials', hs: '13' },
  { slug: 'animal-feed', name: 'Animal Feed', hs: '23' },
];

export const Categories = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [divisionFilter, setDivisionFilter] = useState(searchParams.get('division') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  // Drawer & Edit State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('details'); // 'details' | 'hierarchy' | 'seo'
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Deletion Safety Modal State
  const [deleteModalCategory, setDeleteModalCategory] = useState(null);

  // Feedback Notifications
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Default Form State
  const defaultFormData = {
    name: '',
    slug: '',
    hsChapter: '',
    description: '',
    icon: '',
    parentId: '',
    level: 1,
    order: 0,
    isActive: true,
    seo: {
      title: '',
      description: '',
    },
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Query: Categories List
  const {
    data: categories = [],
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['admin-categories', { division: divisionFilter, status: statusFilter, q: searchQuery }],
    queryFn: () =>
      fetchAdminCategories({
        division: divisionFilter !== 'all' ? divisionFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        q: searchQuery || undefined,
      }),
  });

  // Query: All categories for parent selection (unfiltered)
  const { data: allCategories = [] } = useQuery({
    queryKey: ['admin-categories-all'],
    queryFn: () => fetchAdminCategories(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createAdminCategory(data),
    onSuccess: (newCat) => {
      queryClient.invalidateQueries(['admin-categories']);
      queryClient.invalidateQueries(['admin-categories-all']);
      queryClient.invalidateQueries(['categories']);
      setIsDrawerOpen(false);
      setIsCreatingNew(false);
      setEditingCategory(null);
      setFeedback(`Division/Category "${newCat.name}" created successfully`);
      setTimeout(() => setFeedback(''), 4500);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminCategory(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries(['admin-categories']);
      queryClient.invalidateQueries(['admin-categories-all']);
      queryClient.invalidateQueries(['categories']);
      setIsDrawerOpen(false);
      setEditingCategory(null);
      setFeedback(`Category "${updated.name}" updated successfully`);
      setTimeout(() => setFeedback(''), 4500);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAdminCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-categories']);
      queryClient.invalidateQueries(['admin-categories-all']);
      queryClient.invalidateQueries(['categories']);
      setDeleteModalCategory(null);
      if (isDrawerOpen) setIsDrawerOpen(false);
      setFeedback('Category successfully deactivated');
      setTimeout(() => setFeedback(''), 4500);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to delete category';
      setErrorMsg(msg);
      setDeleteModalCategory(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id) => toggleAdminCategoryActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-categories']);
      queryClient.invalidateQueries(['admin-categories-all']);
      queryClient.invalidateQueries(['categories']);
      setFeedback('Category visibility status toggled');
      setTimeout(() => setFeedback(''), 3000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to toggle visibility');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items) => reorderAdminCategories(items),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-categories']);
      queryClient.invalidateQueries(['admin-categories-all']);
      queryClient.invalidateQueries(['categories']);
      setFeedback('Category display sequence updated');
      setTimeout(() => setFeedback(''), 3000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to reorder categories');
    },
  });

  // Calculate Operational Metrics
  const metrics = useMemo(() => {
    const totalDivisions = allCategories.filter((c) => !c.parentId || c.level === 1).length;
    const totalSubcategories = allCategories.filter((c) => c.parentId && c.level > 1).length;
    const activeCount = allCategories.filter((c) => c.isActive).length;
    const totalAssignedProducts = allCategories.reduce((sum, c) => sum + (c.productCount || 0), 0);
    return {
      totalDivisions,
      totalSubcategories,
      activeCount,
      totalAssignedProducts,
    };
  }, [allCategories]);

  // Handle Opening Create Drawer
  const handleOpenCreate = (parentCat = null) => {
    setIsCreatingNew(true);
    setEditingCategory(null);
    setErrorMsg('');
    setDrawerTab('details');

    const defaultParentId = parentCat ? String(parentCat.id) : '';
    const computedLevel = parentCat ? Math.min(3, (parentCat.level || 1) + 1) : 1;

    setFormData({
      ...defaultFormData,
      parentId: defaultParentId,
      level: computedLevel,
      hsChapter: parentCat?.hsChapter || '',
    });
    setIsDrawerOpen(true);
  };

  // Handle Opening Edit Drawer
  const handleOpenEdit = (category) => {
    setIsCreatingNew(false);
    setEditingCategory(category);
    setErrorMsg('');
    setDrawerTab('details');

    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      hsChapter: category.hsChapter || '',
      description: category.description || '',
      icon: category.icon || '',
      parentId: category.parentId ? String(category.parentId) : '',
      level: category.level || 1,
      order: category.order || 0,
      isActive: category.isActive !== false,
      seo: {
        title: category.seo?.title || '',
        description: category.seo?.description || '',
      },
    });
    setIsDrawerOpen(true);
  };

  // Handle Form Name Change (auto-slug)
  const handleNameChange = (val) => {
    setFormData((prev) => {
      const next = { ...prev, name: val };
      if (isCreatingNew && (!prev.slug || prev.slug === slugify(prev.name))) {
        next.slug = slugify(val);
      }
      return next;
    });
  };

  // Handle Parent Category Change (compute level)
  const handleParentChange = (parentIdVal) => {
    const parentIdNum = parentIdVal ? parseInt(parentIdVal, 10) : null;
    let computedLevel = 1;
    let inheritedHs = formData.hsChapter;

    if (parentIdNum) {
      const parentObj = allCategories.find((c) => c.id === parentIdNum);
      if (parentObj) {
        computedLevel = Math.min(3, (parentObj.level || 1) + 1);
        if (!inheritedHs && parentObj.hsChapter) {
          inheritedHs = parentObj.hsChapter;
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      parentId: parentIdVal,
      level: computedLevel,
      hsChapter: inheritedHs,
    }));
  };

  // Handle Form Submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Category or Division name is required.');
      setDrawerTab('details');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || slugify(formData.name),
      hsChapter: formData.hsChapter ? formData.hsChapter.trim() : '',
      description: formData.description ? formData.description.trim() : '',
      icon: formData.icon ? formData.icon.trim() : '',
      parentId: formData.parentId ? parseInt(formData.parentId, 10) : null,
      level: formData.level,
      order: parseInt(formData.order, 10) || 0,
      isActive: formData.isActive,
      seo: {
        title: formData.seo?.title ? formData.seo.title.trim() : '',
        description: formData.seo?.description ? formData.seo.description.trim() : '',
      },
    };

    if (isCreatingNew) {
      createMutation.mutate(payload);
    } else if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    }
  };

  // Reorder single step up/down
  const handleShiftOrder = (category, direction) => {
    // Find siblings (same parent)
    const siblings = allCategories
      .filter((c) => (c.parentId || null) === (category.parentId || null))
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

    const currentIndex = siblings.findIndex((s) => s.id === category.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;

    const targetSibling = siblings[targetIndex];

    const updatedItems = [
      { id: category.id, order: targetSibling.order || targetIndex },
      { id: targetSibling.id, order: category.order || currentIndex },
    ];

    reorderMutation.mutate(updatedItems);
  };

  // Candidate parent categories (excluding self and any descendants)
  const candidateParents = useMemo(() => {
    if (!editingCategory) {
      return allCategories.filter((c) => c.level < 3);
    }
    return allCategories.filter((c) => c.id !== editingCategory.id && c.parentId !== editingCategory.id && c.level < 3);
  }, [allCategories, editingCategory]);

  // Table Columns Definition
  const columns = [
    {
      key: 'name',
      label: 'Division / Category',
      sortable: true,
      render: (_, row) => {
        const isDivision = !row.parentId || row.level === 1;
        const isSub = row.level === 2;
        const isMicro = row.level === 3;

        return (
          <div className="flex items-center gap-2.5 py-1">
            {/* Visual Nesting Indentation */}
            {isSub && <div className="w-4 h-4 border-l-2 border-b-2 border-neutral-300 rounded-bl-sm shrink-0 -mt-1 ml-1" />}
            {isMicro && <div className="w-8 h-4 border-l-2 border-b-2 border-neutral-300 rounded-bl-sm shrink-0 -mt-1 ml-3" />}

            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`p-1.5 rounded-lg shrink-0 ${
                  isDivision
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : isSub
                    ? 'bg-amber-100/80 text-amber-900 border border-amber-200/80'
                    : 'bg-neutral-100 text-neutral-700'
                }`}
              >
                {isDivision ? (
                  <Layers className="w-4 h-4" />
                ) : isSub ? (
                  <FolderTree className="w-3.5 h-3.5" />
                ) : (
                  <Tag className="w-3 h-3" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleOpenEdit(row)}
                    className="font-semibold text-xs text-neutral-900 hover:text-primary-800 transition-colors text-left truncate"
                  >
                    {row.name}
                  </button>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-medium tracking-tight ${
                      isDivision
                        ? 'bg-neutral-900 text-white'
                        : isSub
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {isDivision ? 'Division' : isSub ? 'Subcategory' : 'Micro-segment'}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                  /{row.slug}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'parent',
      label: 'Parent Division',
      render: (_, row) => {
        if (!row.parent && (!row.parentId || row.level === 1)) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
              Master Root
            </span>
          );
        }
        return (
          <span className="text-xs font-medium text-neutral-700 truncate max-w-[140px] block">
            {row.parent?.name || `Division #${row.parentId}`}
          </span>
        );
      },
    },
    {
      key: 'hsChapter',
      label: 'HS Chapter',
      render: (_, row) =>
        row.hsChapter ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-neutral-100 text-neutral-800 border border-neutral-200/80">
            Ch. {row.hsChapter}
          </span>
        ) : (
          <span className="text-neutral-400 text-xs">—</span>
        ),
    },
    {
      key: 'order',
      label: 'Sequence',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono font-semibold text-neutral-700 w-5 text-center">
            {row.order || 0}
          </span>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => handleShiftOrder(row, 'up')}
              title="Move Up in sequence"
              className="p-0.5 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleShiftOrder(row, 'down')}
              title="Move Down in sequence"
              className="p-0.5 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'productCount',
      label: 'Assigned Products',
      sortable: true,
      render: (_, row) => {
        const count = row.productCount || 0;
        return (
          <Link
            to={`/admin/products?category=${row.id}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors hover:bg-neutral-100 group"
          >
            <Boxes className="w-3.5 h-3.5 text-neutral-400 group-hover:text-primary-800" />
            <span className={count > 0 ? 'font-semibold text-neutral-900 group-hover:text-primary-800' : 'text-neutral-400'}>
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          </Link>
        );
      },
    },
    {
      key: 'isActive',
      label: 'Visibility',
      render: (_, row) => (
        <button
          onClick={() => toggleActiveMutation.mutate(row.id)}
          title={row.isActive ? 'Click to deactivate from public mega-menu' : 'Click to publish on mega-menu'}
          className="inline-flex items-center gap-1.5 group cursor-pointer focus:outline-none"
        >
          <AdminStatusBadge status={row.isActive ? 'active' : 'draft'} />
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenCreate(row)}
            title="Add Subcategory under this"
            className="p-1.5 text-neutral-500 hover:text-primary-800 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit category details"
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteModalCategory(row)}
            title="Delete category"
            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Categories & Divisions Desk | JHS GLOBAL Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Top Header & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              <Layers className="w-3.5 h-3.5" />
              <span>Catalogue Governance</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-neutral-900 tracking-tight mt-0.5">
              Categories & Divisions Desk
            </h1>
            <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
              Hierarchy governance for JHS GLOBAL’s 3 canonical export divisions: Personal Care Raw Materials, Nutraceutical Raw Materials, and Animal Feed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenCreate()}
              className="inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Category / Division</span>
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
              Master Divisions
            </span>
            <div className="text-2xl font-bold font-serif text-neutral-900 mt-1">
              {metrics.totalDivisions}
            </div>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Level 1 Commercial Units
            </span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/90 bg-white shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Subcategories
            </span>
            <div className="text-2xl font-bold font-serif text-neutral-900 mt-1">
              {metrics.totalSubcategories}
            </div>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Level 2 & 3 Micro-segments
            </span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/90 bg-white shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Live Visibility
            </span>
            <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">
              {metrics.activeCount}
            </div>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Published on Mega-Menu
            </span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/90 bg-white shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Assigned Products
            </span>
            <div className="text-2xl font-bold font-serif text-neutral-900 mt-1">
              {metrics.totalAssignedProducts}
            </div>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Active Trade Commodities
            </span>
          </div>
        </div>

        {/* FilterBar & Division Tabs */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-2xs space-y-3">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={(val) => {
              setSearchQuery(val);
              setSearchParams((prev) => {
                if (val) prev.set('q', val);
                else prev.delete('q');
                return prev;
              });
            }}
            searchPlaceholder="Search categories by name, slug, or HS chapter..."
            statusOptions={[
              { id: 'all', label: 'All Statuses' },
              { id: 'active', label: 'Active on Mega-Menu' },
              { id: 'inactive', label: 'Draft / Hidden' },
            ]}
            selectedStatus={statusFilter}
            onStatusChange={(val) => {
              setStatusFilter(val);
              setSearchParams((prev) => {
                if (val && val !== 'all') prev.set('status', val);
                else prev.delete('status');
                return prev;
              });
            }}
            onClear={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setDivisionFilter('all');
              setSearchParams({});
            }}
          />

          {/* Division Tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 overflow-x-auto pb-1 admin-scrollbar">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 shrink-0 mr-1">
              Division:
            </span>
            <button
              onClick={() => {
                setDivisionFilter('all');
                setSearchParams((prev) => {
                  prev.delete('division');
                  return prev;
                });
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                divisionFilter === 'all'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
              }`}
            >
              All Categories ({allCategories.length})
            </button>

            {CANONICAL_DIVISIONS.map((div) => {
              const isSelected = divisionFilter === div.slug;
              const count = allCategories.filter(
                (c) => c.slug === div.slug || c.parent?.slug === div.slug
              ).length;

              return (
                <button
                  key={div.slug}
                  onClick={() => {
                    setDivisionFilter(div.slug);
                    setSearchParams((prev) => {
                      prev.set('division', div.slug);
                      return prev;
                    });
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
                  }`}
                >
                  <span>{div.name}</span>
                  <span className={`text-[10px] px-1.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Data Table */}
        <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs overflow-hidden">
          <DataTable
            columns={columns}
            data={categories}
            loading={isLoading}
            emptyMessage={
              searchQuery || divisionFilter !== 'all' || statusFilter !== 'all'
                ? 'No categories match the active filter criteria.'
                : 'No categories recorded in database.'
            }
          />
        </div>
      </div>

      {/* Slide-Over Inspector Drawer */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingCategory(null);
          setIsCreatingNew(false);
        }}
        title={isCreatingNew ? 'Create Category / Division' : editingCategory?.name || 'Category Details'}
        subtitle={
          editingCategory
            ? `${editingCategory.level === 1 ? 'Master Commercial Division' : 'Nested Commodity Subcategory'} • /${editingCategory.slug}`
            : 'Configure classification hierarchy, HS assignment, and SEO'
        }
        badge={
          editingCategory ? (
            <AdminStatusBadge status={editingCategory.isActive ? 'active' : 'draft'} />
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-700">
              Draft
            </span>
          )
        }
        tabs={
          <div className="flex border-b border-neutral-200/80 -mb-4">
            <button
              onClick={() => setDrawerTab('details')}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                drawerTab === 'details'
                  ? 'border-neutral-900 text-neutral-900 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              1. Details & HS Chapter
            </button>
            <button
              onClick={() => setDrawerTab('hierarchy')}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                drawerTab === 'hierarchy'
                  ? 'border-neutral-900 text-neutral-900 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              2. Hierarchy & Nesting
            </button>
            <button
              onClick={() => setDrawerTab('seo')}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                drawerTab === 'seo'
                  ? 'border-neutral-900 text-neutral-900 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              3. SEO & Mega-Menu
            </button>
          </div>
        }
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {editingCategory && (
                <button
                  type="button"
                  onClick={() => setDeleteModalCategory(editingCategory)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Category</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setEditingCategory(null);
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
                <span>{isCreatingNew ? 'Create Category' : 'Save Changes'}</span>
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* TAB 1: DETAILS & HS CHAPTER */}
          {drawerTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Category / Division Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Carrier Oils & Specialty Lipids"
                  required
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Official commercial title used across catalogue headers and visitor navigation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Slug Identifier
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                    placeholder="e.g. carrier-oils"
                    className="w-full px-3.5 py-2 text-xs font-mono border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Unique URL path segment: /categories/{formData.slug || 'slug'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    HS Chapter (2-digit)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.hsChapter}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hsChapter: e.target.value }))}
                    placeholder="e.g. 33 (Cosmetics), 13 (Botanicals), 23 (Feed)"
                    className="w-full px-3.5 py-2 text-xs font-mono border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Harmonized System 2-digit chapter classification for customs tariffs.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Description & Commercial Scope
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed commercial description of the product families, purity standards, and typical industrial applications..."
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Displayed on the public category page and indexed for search engines.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Icon Key / Glyph
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                  placeholder="e.g. Sparkles, Leaf, Wheat, Droplets, Shield"
                  className="w-full px-3.5 py-2 text-xs font-mono border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: HIERARCHY & NESTING */}
          {drawerTab === 'hierarchy' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/90 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                  <FolderTree className="w-4 h-4 text-primary-800" />
                  <span>3-Tier Classification Model</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  JHS GLOBAL organizes all trade commodities into 3 Master Divisions (Level 1), Subcategories (Level 2), and specialized Micro-segments (Level 3).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Parent Category / Division
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => handleParentChange(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none bg-white"
                >
                  <option value="">— None (Master Commercial Division - Level 1) —</option>
                  {candidateParents.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.level === 1 ? '📁 Division: ' : '↳ Subcategory: '}
                      {cat.name} ({cat.slug})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Leave empty if this is one of the 3 canonical Master Divisions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Computed Tier Level
                  </label>
                  <div className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-neutral-100/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-800" />
                    <span>
                      {formData.level === 1
                        ? 'Level 1: Master Commercial Division'
                        : formData.level === 2
                        ? 'Level 2: Subcategory'
                        : 'Level 3: Micro-segment'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Display Sequence Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none font-mono"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Lower sequence numbers appear first on visitor navigation menus.
                  </p>
                </div>
              </div>

              {/* Hierarchy Tree Visualizer */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                  Preview Hierarchy Breadcrumb
                </span>
                <div className="flex items-center gap-1.5 text-xs text-neutral-700 font-medium">
                  <span className="text-neutral-400">JHS GLOBAL</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  {formData.parentId ? (
                    <>
                      <span className="text-neutral-600">
                        {allCategories.find((c) => String(c.id) === formData.parentId)?.name || 'Parent'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                    </>
                  ) : null}
                  <span className="font-bold text-neutral-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {formData.name || 'Untitled Category'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEO METADATA & MEGA-MENU */}
          {drawerTab === 'seo' && (
            <div className="space-y-5">
              {/* Active Toggle Switch */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-white flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-900 block">
                    Public Mega-Menu & Catalogue Visibility
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    When active, this category is listed on the public header navigation, product filters, and sitemap.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seo?.title || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, title: e.target.value },
                    }))
                  }
                  placeholder="e.g. Bulk Cosmetic Carrier Oils Exporter | JHS GLOBAL"
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Recommended length: 50–60 characters. Format: [Category Name] Exporter | JHS GLOBAL
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  SEO Meta Description
                </label>
                <textarea
                  rows={3}
                  value={formData.seo?.description || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, description: e.target.value },
                    }))
                  }
                  placeholder="Commercial export of high-purity cosmetic oils and botanical lipids in FCL container shipments with COA and SDS documentation..."
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Recommended length: 140–160 characters.
                </p>
              </div>

              {/* Safety Guard Status */}
              {editingCategory && (
                <div
                  className={`p-4 rounded-xl border ${
                    (editingCategory.productCount || 0) > 0
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        (editingCategory.productCount || 0) > 0 ? 'text-amber-700' : 'text-neutral-400'
                      }`}
                    />
                    <div className="space-y-1">
                      <span className="text-xs font-semibold block">
                        Catalogue Safety Invariant
                      </span>
                      <p className="text-[11px] leading-relaxed">
                        {(editingCategory.productCount || 0) > 0 ? (
                          <>
                            <strong>{editingCategory.productCount} active commodity item(s)</strong> are assigned to this category. Deletion is automatically blocked by the database integrity guard until these products are reassigned or deactivated.
                          </>
                        ) : (
                          'No active products are assigned to this category. It can be safely soft-deleted if needed.'
                        )}
                      </p>
                      {(editingCategory.productCount || 0) > 0 && (
                        <Link
                          to={`/admin/products?category=${editingCategory.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-800 hover:underline mt-1"
                        >
                          <span>Review assigned products</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </AdminDrawer>

      {/* Deletion Safeguard Modal */}
      {deleteModalCategory && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setDeleteModalCategory(null)}
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs animate-in fade-in"
          />

          <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200/90 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  (deleteModalCategory.productCount || 0) > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-900">
                  {(deleteModalCategory.productCount || 0) > 0
                    ? 'Deletion Blocked: Active Products'
                    : `Delete "${deleteModalCategory.name}"?`}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {(deleteModalCategory.productCount || 0) > 0 ? (
                    <>
                      Cannot delete <strong>{deleteModalCategory.name}</strong> because{' '}
                      <strong>{deleteModalCategory.productCount} active product(s)</strong> are currently mapped to it. To maintain catalogue integrity, please reassign or deactivate all associated products before deleting this category.
                    </>
                  ) : (
                    <>
                      Are you sure you want to soft-delete <strong>{deleteModalCategory.name}</strong>? It will be immediately removed from visitor navigation menus, product filter dropdowns, and search sitemaps.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalCategory(null)}
              >
                {(deleteModalCategory.productCount || 0) > 0 ? 'Close' : 'Cancel'}
              </Button>

              {(deleteModalCategory.productCount || 0) > 0 ? (
                <Link to={`/admin/products?category=${deleteModalCategory.id}`}>
                  <Button variant="primary" size="sm" className="inline-flex items-center gap-1.5">
                    <span>Manage Products</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteMutation.mutate(deleteModalCategory.id)}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Delete</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Categories;
