import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FlaskConical,
  Truck,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  Mail,
  Phone,
  MapPin,
  Tag,
  Eye,
  Send,
  Plus,
  ShieldCheck,
  PackageCheck,
  FileCheck,
  MessageSquare,
} from 'lucide-react';
import {
  fetchAdminSamples,
  fetchAdminSampleById,
  updateAdminSample,
  dispatchAdminSample,
  attachAdminSampleDocument,
} from '../api';
import Button from '../../components/ui/Button';
import {
  DataTable,
  FilterBar,
  AdminStatusBadge,
  AdminDrawer,
  AdminSkeleton,
} from '../components';
import Reveal from '../../components/ui/Reveal';

export const Samples = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSampleId, setSelectedSampleId] = useState(searchParams.get('id') || null);
  const [drawerTab, setDrawerTab] = useState('overview'); // 'overview' | 'dispatch' | 'documents' | 'pipeline'
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Dispatch Form State
  const [dispatchCourier, setDispatchCourier] = useState('DHL');
  const [dispatchAwb, setDispatchAwb] = useState('');
  const [dispatchTrackingUrl, setDispatchTrackingUrl] = useState('');
  const [dispatchEstDelivery, setDispatchEstDelivery] = useState('');
  const [dispatchNote, setDispatchNote] = useState('');

  // Status & Note State
  const [pipelineStatus, setPipelineStatus] = useState('');
  const [pipelineNote, setPipelineNote] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Document Attachment State
  const [docType, setDocType] = useState('COA');
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');

  // Fetch Samples List
  const { data: sampleData, isLoading } = useQuery({
    queryKey: ['admin-samples', selectedStatus, searchQuery, page],
    queryFn: () =>
      fetchAdminSamples({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        q: searchQuery.trim() || undefined,
        page,
        limit: 25,
      }),
  });

  // Fetch Single Sample Detail
  const { data: activeSample, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-sample-detail', selectedSampleId],
    queryFn: () => fetchAdminSampleById(selectedSampleId),
    enabled: !!selectedSampleId,
  });

  useEffect(() => {
    if (activeSample) {
      setPipelineStatus(activeSample.status || 'new');
      setPipelineNote('');
      setFeedbackMsg('');
      setDispatchCourier(activeSample.courier || activeSample.courierAccount?.provider || 'DHL');
      setDispatchAwb(activeSample.awbNumber || activeSample.trackingNo || '');
      setDispatchTrackingUrl(activeSample.trackingUrl || '');
      setDispatchEstDelivery(
        activeSample.estimatedDeliveryDate
          ? new Date(activeSample.estimatedDeliveryDate).toISOString().split('T')[0]
          : ''
      );
      setDispatchNote('');
      setDocName('');
      setDocUrl('');
      setDrawerTab('overview');
    }
  }, [activeSample]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminSample(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries(['admin-samples']);
      queryClient.invalidateQueries(['admin-sample-detail', updated.id || updated._id]);
      setFeedbackMsg('Sample pipeline status and notes saved');
      setPipelineNote('');
      setTimeout(() => setFeedbackMsg(''), 4000);
    },
    onError: (err) => {
      setFeedbackMsg(`Update failed: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setFeedbackMsg(''), 5000);
    },
  });

  const dispatchMutation = useMutation({
    mutationFn: ({ id, data }) => dispatchAdminSample(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries(['admin-samples']);
      queryClient.invalidateQueries(['admin-sample-detail', updated.id || updated._id]);
      setFeedbackMsg('Sample dispatched successfully! AWB and tracking recorded.');
      setTimeout(() => setFeedbackMsg(''), 5000);
    },
    onError: (err) => {
      setFeedbackMsg(`Dispatch failed: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setFeedbackMsg(''), 5000);
    },
  });

  const documentMutation = useMutation({
    mutationFn: ({ id, data }) => attachAdminSampleDocument(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries(['admin-sample-detail', updated.id || updated._id]);
      queryClient.invalidateQueries(['admin-samples']);
      setDocName('');
      setDocUrl('');
      setFeedbackMsg('Technical compliance document attached to sample dossier');
      setTimeout(() => setFeedbackMsg(''), 4000);
    },
    onError: (err) => {
      setFeedbackMsg(`Document attachment failed: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setFeedbackMsg(''), 5000);
    },
  });

  const statusOptions = [
    { id: 'all', label: 'All Evaluation Samples' },
    { id: 'new', label: 'New Requests' },
    { id: 'in_review', label: 'In Review' },
    { id: 'preparing', label: 'Packaging Lot' },
    { id: 'dispatched', label: 'Dispatched' },
    { id: 'in_transit', label: 'In Transit' },
    { id: 'delivered', label: 'Delivered to Lab' },
    { id: 'feedback_received', label: 'Feedback Received' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const handleDispatchSubmit = (e) => {
    e.preventDefault();
    if (!selectedSampleId) return;

    dispatchMutation.mutate({
      id: selectedSampleId,
      data: {
        courier: dispatchCourier,
        awbNumber: dispatchAwb.trim(),
        trackingUrl: dispatchTrackingUrl.trim() || undefined,
        estimatedDeliveryDate: dispatchEstDelivery || undefined,
        note: dispatchNote.trim() || undefined,
      },
    });
  };

  const handleUpdateStatusSubmit = (e) => {
    e.preventDefault();
    if (!selectedSampleId) return;

    updateMutation.mutate({
      id: selectedSampleId,
      data: {
        status: pipelineStatus,
        note: pipelineNote.trim() || undefined,
      },
    });
  };

  const handleDocumentSubmit = (e) => {
    e.preventDefault();
    if (!selectedSampleId || !docName.trim() || !docUrl.trim()) return;

    documentMutation.mutate({
      id: selectedSampleId,
      data: {
        type: docType,
        name: docName.trim(),
        url: docUrl.trim(),
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        key: 'referenceNo',
        label: 'Reference No',
        sortable: true,
        headerClassName: 'w-36',
        render: (row) => (
          <span className="font-mono font-bold text-primary-900">{row.referenceNo}</span>
        ),
      },
      {
        key: 'buyer',
        label: 'Buyer & Company',
        sortable: false,
        render: (row) => (
          <div>
            <div className="font-semibold text-neutral-900">{row.buyer?.name}</div>
            <div className="text-neutral-500 text-[11px]">{row.buyer?.company}</div>
          </div>
        ),
      },
      {
        key: 'country',
        label: 'Destination',
        sortable: false,
        render: (row) => (
          <div>
            <div className="font-medium text-neutral-800">
              {row.shippingAddress?.country || row.buyer?.country || 'International'}
            </div>
            {row.shippingAddress?.city && (
              <div className="text-neutral-400 text-[11px]">{row.shippingAddress.city}</div>
            )}
          </div>
        ),
      },
      {
        key: 'products',
        label: 'Requested Products & Qty',
        sortable: false,
        render: (row) =>
          row.products?.length > 0 ? (
            <div className="max-w-xs truncate text-neutral-700">
              {row.products.map((p) => `${p.productName} (${p.qty || '250g'})`).join(', ')}
            </div>
          ) : (
            <span className="text-neutral-400 italic">Custom test batch</span>
          ),
      },
      {
        key: 'courierAwb',
        label: 'Courier & AWB Tracking',
        sortable: false,
        render: (row) => {
          const awb = row.awbNumber || row.trackingNo;
          if (!awb) {
            return (
              <span className="text-[11px] text-neutral-400 italic">
                {row.courier || row.courierAccount?.provider || 'Courier TBD'}
              </span>
            );
          }
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-neutral-800">
                {row.courier || 'Courier'}: {awb}
              </span>
              {row.trackingUrl && (
                <a
                  href={row.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary-800 hover:text-primary-900 p-0.5 rounded hover:bg-neutral-100 transition-colors"
                  title="Track shipment on courier portal"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          );
        },
      },
      {
        key: 'status',
        label: 'Status',
        sortable: false,
        render: (row) => <AdminStatusBadge status={row.status} />,
      },
      {
        key: 'createdAt',
        label: 'Requested Date',
        sortable: true,
        render: (row) => (
          <span className="font-mono text-neutral-500 text-[11px]">
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Action',
        headerClassName: 'text-right',
        render: (row) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSampleId(row.id || row._id);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary-800 bg-primary-50 hover:bg-primary-100 rounded-md border border-primary-200/80 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Dossier</span>
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Helmet>
        <title>Sample Dispatch Desk — JHS GLOBAL</title>
      </Helmet>

      {/* Page Header */}
      <Reveal direction="up" distance={16} duration={0.5} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold mb-2">
              <FlaskConical className="w-3.5 h-3.5 text-neutral-900" />
              <span>LABORATORY EVALUATION • GLOBAL COURIER LOGISTICS</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Sample Dispatch & Quality Testing Desk
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
              Commercial management of trial evaluation samples, recipient shipping address verification, courier AWB tracking links, and COA/SDS compliance documents.
            </p>
          </div>
        </div>
      </Reveal>

      {/* FilterBar with Status Pills & Search */}
      <Reveal direction="up" distance={12} duration={0.4} className="mb-5">
        <div className="bg-white border border-neutral-200/90 rounded-xl p-4 shadow-2xs">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setPage(1);
            }}
            searchPlaceholder="Search samples by reference, buyer, company, AWB, or commodity..."
            statusOptions={statusOptions}
            selectedStatus={selectedStatus}
            onStatusChange={(status) => {
              setSelectedStatus(status);
              setPage(1);
            }}
            onClear={() => {
              setSearchQuery('');
              setSelectedStatus('all');
              setPage(1);
            }}
          />
        </div>
      </Reveal>

      {/* Main DataTable */}
      <Reveal direction="up" distance={20} duration={0.5}>
        <div className="bg-white border border-neutral-200/90 rounded-xl shadow-subtle overflow-hidden">
          {isLoading ? (
            <AdminSkeleton variant="table" rows={6} className="p-4" />
          ) : (
            <DataTable
              columns={columns}
              data={sampleData?.samples || []}
              keyField="referenceNo"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              page={page}
              totalPages={sampleData?.meta?.pages || 1}
              totalCount={sampleData?.meta?.total || 0}
              onPageChange={setPage}
              onRowClick={(row) => setSelectedSampleId(row.id || row._id)}
              emptyMessage="No evaluation samples match the selected filter criteria."
            />
          )}
        </div>
      </Reveal>

      {/* Slide-over Inspection Drawer */}
      <AdminDrawer
        isOpen={!!selectedSampleId}
        onClose={() => setSelectedSampleId(null)}
        title={activeSample?.referenceNo || 'Loading Sample Dossier...'}
        subtitle={`Evaluation Sample • Requested ${
          activeSample ? new Date(activeSample.createdAt).toLocaleDateString() : ''
        }`}
        badge={activeSample && <AdminStatusBadge status={activeSample.status} />}
        tabs={
          activeSample && (
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl border border-neutral-200/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDrawerTab('overview')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                  drawerTab === 'overview'
                    ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Sample Specs
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('dispatch')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  drawerTab === 'dispatch'
                    ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-neutral-700" />
                <span>Dispatch & AWB</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('documents')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  drawerTab === 'documents'
                    ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 text-neutral-700" />
                <span>COA & SDS ({activeSample.documents?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('pipeline')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                  drawerTab === 'pipeline'
                    ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Status & Notes
              </button>
            </div>
          )
        }
        maxWidth="max-w-2xl"
      >
        {detailLoading || !activeSample ? (
          <div className="py-20 text-center text-neutral-500 flex flex-col items-center justify-center space-y-3">
            <div className="w-7 h-7 border-2 border-primary-800 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Fetching sample dossier details...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Action Pill Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
              <div className="flex items-center gap-2">
                {activeSample.buyer?.email && (
                  <a
                    href={`mailto:${activeSample.buyer.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-800 hover:bg-primary-900 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Buyer</span>
                  </a>
                )}
                {activeSample.trackingUrl && (
                  <a
                    href={activeSample.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Live Tracking</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-neutral-400">Courier:</span>
                <strong className="text-primary-900 font-bold bg-white px-2 py-0.5 rounded border border-neutral-200">
                  {activeSample.courier || activeSample.courierAccount?.provider || 'DHL'}
                </strong>
              </div>
            </div>

            {/* TAB 1: Sample Specs & Shipping Address */}
            {drawerTab === 'overview' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Requested Commodities */}
                <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-3">
                  <h3 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary-800" />
                    <span>Requested Sample Products</span>
                  </h3>

                  {activeSample.products?.length > 0 ? (
                    <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden">
                      {activeSample.products.map((item, idx) => (
                        <div key={idx} className="p-3 text-xs flex items-center justify-between bg-neutral-50/50">
                          <div>
                            <div className="font-bold text-neutral-900 text-sm">{item.productName}</div>
                            {item.grade && (
                              <div className="text-neutral-500 text-[11px] mt-0.5">Grade: {item.grade}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-primary-900 text-sm">
                              {item.qty || '250g'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 italic py-2">No product list attached.</p>
                  )}

                  {activeSample.testingParameters && (
                    <div className="mt-3 p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-700 leading-relaxed">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                        Buyer Testing & Evaluation Parameters:
                      </span>
                      {activeSample.testingParameters}
                    </div>
                  )}
                </div>

                {/* Shipping Destination Address */}
                <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-4">
                  <h3 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-800" />
                    <span>Laboratory Shipping Address</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Contact Person</span>
                      <strong className="text-neutral-900 text-sm">{activeSample.buyer?.name}</strong>
                      <span className="text-neutral-500 block text-xs mt-0.5">{activeSample.buyer?.company}</span>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Recipient Phone</span>
                      <strong className="text-neutral-900 font-mono text-sm">
                        {activeSample.buyer?.phone || 'Not provided'}
                      </strong>
                    </div>

                    <div className="col-span-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">
                        Physical Delivery Address
                      </span>
                      <div className="font-medium text-neutral-900 leading-relaxed">
                        {activeSample.shippingAddress?.street || 'Address on file'}
                        <br />
                        {[
                          activeSample.shippingAddress?.city,
                          activeSample.shippingAddress?.state,
                          activeSample.shippingAddress?.postalCode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                        <br />
                        <strong className="text-primary-900">
                          {activeSample.shippingAddress?.country || activeSample.buyer?.country}
                        </strong>
                      </div>
                    </div>

                    {activeSample.courierAccount?.accountNumber && (
                      <div className="col-span-2 p-3 bg-sky-50 rounded-lg border border-sky-200 text-sky-950">
                        <span className="text-[10px] uppercase font-bold block mb-0.5">
                          Buyer Courier Billing Account:
                        </span>
                        <span>
                          Carrier: <strong>{activeSample.courierAccount.provider}</strong> • Account No:{' '}
                          <strong className="font-mono">{activeSample.courierAccount.accountNumber}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Dispatch & AWB Tracker */}
            {drawerTab === 'dispatch' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-primary-800" />
                      <span>Courier Dispatch & Live AWB Tracking</span>
                    </h3>
                    {activeSample.dispatchedAt && (
                      <span className="text-[11px] font-mono text-neutral-500">
                        Dispatched: {new Date(activeSample.dispatchedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {feedbackMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">{feedbackMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleDispatchSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                          Courier Service
                        </label>
                        <select
                          value={dispatchCourier}
                          onChange={(e) => setDispatchCourier(e.target.value)}
                          className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-800 focus:bg-white font-medium text-neutral-800"
                        >
                          <option value="DHL">DHL Express Worldwide</option>
                          <option value="FedEx">FedEx International Priority</option>
                          <option value="UPS">UPS Worldwide Express</option>
                          <option value="Aramex">Aramex International</option>
                          <option value="India Post">India Post Speed Post</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                          Air Waybill (AWB) Number
                        </label>
                        <input
                          type="text"
                          required
                          value={dispatchAwb}
                          onChange={(e) => setDispatchAwb(e.target.value)}
                          placeholder="e.g. 9842109845"
                          className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-800 focus:bg-white font-mono text-neutral-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                        Custom Tracking URL (Auto-Generated if Empty)
                      </label>
                      <input
                        type="url"
                        value={dispatchTrackingUrl}
                        onChange={(e) => setDispatchTrackingUrl(e.target.value)}
                        placeholder="Leave blank for automatic courier portal tracking link"
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-800 focus:bg-white text-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                        Estimated Laboratory Delivery Date
                      </label>
                      <input
                        type="date"
                        value={dispatchEstDelivery}
                        onChange={(e) => setDispatchEstDelivery(e.target.value)}
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-800 focus:bg-white text-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                        Dispatch Notes (Batch / Seal details)
                      </label>
                      <textarea
                        rows={2}
                        value={dispatchNote}
                        onChange={(e) => setDispatchNote(e.target.value)}
                        placeholder="e.g. Sample package handed to DHL Surat courier. Nitrogen vacuum sealed..."
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-800 focus:bg-white text-neutral-800"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      loading={dispatchMutation.isPending}
                      className="w-full text-xs py-2.5 font-semibold flex items-center justify-center gap-2"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Confirm Dispatch & Generate Live Tracking</span>
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 3: Technical Compliance Documents (COA & SDS) */}
            {drawerTab === 'documents' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-4">
                  <h3 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-primary-800" />
                    <span>Technical Compliance Documents (COA / SDS)</span>
                  </h3>

                  {feedbackMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">{feedbackMsg}</span>
                    </div>
                  )}

                  {/* Document List */}
                  {activeSample.documents?.length > 0 ? (
                    <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden">
                      {activeSample.documents.map((doc, idx) => (
                        <div key={idx} className="p-3 text-xs flex items-center justify-between bg-neutral-50/50">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary-100 text-primary-900 border border-primary-200">
                              {doc.type}
                            </span>
                            <div>
                              <div className="font-semibold text-neutral-900">{doc.name}</div>
                              <div className="text-neutral-400 text-[10px]">
                                Attached {new Date(doc.uploadedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary-800 hover:text-primary-900 hover:bg-neutral-100 rounded border border-neutral-200"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 italic py-2">
                      No technical specification documents attached yet.
                    </p>
                  )}

                  {/* Add Document Form */}
                  <form onSubmit={handleDocumentSubmit} className="pt-3 border-t border-neutral-100 space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block">
                      Attach Technical Certificate
                    </span>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">
                          Document Type
                        </label>
                        <select
                          value={docType}
                          onChange={(e) => setDocType(e.target.value)}
                          className="w-full text-xs p-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                        >
                          <option value="COA">COA (Analysis)</option>
                          <option value="SDS">SDS (Safety)</option>
                          <option value="TDS">TDS (Technical)</option>
                          <option value="OTHER">Other Compliance</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">
                          Certificate Title
                        </label>
                        <input
                          type="text"
                          required
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          placeholder="e.g. Batch COA - Ashwagandha 5%"
                          className="w-full text-xs p-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">
                        Document File URL / CDN Path
                      </label>
                      <input
                        type="url"
                        required
                        value={docUrl}
                        onChange={(e) => setDocUrl(e.target.value)}
                        placeholder="https://cdn.jhsglobal.com/specs/..."
                        className="w-full text-xs p-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="secondary"
                      loading={documentMutation.isPending}
                      className="w-full text-xs py-2 font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Attach Technical Document</span>
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 4: Status & Notes */}
            {drawerTab === 'pipeline' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-800" />
                    <span>Sample Pipeline Lifecycle Stage</span>
                  </h3>

                  {feedbackMsg && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">{feedbackMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                        Current Lifecycle Stage
                      </label>
                      <select
                        value={pipelineStatus}
                        onChange={(e) => setPipelineStatus(e.target.value)}
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-800 focus:bg-white capitalize font-medium text-neutral-800"
                      >
                        {statusOptions
                          .filter((o) => o.id !== 'all')
                          .map((o) => (
                            <option key={o.id} value={o.id} className="capitalize">
                              {o.label}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                        Add Staff Internal Note
                      </label>
                      <textarea
                        rows={3}
                        value={pipelineNote}
                        onChange={(e) => setPipelineNote(e.target.value)}
                        placeholder="Log laboratory test progress, customs clearance status, or buyer feedback..."
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-800 focus:bg-white text-neutral-800"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      loading={updateMutation.isPending}
                      className="w-full text-xs py-2.5 font-semibold"
                    >
                      Update Sample Status & Notes
                    </Button>
                  </form>
                </div>

                {/* Audit Trail of Notes */}
                <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-3">
                  <h3 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary-800" />
                    <span>Sample Dispatch Notes & Audit Trail</span>
                  </h3>

                  {activeSample.notes?.length > 0 ? (
                    <div className="space-y-2.5">
                      {activeSample.notes.map((n, i) => (
                        <div key={i} className="text-xs p-3 rounded-lg bg-neutral-50 border border-neutral-200/80">
                          <div className="flex items-center justify-between text-neutral-500 text-[10px] mb-1">
                            <strong className="text-neutral-800">{n.by}</strong>
                            <span className="font-mono">{new Date(n.at).toLocaleString()}</span>
                          </div>
                          <p className="text-neutral-700">{n.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 italic">No dispatch notes logged yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </AdminDrawer>
    </>
  );
};

export default Samples;
