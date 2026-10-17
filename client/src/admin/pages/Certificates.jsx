import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Award,
  ShieldCheck,
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
  FileText,
  FileCheck2,
  Calendar,
  Clock,
  AlertTriangle,
  Loader2,
  Check,
  Building2,
  Sparkles,
  Download,
} from 'lucide-react';
import {
  fetchAdminCertificates,
  createAdminCertificate,
  updateAdminCertificate,
  deleteAdminCertificate,
  toggleAdminCertificatePublic,
  reorderAdminCertificates,
} from '../api';
import Button from '../../components/ui/Button';
import {
  DataTable,
  FilterBar,
  AdminStatusBadge,
  AdminDrawer,
  AdminSkeleton,
} from '../components';

export const Certificates = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [validityFilter, setValidityFilter] = useState(searchParams.get('validity') || 'all');

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('credentials'); // 'credentials' | 'validity' | 'documents'
  const [editingCert, setEditingCert] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Deletion Modal State
  const [deleteModalCert, setDeleteModalCert] = useState(null);

  // Feedback Notifications
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Default Form State
  const defaultFormData = {
    name: '',
    fullName: '',
    issuedBy: '',
    number: '',
    issueDate: '',
    expiryDate: '',
    scope: '',
    logo: { url: '' },
    file: { url: '', type: 'pdf' },
    isPublic: true,
    order: 0,
    isActive: true,
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Query: Certificates List
  const {
    data: certificates = [],
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ['admin-certificates', { status: statusFilter, validity: validityFilter, q: searchQuery }],
    queryFn: () =>
      fetchAdminCertificates({
        status: statusFilter === 'active' ? 'active' : statusFilter === 'inactive' ? 'inactive' : undefined,
        isPublic: statusFilter === 'public' ? 'true' : statusFilter === 'hidden' ? 'false' : undefined,
        validity: validityFilter !== 'all' ? validityFilter : undefined,
        q: searchQuery || undefined,
      }),
  });

  // Query: All certificates for metric counters
  const { data: allCertificates = [] } = useQuery({
    queryKey: ['admin-certificates-all'],
    queryFn: () => fetchAdminCertificates(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createAdminCertificate(data),
    onSuccess: (newCert) => {
      queryClient.invalidateQueries(['admin-certificates']);
      queryClient.invalidateQueries(['admin-certificates-all']);
      queryClient.invalidateQueries(['certificates']);
      setIsDrawerOpen(false);
      setIsCreatingNew(false);
      setEditingCert(null);
      setFeedback(`Certificate "${newCert.name}" registered successfully`);
      setTimeout(() => setFeedback(''), 4500);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create certificate');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminCertificate(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries(['admin-certificates']);
      queryClient.invalidateQueries(['admin-certificates-all']);
      queryClient.invalidateQueries(['certificates']);
      setIsDrawerOpen(false);
      setEditingCert(null);
      setFeedback(`Certificate "${updated.name}" updated successfully`);
      setTimeout(() => setFeedback(''), 4500);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update certificate');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAdminCertificate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-certificates']);
      queryClient.invalidateQueries(['admin-certificates-all']);
      queryClient.invalidateQueries(['certificates']);
      setDeleteModalCert(null);
      if (isDrawerOpen) setIsDrawerOpen(false);
      setFeedback('Certificate deactivated from compliance records');
      setTimeout(() => setFeedback(''), 4500);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to delete certificate');
      setDeleteModalCert(null);
    },
  });

  const togglePublicMutation = useMutation({
    mutationFn: (id) => toggleAdminCertificatePublic(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-certificates']);
      queryClient.invalidateQueries(['admin-certificates-all']);
      queryClient.invalidateQueries(['certificates']);
      setFeedback('Certificate public showcase visibility toggled');
      setTimeout(() => setFeedback(''), 3000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to toggle visibility');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items) => reorderAdminCertificates(items),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-certificates']);
      queryClient.invalidateQueries(['admin-certificates-all']);
      queryClient.invalidateQueries(['certificates']);
      setFeedback('Certificate display sequence updated');
      setTimeout(() => setFeedback(''), 3000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to reorder certificates');
    },
  });

  // Calculate Compliance Metrics
  const metrics = useMemo(() => {
    const total = allCertificates.length;
    const publicCount = allCertificates.filter((c) => c.isPublic && c.isActive).length;
    const permanentCount = allCertificates.filter((c) => c.validityStatus === 'permanent').length;
    const renewalAlerts = allCertificates.filter(
      (c) => c.validityStatus === 'expiring_soon' || c.validityStatus === 'expired'
    );
    return {
      total,
      publicCount,
      permanentCount,
      renewalAlerts,
    };
  }, [allCertificates]);

  // Open Create Drawer
  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setEditingCert(null);
    setErrorMsg('');
    setDrawerTab('credentials');
    setFormData({
      ...defaultFormData,
      order: allCertificates.length + 1,
    });
    setIsDrawerOpen(true);
  };

  // Open Edit Drawer
  const handleOpenEdit = (cert) => {
    setIsCreatingNew(false);
    setEditingCert(cert);
    setErrorMsg('');
    setDrawerTab('credentials');

    const fmtDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

    setFormData({
      name: cert.name || '',
      fullName: cert.fullName || '',
      issuedBy: cert.issuedBy || '',
      number: cert.number || '',
      issueDate: fmtDate(cert.issueDate),
      expiryDate: fmtDate(cert.expiryDate),
      scope: cert.scope || '',
      logo: { url: cert.logo?.url || '' },
      file: { url: cert.file?.url || '', type: cert.file?.type || 'pdf' },
      isPublic: cert.isPublic !== false,
      order: cert.order || 0,
      isActive: cert.isActive !== false,
    });
    setIsDrawerOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Certificate name is required.');
      setDrawerTab('credentials');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      fullName: formData.fullName ? formData.fullName.trim() : '',
      issuedBy: formData.issuedBy ? formData.issuedBy.trim() : '',
      number: formData.number ? formData.number.trim() : '',
      issueDate: formData.issueDate ? new Date(formData.issueDate).toISOString() : null,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
      scope: formData.scope ? formData.scope.trim() : '',
      logo: { url: formData.logo?.url ? formData.logo.url.trim() : '' },
      file: {
        url: formData.file?.url ? formData.file.url.trim() : '',
        type: formData.file?.type || 'pdf',
      },
      isPublic: formData.isPublic,
      order: parseInt(formData.order, 10) || 0,
      isActive: formData.isActive,
    };

    if (isCreatingNew) {
      createMutation.mutate(payload);
    } else if (editingCert) {
      updateMutation.mutate({ id: editingCert.id, data: payload });
    }
  };

  // Shift sequence order
  const handleShiftOrder = (cert, direction) => {
    const sorted = [...allCertificates].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    const currentIndex = sorted.findIndex((c) => c.id === cert.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetCert = sorted[targetIndex];
    const updatedItems = [
      { id: cert.id, order: targetCert.order || targetIndex },
      { id: targetCert.id, order: cert.order || currentIndex },
    ];

    reorderMutation.mutate(updatedItems);
  };

  // Render Validity Badge Helper
  const renderValidityBadge = (cert) => {
    switch (cert.validityStatus) {
      case 'permanent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            <span>Perpetual</span>
          </span>
        );
      case 'expiring_soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ring-2 ring-amber-400/40" />
            <span>Expiring in {cert.daysRemaining}d</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Expired</span>
          </span>
        );
      case 'valid':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Valid ({cert.daysRemaining}d left)</span>
          </span>
        );
    }
  };

  // Table Columns
  const columns = [
    {
      key: 'name',
      label: 'Certificate & Authority',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-9 h-9 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            {row.logo?.url ? (
              <img
                src={row.logo.url}
                alt={row.name}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerHTML = '<span class="text-neutral-400 font-serif font-bold text-xs">JHS</span>';
                }}
              />
            ) : (
              <Award className="w-4 h-4 text-primary-800" />
            )}
          </div>

          <div className="min-w-0">
            <button
              onClick={() => handleOpenEdit(row)}
              className="font-semibold text-xs text-neutral-900 hover:text-primary-800 transition-colors text-left block truncate"
            >
              {row.name}
            </button>
            <div className="text-[11px] text-neutral-500 truncate max-w-xs">
              {row.fullName || row.issuedBy || 'Official Statutory Credential'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'number',
      label: 'Registration / License No.',
      render: (_, row) => (
        <div className="space-y-0.5">
          <div className="font-mono text-xs font-semibold text-neutral-800 bg-neutral-100/80 px-2 py-0.5 rounded-md inline-block border border-neutral-200/70">
            {row.number || 'TODO(client)'}
          </div>
          {row.issuedBy && (
            <div className="text-[10px] text-neutral-400 truncate max-w-[200px]" title={row.issuedBy}>
              {row.issuedBy}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'validity',
      label: 'Validity Status',
      render: (_, row) => renderValidityBadge(row),
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
      key: 'isPublic',
      label: 'Public Trust Grid',
      render: (_, row) => (
        <button
          onClick={() => togglePublicMutation.mutate(row.id)}
          title={row.isPublic ? 'Click to hide from /quality public trust showcase' : 'Click to publish on /quality'}
          className="inline-flex items-center gap-1.5 group cursor-pointer focus:outline-none"
        >
          <AdminStatusBadge status={row.isPublic ? 'active' : 'draft'} />
        </button>
      ),
    },
    {
      key: 'file',
      label: 'Document Vault',
      render: (_, row) =>
        row.file?.url ? (
          <a
            href={row.file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors border border-neutral-200/80 group"
          >
            <FileText className="w-3.5 h-3.5 text-primary-800" />
            <span>PDF Scanned</span>
            <ExternalLink className="w-3 h-3 text-neutral-400 group-hover:text-neutral-700" />
          </a>
        ) : (
          <span className="text-neutral-400 text-xs italic">No document</span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            title="Inspect & Edit Certificate"
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteModalCert(row)}
            title="Deactivate Certificate"
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
        <title>Certificates & Statutory Compliance Desk | JHS GLOBAL Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              <Award className="w-3.5 h-3.5" />
              <span>Statutory Compliance Registry</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-neutral-900 tracking-tight mt-0.5">
              Certificates & Compliance Desk
            </h1>
            <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
              Central single source of truth for JHS GLOBAL export accreditations, statutory licenses (FSSAI, APEDA, DGFT IEC, GST, MSME Udyam), renewal dates, and public trust verification.
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
              <span>Register Certificate</span>
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

        {/* Urgent Renewal Alert Banner */}
        {metrics.renewalAlerts.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300/80 flex items-start gap-3 shadow-2xs animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">
                  Compliance Renewal Attention Required ({metrics.renewalAlerts.length})
                </span>
                <button
                  onClick={() => {
                    setValidityFilter('expiring_soon');
                    setSearchParams((prev) => {
                      prev.set('validity', 'expiring_soon');
                      return prev;
                    });
                  }}
                  className="text-[11px] font-semibold text-amber-800 underline hover:text-amber-950"
                >
                  Filter Alert Items
                </button>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                The following statutory license(s) have upcoming renewal deadlines or have expired:
                {' '}
                <strong>{metrics.renewalAlerts.map((c) => c.name).join(', ')}</strong>.
                Ensure renewal applications are logged with statutory authorities to maintain uninterrupted cross-border customs clearance.
              </p>
            </div>
          </div>
        )}

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl border border-neutral-200/90 bg-white shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Total Accreditations
            </span>
            <div className="text-2xl font-bold font-serif text-neutral-900 mt-1">
              {metrics.total}
            </div>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Registered Export Licenses
            </span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/90 bg-white shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Public Trust Grid
            </span>
            <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">
              {metrics.publicCount}
            </div>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Published on /quality page
            </span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/90 bg-white shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Perpetual Licenses
            </span>
            <div className="text-2xl font-bold font-serif text-neutral-800 mt-1">
              {metrics.permanentCount}
            </div>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Permanent Statutory Codes
            </span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/90 bg-white shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Renewal Alerts
            </span>
            <div className={`text-2xl font-bold font-serif mt-1 ${metrics.renewalAlerts.length > 0 ? 'text-amber-700' : 'text-neutral-900'}`}>
              {metrics.renewalAlerts.length}
            </div>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Due within 60 Days
            </span>
          </div>
        </div>

        {/* FilterBar */}
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
            searchPlaceholder="Search certificates by name, number, authority, or commodity scope..."
            statusOptions={[
              { id: 'all', label: 'All Certificates' },
              { id: 'public', label: 'Public on /quality' },
              { id: 'hidden', label: 'Internal Only' },
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
            extraFilters={
              <div className="flex items-center gap-1.5">
                <select
                  value={validityFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setValidityFilter(val);
                    setSearchParams((prev) => {
                      if (val && val !== 'all') prev.set('validity', val);
                      else prev.delete('validity');
                      return prev;
                    });
                  }}
                  className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-800/30 text-neutral-800"
                >
                  <option value="all">All Validity Types</option>
                  <option value="valid">Valid (Active Term)</option>
                  <option value="expiring_soon">Expiring Soon (&lt;60d)</option>
                  <option value="expired">Expired</option>
                  <option value="permanent">Perpetual / Permanent</option>
                </select>
              </div>
            }
            onClear={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setValidityFilter('all');
              setSearchParams({});
            }}
          />
        </div>

        {/* Certificates Data Table */}
        <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs overflow-hidden">
          <DataTable
            columns={columns}
            data={certificates}
            loading={isLoading}
            emptyMessage={
              searchQuery || statusFilter !== 'all' || validityFilter !== 'all'
                ? 'No certificates match the selected filter criteria.'
                : 'No statutory certificates recorded in database.'
            }
          />
        </div>
      </div>

      {/* Slide-Over Inspector Drawer */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingCert(null);
          setIsCreatingNew(false);
        }}
        title={isCreatingNew ? 'Register Statutory Certificate' : editingCert?.name || 'Certificate Dossier'}
        subtitle={
          editingCert
            ? `${editingCert.number || 'No license number'} • ${editingCert.issuedBy || 'Statutory Authority'}`
            : 'Configure statutory export license, validity schedule, and document vault'
        }
        badge={
          editingCert ? (
            renderValidityBadge(editingCert)
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-700">
              New License
            </span>
          )
        }
        tabs={
          <div className="flex border-b border-neutral-200/80 -mb-4">
            <button
              onClick={() => setDrawerTab('credentials')}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                drawerTab === 'credentials'
                  ? 'border-neutral-900 text-neutral-900 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              1. Credentials & Authority
            </button>
            <button
              onClick={() => setDrawerTab('validity')}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                drawerTab === 'validity'
                  ? 'border-neutral-900 text-neutral-900 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              2. Validity & Renewal Schedule
            </button>
            <button
              onClick={() => setDrawerTab('documents')}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                drawerTab === 'documents'
                  ? 'border-neutral-900 text-neutral-900 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              3. Document Vault & Public Trust
            </button>
          </div>
        }
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {editingCert && (
                <button
                  type="button"
                  onClick={() => setDeleteModalCert(editingCert)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Deactivate Certificate</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setEditingCert(null);
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
                <span>{isCreatingNew ? 'Register Certificate' : 'Save Changes'}</span>
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* TAB 1: CREDENTIALS & AUTHORITY */}
          {drawerTab === 'credentials' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Certificate Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. FSSAI Central License"
                  required
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Primary title displayed on compliance tables and public accreditation cards.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Registered Statutory Title
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="e.g. Food Safety and Standards Authority of India (Central License - Exporter & Importer)"
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Registration / License Number
                  </label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => setFormData((prev) => ({ ...prev, number: e.target.value }))}
                    placeholder="e.g. 10725997001058 or EZHPP3437C"
                    className="w-full px-3.5 py-2 text-xs font-mono border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Official alphanumeric registration or RCMC license code.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Issuing Authority Body
                  </label>
                  <input
                    type="text"
                    value={formData.issuedBy}
                    onChange={(e) => setFormData((prev) => ({ ...prev, issuedBy: e.target.value }))}
                    placeholder="e.g. Joint DGFT Surat, Ministry of Commerce"
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Statutory Commodity Scope & Endorsements
                </label>
                <textarea
                  rows={4}
                  value={formData.scope}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scope: e.target.value }))}
                  placeholder="Official scope of export activities authorized under this license, permitted commodities, and processing classes..."
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Legal scope verified during customs clearance and international buyer due diligence.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: VALIDITY & RENEWAL SCHEDULE */}
          {drawerTab === 'validity' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/90 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                  <Clock className="w-4 h-4 text-primary-800" />
                  <span>Statutory Validity & 60-Day Renewal Monitoring</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  For permanent licenses (DGFT IEC, GSTIN, MSME Udyam), leave the expiry date blank. For term registrations (FSSAI, APEDA RCMC, CRES), enter the expiration date to enable automated 60-day early alerts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, issueDate: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Leave blank for perpetual / permanent registrations.
                  </p>
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
                  Order sequence for public accreditation grid and trust badges.
                </p>
              </div>

              {/* Live Validity Status Card */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                  Computed Compliance Status
                </span>
                <div className="flex items-center gap-2">
                  {!formData.expiryDate ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                      <span className="w-2 h-2 rounded-full bg-neutral-400" />
                      <span>Permanent License (No expiration renewal required)</span>
                    </span>
                  ) : (
                    (() => {
                      const now = new Date();
                      const exp = new Date(formData.expiryDate);
                      const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
                      if (diff < 0) {
                        return (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>Expired on {formData.expiryDate}</span>
                          </span>
                        );
                      }
                      if (diff <= 60) {
                        return (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span>Urgent Renewal: Expires in {diff} days</span>
                          </span>
                        );
                      }
                      return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Active: {diff} days validity remaining</span>
                        </span>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENT VAULT & PUBLIC TRUST */}
          {drawerTab === 'documents' && (
            <div className="space-y-5">
              {/* Public Trust Grid Toggle */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-white flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-900 block">
                    Public Quality Page Trust Grid
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    When active, this certificate is published on the public /quality accreditation grid and homepage trust marks.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Official PDF Document Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.file?.url || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        file: { ...prev.file, url: e.target.value, type: 'pdf' },
                      }))
                    }
                    placeholder="/documents/fssai-license.pdf"
                    className="w-full px-3.5 py-2 text-xs font-mono border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                  />
                  {formData.file?.url && (
                    <a
                      href={formData.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-neutral-200 rounded-xl hover:bg-neutral-100 text-neutral-700"
                      title="Open PDF"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Relative or absolute URL to downloadable PDF document for buyer due diligence.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Certificate Seal / Logo URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.logo?.url || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        logo: { url: e.target.value },
                      }))
                    }
                    placeholder="/images/certifications/fssai-license.png"
                    className="w-full px-3.5 py-2 text-xs font-mono border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-800 focus:outline-none"
                  />
                  {formData.logo?.url && (
                    <div className="w-8 h-8 rounded-lg border border-neutral-200 p-0.5 bg-neutral-50 shrink-0">
                      <img
                        src={formData.logo.url}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Emblem or government authority logo displayed on certificate cards.
                </p>
              </div>

              {/* Document Preview Card */}
              {formData.file?.url && (
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white border border-neutral-200 text-primary-800 shadow-2xs">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">
                        Verified Statutory Document
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500">
                        {formData.file.url}
                      </span>
                    </div>
                  </div>

                  <a
                    href={formData.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </form>
      </AdminDrawer>

      {/* Deletion Safeguard Modal */}
      {deleteModalCert && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setDeleteModalCert(null)}
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs animate-in fade-in"
          />

          <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200/90 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-900">
                  Deactivate "{deleteModalCert.name}"?
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Are you sure you want to soft-delete <strong>{deleteModalCert.name}</strong> ({deleteModalCert.number})? It will be immediately removed from the public /quality accreditation grid and statutory compliance registry.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalCert(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => deleteMutation.mutate(deleteModalCert.id)}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Deactivate</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Certificates;
