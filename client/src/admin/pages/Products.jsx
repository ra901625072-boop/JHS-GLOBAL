import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
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
  Eye,
  FileText,
  Upload,
  Globe,
  Truck,
  Layers,
  Check,
  Image as ImageIcon,
  CheckCheck,
} from 'lucide-react';
import {
  fetchAdminProducts,
  fetchAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  toggleAdminProductActive,
  toggleAdminProductFeatured,
  verifyAdminProductSpec,
  attachAdminProductDocument,
  removeAdminProductDocument,
  generateAiProductContent,
  fetchAiCatalogueAudit,
} from '../api';
import { fetchCategories } from '../../features/products/api';
import Button from '../../components/ui/Button';
import {
  DataTable,
  FilterBar,
  AdminStatusBadge,
  AdminDrawer,
  AdminSkeleton,
  AdminPageHeader,
} from '../components';

export const Products = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search, pagination and filtering state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Selected product & drawer state
  const [selectedProductId, setSelectedProductId] = useState(searchParams.get('id') || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(Boolean(searchParams.get('id')));
  const [drawerTab, setDrawerTab] = useState('basic'); // 'basic' | 'specs' | 'trade' | 'docs' | 'seo'
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Feedback & Audit state
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDraftNotice, setAiDraftNotice] = useState('');
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditData, setAuditData] = useState(null);

  // Document attachment form state
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState('tds');
  const [newDocUrl, setNewDocUrl] = useState('');

  // Default empty form state
  const defaultFormData = {
    name: '',
    slug: '',
    sku: '',
    categoryId: '',
    subCategoryId: '',
    hsCode: '',
    botanicalName: '',
    origin: 'India',
    shortDescription: '',
    description: '',
    forms: [],
    grades: ['Export Quality'],
    moq: { value: 1, unit: 'MT' },
    packing: [{ type: 'PP Bag', size: '25 kg', notes: 'Standard export packaging' }],
    shelfLife: '24 months',
    storage: 'Store in a cool, dry place away from direct sunlight',
    leadTime: '10–15 business days',
    ports: ['Mundra', 'Nhava Sheva (JNPT)'],
    incoterms: ['FOB', 'CIF', 'CFR'],
    containerLoad: { fcl20: '', fcl40: '', lcl: '' },
    isFeatured: false,
    isActive: true,
    isVerified: false,
    isPrivateLabelAvailable: true,
    specs: [
      { key: 'Purity', parameter: 'Purity', specification: 'Min 99.0%', typicalValue: '99.5%', testMethod: 'HPLC', verified: true },
      { key: 'Moisture', parameter: 'Moisture Content', specification: 'Max 10.0%', typicalValue: '8.2%', testMethod: 'Oven Drying', verified: true },
    ],
    documents: [],
    images: [],
    seo: { title: '', description: '', keywords: [] },
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Fetch Categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Fetch Products query
  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: pageSize,
    };
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
    if (statusFilter === 'active') params.status = 'active';
    else if (statusFilter === 'draft') params.status = 'draft';
    else if (statusFilter === 'featured') params.isFeatured = true;

    if (sortField) {
      params.sort = sortDirection === 'asc' ? sortField : `-${sortField}`;
    }
    return params;
  }, [page, pageSize, searchQuery, selectedCategory, statusFilter, sortField, sortDirection]);

  const {
    data: productsData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin-products', queryParams],
    queryFn: () => fetchAdminProducts(queryParams),
    keepPreviousData: true,
  });

  const products = productsData?.products || [];
  const meta = productsData?.meta || { total: 0, page: 1, limit: pageSize, pages: 1 };

  // Fetch full details of selected product when drawer is open
  const { data: activeProductDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['admin-product-detail', selectedProductId],
    queryFn: () => fetchAdminProductById(selectedProductId),
    enabled: Boolean(selectedProductId) && !isCreatingNew,
  });

  // Sync form data when active product details load
  useEffect(() => {
    if (activeProductDetails && !isCreatingNew) {
      setFormData({
        name: activeProductDetails.name || '',
        slug: activeProductDetails.slug || '',
        sku: activeProductDetails.sku || '',
        categoryId: String(activeProductDetails.categoryId || activeProductDetails.category?.id || ''),
        subCategoryId: activeProductDetails.subCategoryId ? String(activeProductDetails.subCategoryId) : '',
        hsCode: activeProductDetails.hsCode || '',
        botanicalName: activeProductDetails.botanicalName || '',
        origin: activeProductDetails.origin || 'India',
        shortDescription: activeProductDetails.shortDescription || '',
        description: activeProductDetails.description || '',
        forms: Array.isArray(activeProductDetails.forms) ? activeProductDetails.forms : [],
        grades: Array.isArray(activeProductDetails.grades) ? activeProductDetails.grades : ['Export Quality'],
        moq: activeProductDetails.moq || { value: 1, unit: 'MT' },
        packing: Array.isArray(activeProductDetails.packing) && activeProductDetails.packing.length > 0
          ? activeProductDetails.packing
          : [{ type: 'PP Bag', size: '25 kg', notes: 'Standard export packaging' }],
        shelfLife: activeProductDetails.shelfLife || '24 months',
        storage: activeProductDetails.storage || 'Store in a cool, dry place away from direct sunlight',
        leadTime: activeProductDetails.leadTime || '10–15 business days',
        ports: Array.isArray(activeProductDetails.ports) ? activeProductDetails.ports : ['Mundra', 'Nhava Sheva (JNPT)'],
        incoterms: Array.isArray(activeProductDetails.incoterms) ? activeProductDetails.incoterms : ['FOB', 'CIF', 'CFR'],
        containerLoad: activeProductDetails.containerLoad || { fcl20: '', fcl40: '', lcl: '' },
        isFeatured: Boolean(activeProductDetails.isFeatured),
        isActive: activeProductDetails.isActive !== false,
        isVerified: Boolean(activeProductDetails.isVerified),
        isPrivateLabelAvailable: activeProductDetails.isPrivateLabelAvailable !== false,
        specs: Array.isArray(activeProductDetails.specs) ? activeProductDetails.specs : [],
        documents: Array.isArray(activeProductDetails.documents) ? activeProductDetails.documents : [],
        images: Array.isArray(activeProductDetails.images) ? activeProductDetails.images : [],
        seo: activeProductDetails.seo || { title: '', description: '', keywords: [] },
      });
    }
  }, [activeProductDetails, isCreatingNew]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createAdminProduct(data),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setIsDrawerOpen(false);
      setIsCreatingNew(false);
      setSelectedProductId(null);
      setFeedback(`Product "${newProduct.name}" created successfully`);
      setTimeout(() => setFeedback(''), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminProduct(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product-detail', selectedProductId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      setFeedback(`Product "${updated.name}" updated successfully`);
      setTimeout(() => setFeedback(''), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to update product');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id) => toggleAdminProductActive(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      setFeedback(`Product status updated to ${result.isActive ? 'Published' : 'Draft'}`);
      setTimeout(() => setFeedback(''), 3000);
    },
  });

  const verifySpecMutation = useMutation({
    mutationFn: ({ id, specIndex, verified }) => verifyAdminProductSpec(id, { specIndex, verified }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product-detail', selectedProductId] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const attachDocMutation = useMutation({
    mutationFn: ({ id, data }) => attachAdminProductDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product-detail', selectedProductId] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setNewDocTitle('');
      setNewDocUrl('');
      setFeedback('Technical document attached');
      setTimeout(() => setFeedback(''), 3000);
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to attach document');
    },
  });

  const removeDocMutation = useMutation({
    mutationFn: ({ id, docId }) => removeAdminProductDocument(id, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product-detail', selectedProductId] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setFeedback('Document removed');
      setTimeout(() => setFeedback(''), 3000);
    },
  });

  // Drawer Opening Handlers
  const handleOpenCreateDrawer = () => {
    setIsCreatingNew(true);
    setSelectedProductId(null);
    setFormData({
      ...defaultFormData,
      categoryId: categories[0]?.id ? String(categories[0].id) : '',
    });
    setDrawerTab('basic');
    setErrorMsg('');
    setAiDraftNotice('');
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (product) => {
    setIsCreatingNew(false);
    setSelectedProductId(product.id || product._id);
    setDrawerTab('basic');
    setErrorMsg('');
    setAiDraftNotice('');
    setIsDrawerOpen(true);
    setSearchParams({ id: product.id || product._id });
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedProductId(null);
    setIsCreatingNew(false);
    setSearchParams({});
  };

  // Spec Table Modification Handlers
  const handleAddSpecRow = () => {
    setFormData((prev) => ({
      ...prev,
      specs: [
        ...prev.specs,
        {
          key: `spec_${Date.now()}`,
          parameter: '',
          specification: '',
          typicalValue: '',
          testMethod: '',
          verified: false,
        },
      ],
    }));
  };

  const handleUpdateSpecRow = (index, field, value) => {
    setFormData((prev) => {
      const nextSpecs = [...prev.specs];
      nextSpecs[index] = { ...nextSpecs[index], [field]: value };
      return { ...prev, specs: nextSpecs };
    });
  };

  const handleRemoveSpecRow = (index) => {
    setFormData((prev) => {
      const nextSpecs = prev.specs.filter((_, i) => i !== index);
      return { ...prev, specs: nextSpecs };
    });
  };

  const handleToggleSpecVerified = (index) => {
    const spec = formData.specs[index];
    const newVerified = !spec.verified;
    handleUpdateSpecRow(index, 'verified', newVerified);

    if (selectedProductId && !isCreatingNew) {
      verifySpecMutation.mutate({
        id: selectedProductId,
        specIndex: index,
        verified: newVerified,
      });
    }
  };

  // AI Content Assist
  const handleAiGenerate = async () => {
    if (!formData.name) {
      setErrorMsg('Please enter a commodity name first before invoking AI assist.');
      return;
    }
    setErrorMsg('');
    setAiGenerating(true);
    setAiDraftNotice('');
    try {
      const catObj = categories.find((c) => String(c.id) === String(formData.categoryId));
      const res = await generateAiProductContent({
        productName: formData.name,
        categoryName: catObj?.name || 'Raw Materials',
        origin: formData.origin || 'India',
        targetMarkets: ['Middle East', 'Europe', 'North America', 'Southeast Asia'],
      });
      const generated = res?.data || res;
      if (generated) {
        setFormData((prev) => ({
          ...prev,
          shortDescription: generated.shortDescription || generated.description || prev.shortDescription,
          hsCode: generated.specSuggestions?.suggestedHsCode || generated.suggestedHsCode || prev.hsCode,
          moq: {
            value: generated.specSuggestions?.suggestedMoq?.value || prev.moq.value,
            unit: generated.specSuggestions?.suggestedMoq?.unit || prev.moq.unit,
          },
          leadTime: generated.specSuggestions?.suggestedLeadTime || prev.leadTime,
          storage: generated.specSuggestions?.suggestedStorage || prev.storage,
        }));
        setAiDraftNotice('[AI GENERATED SUGGESTION — REQUIRES HUMAN APPROVAL] Review export specs and HS classification before publishing.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate AI content');
    } finally {
      setAiGenerating(false);
    }
  };

  // Document Attachment Handler
  const handleAttachDocument = (e) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocUrl.trim()) return;

    if (selectedProductId && !isCreatingNew) {
      attachDocMutation.mutate({
        id: selectedProductId,
        data: {
          title: newDocTitle.trim(),
          type: newDocType,
          url: newDocUrl.trim(),
        },
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        documents: [
          ...prev.documents,
          {
            id: `temp_${Date.now()}`,
            title: newDocTitle.trim(),
            type: newDocType,
            url: newDocUrl.trim(),
            addedAt: new Date().toISOString(),
          },
        ],
      }));
      setNewDocTitle('');
      setNewDocUrl('');
    }
  };

  // Form Submission
  const handleSaveProduct = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Product name is required');
      return;
    }
    if (!formData.hsCode.trim()) {
      setErrorMsg('HS Code is required');
      return;
    }
    if (!formData.categoryId) {
      setErrorMsg('Category is required');
      return;
    }

    const payload = {
      ...formData,
      categoryId: parseInt(formData.categoryId, 10),
      subCategoryId: formData.subCategoryId ? parseInt(formData.subCategoryId, 10) : null,
      moq: {
        value: Number(formData.moq?.value || 1),
        unit: formData.moq?.unit || 'MT',
      },
    };

    if (isCreatingNew) {
      createMutation.mutate(payload);
    } else if (selectedProductId) {
      updateMutation.mutate({ id: selectedProductId, data: payload });
    }
  };

  // Status Filter Options for FilterBar
  const statusOptions = [
    { id: 'all', label: 'All Commodities', count: meta.total },
    { id: 'active', label: 'Published' },
    { id: 'draft', label: 'Drafts' },
    { id: 'featured', label: 'Featured' },
  ];

  // Table Columns Definition
  const columns = [
    {
      key: 'name',
      label: 'Commodity & Identification',
      sortable: true,
      render: (val, row) => {
        const imgUrl = row.images?.[0]?.url || row.images?.[0] || `/images/products/${row.slug}.webp`;
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 border border-[[var(--admin-border)]] shrink-0 relative">
              <img
                src={imgUrl}
                alt={row.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-neutral-900 text-xs sm:text-sm truncate flex items-center gap-1.5">
                <span>{row.name}</span>
                {row.isFeatured && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                    Featured
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-neutral-400 text-[11px] font-mono mt-0.5">
                <span>{row.slug}</span>
                {row.botanicalName && (
                  <>
                    <span>•</span>
                    <span className="italic font-sans text-neutral-500 truncate max-w-[140px]">{row.botanicalName}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'hsCode',
      label: 'HS Code',
      sortable: true,
      render: (val) => (
        <span className="font-mono tabular-nums font-bold bg-neutral-100 text-[[var(--admin-brand)]] border border-[[var(--admin-border)]] px-2 py-0.5 rounded text-xs">
          {val || 'N/A'}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Division & Category',
      render: (_, row) => (
        <div>
          <span className="text-neutral-900 font-semibold text-xs block">
            {row.category?.name || 'Raw Materials'}
          </span>
          <span className="text-[11px] text-neutral-400 block">
            {row.origin ? `Origin: ${Array.isArray(row.origin) ? row.origin.join(', ') : row.origin}` : 'Origin: India'}
          </span>
        </div>
      ),
    },
    {
      key: 'moq',
      label: 'MOQ & Terms',
      render: (val, row) => (
        <div>
          <span className="font-mono tabular-nums font-bold text-neutral-900 text-xs block">
            {val?.value} {val?.unit || 'MT'}
          </span>
          <span className="text-[10px] text-neutral-500 font-mono block">
            {row.incoterms?.slice(0, 3).join('/') || 'FOB/CIF'}
          </span>
        </div>
      ),
    },
    {
      key: 'packing',
      label: 'Packing & Logistics',
      render: (val, row) => {
        const packText = val?.[0] ? `${val[0].size} ${val[0].type}` : 'Standard PP';
        return (
          <div>
            <span className="text-xs text-neutral-700 font-medium block truncate max-w-[140px]">
              {packText}
            </span>
            <span className="text-[11px] text-neutral-400 block font-mono tabular-nums">
              Lead: {row.leadTime || '10-15 days'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'specs',
      label: 'Lab Specs',
      render: (val) => {
        const specCount = Array.isArray(val) ? val.length : 0;
        const verifiedCount = Array.isArray(val) ? val.filter((s) => s.verified).length : 0;
        const isComplete = specCount > 0 && verifiedCount === specCount;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono tabular-nums font-semibold border ${
                isComplete
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : specCount > 0
                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                    : 'bg-neutral-100 text-neutral-600 border-[[var(--admin-border)]]'
              }`}
            >
              {isComplete ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <ShieldCheck className="w-3 h-3 text-sky-600" />}
              <span>{specCount > 0 ? `${verifiedCount}/${specCount} Specs` : 'No Specs'}</span>
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => (
        <AdminStatusBadge status={row.isActive !== false ? 'active' : 'draft'} />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditDrawer(row);
            }}
            className="p-1.5 text-neutral-600 hover:text-[[var(--admin-brand)]] hover:bg-neutral-100 rounded-md transition-colors"
            title="Inspect and edit commodity specs"
          >
            <Edit className="w-4 h-4" />
          </button>

          <a
            href={`/products/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-neutral-400 hover:text-[[var(--admin-brand)]] hover:bg-neutral-100 rounded-md transition-colors"
            title="Open live public commodity page"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleActiveMutation.mutate(row.id || row._id);
            }}
            className={`p-1.5 rounded-md transition-colors ${
              row.isActive !== false
                ? 'text-neutral-400 hover:text-amber-600 hover:bg-amber-50'
                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
            title={row.isActive !== false ? 'Draft product' : 'Publish product'}
          >
            {row.isActive !== false ? <Trash2 className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Products & Technical Specs Desk — JHS GLOBAL</title>
      </Helmet>

      {/* Standardized Page Header (Template 2) */}
      <AdminPageHeader
        breadcrumb={[
          { label: 'Commodity Catalogue', href: '/admin/products' },
          { label: 'Products & Specs' },
        ]}
        title="Products & Technical Specifications"
        description="Maintain certified laboratory parameters, export packing standards, container payloads, and international trade compliance across all 3 divisions."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              onClick={async () => {
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
              }}
              variant="outline"
              disabled={isAuditing}
              className="text-xs py-2 flex items-center gap-1.5 font-semibold border-[[var(--admin-border)]]"
            >
              {isAuditing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-700" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[[var(--admin-accent)]]" />
              )}
              <span>{isAuditing ? 'Auditing...' : 'Quality Audit'}</span>
            </Button>

            <Button
              onClick={handleOpenCreateDrawer}
              variant="cta"
              className="text-xs py-2 flex items-center gap-1.5 font-bold shadow-xs bg-[[var(--admin-accent)]] text-neutral-900 hover:bg-[#b5924a]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Commodity</span>
            </Button>
          </div>
        }
      />

      {/* User Alerts & Notification Feedback */}
      {feedback && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-admin-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{feedback}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-admin-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* FilterBar Container */}
      <div className="bg-white border border-[[var(--admin-border)]] rounded-admin-lg p-4 elevation-flat mb-6">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={(val) => {
            setSearchQuery(val);
            setPage(1);
          }}
          searchPlaceholder="Search commodity, HS code, botanical name..."
          statusOptions={statusOptions}
          selectedStatus={statusFilter}
          onStatusChange={(status) => {
            setStatusFilter(status);
            setPage(1);
          }}
          onClear={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setStatusFilter('all');
            setPage(1);
          }}
          extraFilters={
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="text-xs px-3 py-1.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-neutral-800 font-medium focus:ring-2 focus:ring-[[var(--admin-brand)]] focus:outline-none"
              >
                <option value="all">All Divisions & Categories</option>
                {categories.map((c) => (
                  <option key={c.id || c._id} value={c.slug || c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          }
        />
      </div>

      {/* Products DataTable Card */}
      <div className="bg-white border border-[[var(--admin-border)]] rounded-admin-lg elevation-flat overflow-hidden">
        <DataTable
          columns={columns}
          data={products}
          loading={isLoading}
          emptyMessage="No commodities match the selected search or category filters."
          page={page}
          pageSize={pageSize}
          totalCount={meta.total}
          totalPages={meta.pages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          onRowClick={(row) => handleOpenEditDrawer(row)}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={(field) => {
            if (sortField === field) {
              setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            } else {
              setSortField(field);
              setSortDirection('desc');
            }
          }}
        />
      </div>

      {/* 5-Tab Slide-Over AdminDrawer */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={isCreatingNew ? 'Register New Export Commodity' : (formData.name || 'Commodity Dossier')}
        subtitle={
          isCreatingNew
            ? 'Initialize certified laboratory specifications, trade parameters, and HS classification'
            : `HS Code: ${formData.hsCode || 'N/A'} • Slug: ${formData.slug}`
        }
        badge={
          !isCreatingNew && (
            <AdminStatusBadge status={formData.isActive ? 'active' : 'draft'} />
          )
        }
        maxWidth="max-w-3xl"
        tabs={
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg border border-[[var(--admin-border)]] text-xs font-semibold overflow-x-auto admin-scrollbar">
            {[
              { id: 'basic', label: '1. Basic Info' },
              { id: 'specs', label: `2. Lab Specs (${formData.specs.length})` },
              { id: 'trade', label: '3. Trade & Logistics' },
              { id: 'docs', label: `4. Documents (${formData.documents.length})` },
              { id: 'seo', label: '5. SEO' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDrawerTab(tab.id)}
                className={`flex-1 py-1.5 px-3 rounded-md transition-all whitespace-nowrap text-center ${
                  drawerTab === tab.id
                    ? 'bg-white text-neutral-900  font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {!isCreatingNew && formData.slug && (
                <a
                  href={`/products/${formData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[[var(--admin-brand)]] hover:underline flex items-center gap-1"
                >
                  <span>Live Preview</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <Button variant="secondary" size="sm" onClick={handleCloseDrawer}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="cta"
                size="sm"
                className="bg-[[var(--admin-accent)]] text-neutral-900 hover:bg-[#b5924a] font-bold"
                loading={createMutation.isPending || updateMutation.isPending}
                onClick={handleSaveProduct}
              >
                {isCreatingNew ? 'Create Commodity' : 'Save Changes'}
              </Button>
            </div>
          </div>
        }
      >
        {/* AI Drafting Assistant Card - Calm Forest Surface */}
        <div className="mb-6 bg-[[var(--admin-brand)]] text-white rounded-admin-lg p-4 border border-[#1b3d2b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 elevation-raised">
          <div>
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[[var(--admin-accent)]]" />
              <span>AI Commodity Specifications Assistant</span>
            </p>
            <p className="text-[11px] text-neutral-300 mt-0.5">
              Generate standardized technical parameters, 6-digit HS classification, and packaging sizes.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={aiGenerating}
            onClick={handleAiGenerate}
            className="shrink-0 text-xs font-semibold py-1.5 px-3 border-white/20 text-white hover:bg-white/10"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-[[var(--admin-accent)]]" />
            Suggest with AI
          </Button>
        </div>

        {aiDraftNotice && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{aiDraftNotice}</span>
          </div>
        )}

        {/* TAB 1: BASIC INFO & HS CLASSIFICATION */}
        {drawerTab === 'basic' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Commodity Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Organic Ashwagandha Extract (Withanolides 5%)"
                  className="w-full p-2.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[[var(--admin-brand)]]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  HS Code (Harmonized System) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hsCode}
                  onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
                  placeholder="e.g. 1302.19"
                  className="w-full p-2.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-xs font-mono tabular-nums focus:bg-white focus:ring-2 focus:ring-[[var(--admin-brand)]]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Division & Category *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[[var(--admin-brand)]]"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Botanical Name
                </label>
                <input
                  type="text"
                  value={formData.botanicalName}
                  onChange={(e) => setFormData({ ...formData, botanicalName: e.target.value })}
                  placeholder="e.g. Withania somnifera"
                  className="w-full p-2.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-xs italic focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Country of Origin
                </label>
                <input
                  type="text"
                  value={Array.isArray(formData.origin) ? formData.origin.join(', ') : formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-xs focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Product Slug (URL identifier)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Auto-generated if left blank"
                  className="w-full p-2.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Internal SKU / Code
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. JHS-EXT-ASHW-001"
                  className="w-full p-2.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                Technical Overview & Commercial Summary
              </label>
              <textarea
                rows={3}
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Key active constituents, physical appearance, extraction ratio, and certified export compliance..."
                className="w-full p-2.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-xs"
              />
            </div>

            <div className="pt-2 flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPrivateLabelAvailable}
                  onChange={(e) =>
                    setFormData({ ...formData, isPrivateLabelAvailable: e.target.checked })
                  }
                  className="rounded text-[[var(--admin-brand)]] focus:ring-[[var(--admin-brand)]]"
                />
                <span className="text-neutral-700 font-medium">OEM & Private Label Packaging Available</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: LABORATORY SPEC TABLE EDITOR */}
        {drawerTab === 'specs' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">Certificate of Analysis Parameters</h4>
                <p className="text-neutral-500 text-[11px]">
                  Define laboratory standard limits, test protocols (HPLC, GC-MS, AOAC), and per-spec verification flags.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleAddSpecRow}
                variant="outline"
                size="sm"
                className="text-xs py-1.5 flex items-center gap-1 border-[[var(--admin-border)]]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Spec Row</span>
              </Button>
            </div>

            <div className="border border-[[var(--admin-border)]] rounded-admin-lg overflow-hidden bg-white elevation-flat">
              <table className="w-full text-left text-xs divide-y divide-[[var(--admin-border)]]">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold">
                  <tr>
                    <th className="px-3 py-2.5">Parameter / Assay</th>
                    <th className="px-3 py-2.5">Test Method</th>
                    <th className="px-3 py-2.5">Specification Limit</th>
                    <th className="px-3 py-2.5">Typical Value</th>
                    <th className="px-3 py-2.5 text-center">Verified</th>
                    <th className="px-2 py-2.5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {formData.specs.map((spec, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50">
                      <td className="p-2">
                        <input
                          type="text"
                          value={spec.parameter || spec.key || ''}
                          onChange={(e) => handleUpdateSpecRow(idx, 'parameter', e.target.value)}
                          placeholder="e.g. Curcuminoids"
                          className="w-full p-1.5 border border-[[var(--admin-border)]] rounded text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={spec.testMethod || ''}
                          onChange={(e) => handleUpdateSpecRow(idx, 'testMethod', e.target.value)}
                          placeholder="e.g. HPLC"
                          className="w-full p-1.5 border border-[[var(--admin-border)]] rounded text-xs font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={spec.specification || spec.standard || ''}
                          onChange={(e) => handleUpdateSpecRow(idx, 'specification', e.target.value)}
                          placeholder="Min 95.0%"
                          className="w-full p-1.5 border border-[[var(--admin-border)]] rounded text-xs font-mono tabular-nums"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={spec.typicalValue || spec.value || ''}
                          onChange={(e) => handleUpdateSpecRow(idx, 'typicalValue', e.target.value)}
                          placeholder="95.4%"
                          className="w-full p-1.5 border border-[[var(--admin-border)]] rounded text-xs font-mono tabular-nums"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSpecVerified(idx)}
                          className={`p-1.5 rounded-md text-xs font-semibold flex items-center justify-center mx-auto transition-colors ${
                            spec.verified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-100 text-neutral-400 hover:text-neutral-700'
                          }`}
                          title={spec.verified ? 'Verified specification' : 'Click to verify spec'}
                        >
                          <ShieldCheck className={`w-4 h-4 ${spec.verified ? 'text-emerald-700' : 'text-neutral-400'}`} />
                        </button>
                      </td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecRow(idx)}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {formData.specs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-neutral-400 text-xs">
                        No technical specifications defined. Click "+ Add Spec Row" to record laboratory parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: EXPORT TRADE & CONTAINER LOGISTICS */}
        {drawerTab === 'trade' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Minimum Order Quantity (MOQ)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="1"
                    value={formData.moq.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        moq: { ...formData.moq, value: Number(e.target.value) },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-xs font-mono tabular-nums"
                  />
                  <select
                    value={formData.moq.unit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        moq: { ...formData.moq, unit: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-xs"
                  >
                    <option value="MT">Metric Ton (MT)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="20ft FCL">20ft FCL</option>
                    <option value="40ft FCL">40ft FCL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Order Fulfillment Lead Time
                </label>
                <input
                  type="text"
                  value={formData.leadTime}
                  onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                  placeholder="e.g. 10–15 business days"
                  className="w-full p-2.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-xs tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Shelf Life
                </label>
                <input
                  type="text"
                  value={formData.shelfLife}
                  onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })}
                  placeholder="24 months"
                  className="w-full p-2.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-xs tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Storage Conditions
                </label>
                <input
                  type="text"
                  value={formData.storage}
                  onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                  placeholder="Cool, dry, dark environment"
                  className="w-full p-2.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Container Load Capacity */}
            <div className="border border-[[var(--admin-border)]] rounded-admin-lg p-4 bg-neutral-50/50 space-y-3">
              <h5 className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-neutral-700" />
                <span>Container Payload Capacity (FCL / LCL)</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-500 text-[11px] mb-1 font-medium">20ft FCL Payload</label>
                  <input
                    type="text"
                    value={formData.containerLoad?.fcl20 || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        containerLoad: { ...formData.containerLoad, fcl20: e.target.value },
                      })
                    }
                    placeholder="e.g. 18 MT (Palletized)"
                    className="w-full p-2 bg-white border border-[[var(--admin-border)]] rounded-lg text-xs font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-neutral-500 text-[11px] mb-1 font-medium">40ft FCL / HC Payload</label>
                  <input
                    type="text"
                    value={formData.containerLoad?.fcl40 || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        containerLoad: { ...formData.containerLoad, fcl40: e.target.value },
                      })
                    }
                    placeholder="e.g. 26 MT (Palletized)"
                    className="w-full p-2 bg-white border border-[[var(--admin-border)]] rounded-lg text-xs font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-neutral-500 text-[11px] mb-1 font-medium">LCL Pallet Standard</label>
                  <input
                    type="text"
                    value={formData.containerLoad?.lcl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        containerLoad: { ...formData.containerLoad, lcl: e.target.value },
                      })
                    }
                    placeholder="e.g. 500 kg / pallet min"
                    className="w-full p-2 bg-white border border-[[var(--admin-border)]] rounded-lg text-xs font-mono tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Ports & Incoterms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                  Ports of Dispatch
                </label>
                <div className="space-y-1.5">
                  {['Mundra', 'Nhava Sheva (JNPT)', 'Hazira'].map((port) => (
                    <label key={port} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.ports.includes(port)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...formData.ports, port]
                            : formData.ports.filter((p) => p !== port);
                          setFormData({ ...formData, ports: next });
                        }}
                        className="rounded text-[[var(--admin-brand)]]"
                      />
                      <span className="text-neutral-700">{port}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                  Commercial Incoterms
                </label>
                <div className="space-y-1.5">
                  {['FOB', 'CIF', 'CFR', 'EXW'].map((term) => (
                    <label key={term} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.incoterms.includes(term)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...formData.incoterms, term]
                            : formData.incoterms.filter((t) => t !== term);
                          setFormData({ ...formData, incoterms: next });
                        }}
                        className="rounded text-[[var(--admin-brand)]]"
                      />
                      <span className="text-neutral-700 font-mono font-medium">{term}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TECHNICAL DOCUMENTS & MEDIA GALLERY */}
        {drawerTab === 'docs' && (
          <div className="space-y-6 text-xs">
            {/* Document Uploader / Link Form */}
            <div className="border border-[[var(--admin-border)]] rounded-admin-lg p-4 bg-neutral-50/60 space-y-3">
              <h5 className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-neutral-700" />
                <span>Attach Technical Document (TDS / SDS / COA)</span>
              </h5>

              <form onSubmit={handleAttachDocument} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-neutral-500 text-[11px] mb-1">Document Type</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    className="w-full p-2 bg-white border border-[[var(--admin-border)]] rounded-lg text-xs"
                  >
                    <option value="tds">TDS (Technical Data Sheet)</option>
                    <option value="sds">SDS (Safety Data Sheet)</option>
                    <option value="coa">COA (Batch Certificate of Analysis)</option>
                    <option value="specification_sheet">Specification Sheet</option>
                    <option value="organic_cert">Organic Certificate</option>
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-neutral-500 text-[11px] mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    placeholder="e.g. TDS-Ashwagandha-2026.pdf"
                    className="w-full p-2 bg-white border border-[[var(--admin-border)]] rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-neutral-500 text-[11px] mb-1">File URL / Storage Path</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      value={newDocUrl}
                      onChange={(e) => setNewDocUrl(e.target.value)}
                      placeholder="/documents/tds/... or https://"
                      className="w-full p-2 bg-white border border-[[var(--admin-border)]] rounded-lg text-xs font-mono"
                    />
                    <Button type="submit" variant="cta" size="sm" className="shrink-0 py-2 bg-[[var(--admin-accent)]] text-neutral-900 hover:bg-[#b5924a] font-bold">
                      Attach
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Document List */}
            <div className="space-y-2">
              <h5 className="font-bold text-neutral-900 text-xs">Attached Technical Dossiers</h5>
              {formData.documents && formData.documents.length > 0 ? (
                <div className="divide-y divide-neutral-100 border border-[[var(--admin-border)]] rounded-admin-lg overflow-hidden bg-white">
                  {formData.documents.map((doc, idx) => (
                    <div key={doc.id || idx} className="p-3 flex items-center justify-between hover:bg-neutral-50">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-[[var(--admin-border)]] font-mono text-[10px] font-bold uppercase">
                          {doc.type || 'DOC'}
                        </span>
                        <div>
                          <span className="font-semibold text-neutral-900 text-xs block">{doc.title}</span>
                          <span className="text-neutral-400 text-[11px] font-mono block">{doc.url}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-neutral-400 hover:text-neutral-700"
                          title="Open document"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedProductId && !isCreatingNew) {
                              removeDocMutation.mutate({ id: selectedProductId, docId: doc.id || idx });
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                documents: prev.documents.filter((_, i) => i !== idx),
                              }));
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-600"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-400 text-xs italic py-2">No technical documents attached yet.</p>
              )}
            </div>

            {/* Images & Gallery Alt Text */}
            <div className="space-y-3 pt-2">
              <h5 className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-neutral-700" />
                <span>Product Gallery & Accessible Alt Text</span>
              </h5>
              <p className="text-neutral-500 text-[11px]">
                High-resolution photographs for catalog showcase. Alt text is mandatory for SEO and accessibility.
              </p>

              <div className="p-4 border border-dashed border-[[var(--admin-border)]] rounded-admin-lg bg-neutral-50/50 text-center">
                <p className="text-xs text-neutral-600 font-medium">Standard Catalogue Asset Path:</p>
                <code className="text-[11px] font-mono text-neutral-800 bg-white px-2 py-0.5 rounded border border-[[var(--admin-border)]] mt-1 inline-block">
                  /images/products/{formData.slug || 'commodity-slug'}.webp
                </code>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SEO, STATUS & PUBLISHING */}
        {drawerTab === 'seo' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                Meta Title (SEO)
              </label>
              <input
                type="text"
                value={formData.seo?.title || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, title: e.target.value },
                  })
                }
                placeholder={`${formData.name || 'Commodity'} Exporter India | JHS GLOBAL`}
                className="w-full p-2.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                Meta Description (Search Snippet)
              </label>
              <textarea
                rows={3}
                value={formData.seo?.description || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, description: e.target.value },
                  })
                }
                placeholder="Direct manufacturer & exporter of certified export quality commodities from Gujarat, India. Batch COA, container FCL/LCL dispatch."
                className="w-full p-2.5 bg-neutral-50 border border-[[var(--admin-border)]] rounded-lg text-xs"
              />
            </div>

            {/* Publishing Toggles */}
            <div className="border border-[[var(--admin-border)]] rounded-admin-lg p-4 bg-neutral-50/50 space-y-3 pt-4">
              <h5 className="font-bold text-neutral-900 text-xs">Publication & Showcase Flags</h5>

              <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-[[var(--admin-border)]] cursor-pointer">
                <div>
                  <span className="font-bold text-neutral-900 text-xs block">Published to Public Catalogue</span>
                  <span className="text-neutral-500 text-[11px] block">
                    When active, product is indexed, searchable, and accessible by overseas buyers.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-[[var(--admin-brand)]] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-[[var(--admin-border)]] cursor-pointer">
                <div>
                  <span className="font-bold text-neutral-900 text-xs block">Featured in Homepage Showcase</span>
                  <span className="text-neutral-500 text-[11px] block">
                    Highlight in featured marquee and key commodity showcase rails.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-[[var(--admin-brand)]] w-4 h-4"
                />
              </label>
            </div>
          </div>
        )}
      </AdminDrawer>

      {/* Catalogue Quality Audit Modal */}
      {auditModalOpen && auditData && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[[var(--admin-border)]]">
            <div className="p-6 border-b border-[[var(--admin-border)]] flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-admin-lg bg-[[var(--admin-brand)]] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-sans text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <span>Export Quality & HS Compliance Audit</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono tabular-nums">
                      Score: {auditData.catalogueHealthScore}%
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">{auditData.summary}</p>
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

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-neutral-50 rounded-admin-lg border border-[[var(--admin-border)]]">
                  <span className="text-[11px] text-neutral-400 uppercase font-semibold block">Total</span>
                  <span className="font-sans text-xl font-bold text-neutral-900 tabular-nums">{auditData.totalAudited}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-admin-lg border border-emerald-200">
                  <span className="text-[11px] text-emerald-700 uppercase font-semibold block">Compliant</span>
                  <span className="font-sans text-xl font-bold text-emerald-800 tabular-nums">{auditData.healthyCount}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-admin-lg border border-amber-200">
                  <span className="text-[11px] text-amber-700 uppercase font-semibold block">Need Attention</span>
                  <span className="font-sans text-xl font-bold text-amber-800 tabular-nums">{auditData.flawedCount}</span>
                </div>
              </div>

              {auditData.issues && auditData.issues.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                    Commodities Requiring Enrichment ({auditData.issues.length})
                  </h4>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
                    {auditData.issues.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-[[var(--admin-border)]] bg-neutral-50/50">
                        <div className="flex items-center justify-between font-bold text-neutral-900">
                          <span>{item.productName} ({item.category})</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            {item.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          Missing fields: {item.missingFields?.join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[[var(--admin-border)]] bg-neutral-50/70 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setAuditModalOpen(false)}>
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
