import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PackageCheck,
  Ship,
  FileCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  X,
  ExternalLink,
  UploadCloud,
  Trash2,
  Anchor,
  FileText,
  AlertCircle,
  TrendingUp,
  MapPin,
  Calendar,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import {
  fetchAdminOrders,
  fetchAdminOrderById,
  createAdminOrder,
  updateAdminOrderStatus,
  updateAdminShipmentDetails,
  addAdminOrderDocument,
  removeAdminOrderDocument,
} from '../api';
import Button from '../../components/ui/Button';
import AdminStatusBadge from '../components/AdminStatusBadge';
import AdminTableShell from '../components/AdminTableShell';
import AdminDrawer from '../components/AdminDrawer';
import Reveal from '../../components/ui/Reveal';

export const Orders = () => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Shipment Form State
  const [shipmentForm, setShipmentForm] = useState({
    containerNumber: '',
    shippingLine: 'Maersk Line',
    portOfLoading: 'Mundra Port (INMUN1)',
    portOfDischarge: '',
    etd: '',
    eta: '',
    billOfLadingNumber: '',
    trackingUrl: '',
    shippingStatus: 'booked',
  });

  // Document Upload State
  const [docForm, setDocForm] = useState({
    documentType: 'Commercial Invoice',
    documentNumber: '',
    fileName: '',
    fileUrl: '',
  });

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['admin-orders', selectedStatus, searchQuery],
    queryFn: () =>
      fetchAdminOrders({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        q: searchQuery.trim() || undefined,
        limit: 50,
      }),
  });

  const { data: activeOrder, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-order-detail', selectedOrderId],
    queryFn: () => fetchAdminOrderById(selectedOrderId),
    enabled: !!selectedOrderId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, orderStatus }) => updateAdminOrderStatus(id, { orderStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      queryClient.invalidateQueries(['admin-order-detail', selectedOrderId]);
      setFeedback('Order status progressed successfully');
      setTimeout(() => setFeedback(''), 4000);
    },
  });

  const updateShipmentMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminShipmentDetails(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      queryClient.invalidateQueries(['admin-order-detail', selectedOrderId]);
      setShipmentModalOpen(false);
      setFeedback('Maritime shipment parameters updated');
      setTimeout(() => setFeedback(''), 4000);
    },
  });

  const addDocMutation = useMutation({
    mutationFn: ({ id, data }) => addAdminOrderDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-order-detail', selectedOrderId]);
      setDocModalOpen(false);
      setDocForm({
        documentType: 'Commercial Invoice',
        documentNumber: '',
        fileName: '',
        fileUrl: '',
      });
      setFeedback('Export document attached to vault');
      setTimeout(() => setFeedback(''), 4000);
    },
  });

  const removeDocMutation = useMutation({
    mutationFn: ({ orderId, docId }) => removeAdminOrderDocument(orderId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-order-detail', selectedOrderId]);
      setFeedback('Document removed from repository');
      setTimeout(() => setFeedback(''), 4000);
    },
  });

  const orders = orderData?.orders || [];

  const handleOpenShipmentModal = () => {
    if (activeOrder?.shipment) {
      setShipmentForm({
        containerNumber: activeOrder.shipment.containerNumber || '',
        shippingLine: activeOrder.shipment.shippingLine || 'Maersk Line',
        portOfLoading: activeOrder.shipment.portOfLoading || 'Mundra Port (INMUN1)',
        portOfDischarge: activeOrder.shipment.portOfDischarge || activeOrder.destinationPort || '',
        etd: activeOrder.shipment.etd ? new Date(activeOrder.shipment.etd).toISOString().split('T')[0] : '',
        eta: activeOrder.shipment.eta ? new Date(activeOrder.shipment.eta).toISOString().split('T')[0] : '',
        billOfLadingNumber: activeOrder.shipment.billOfLadingNumber || '',
        trackingUrl: activeOrder.shipment.trackingUrl || '',
        shippingStatus: activeOrder.shipment.shippingStatus || 'booked',
      });
    }
    setShipmentModalOpen(true);
  };

  const statusOptions = [
    'all',
    'confirmed',
    'processing',
    'ready_for_shipment',
    'shipped',
    'in_transit',
    'delivered',
    'completed',
  ];

  return (
    <>
      <Helmet>
        <title>Export Orders & Maritime Shipments — Admin Suite</title>
      </Helmet>

      {/* Header */}
      <Reveal direction="up" distance={16} duration={0.5}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold mb-2">
              <Ship className="w-3.5 h-3.5 text-neutral-900" />
              <span>OCEAN FREIGHT LOGISTICS & CONTAINER TRACKER</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Export Consignments & Ocean Logistics
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
              Live container tracking from Mundra Port / JNPT, stuffing certifications, Bill of Lading clearance, and international shipping documents.
            </p>
          </div>
        </div>
      </Reveal>

      {feedback && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{feedback}</span>
        </div>
      )}

      {/* Status Segmented Tabs */}
      <Reveal direction="up" distance={12} duration={0.4} delay={0.05}>
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-neutral-200/90 rounded-xl shadow-2xs mb-5 overflow-x-auto">
          {statusOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelectedStatus(opt)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide capitalize transition-all whitespace-nowrap ${
                selectedStatus === opt
                  ? 'bg-primary-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
              }`}
            >
              {opt === 'all' ? 'All Consignments' : opt.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Orders High-Density Table */}
      <Reveal direction="up" distance={20} duration={0.5} delay={0.08}>
        <AdminTableShell
          title="Active Consignment Register"
        description="Containerized export bookings under processing, port stuffing, or high seas navigation"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by Order ID, Buyer Company, Container #, or BL #..."
        totalCount={orders.length}
        loading={isLoading}
        empty={orders.length === 0}
        emptyMessage="No export consignments match the selected filters."
      >
        <table className="min-w-full divide-y divide-neutral-200 text-left text-xs">
          <thead className="bg-neutral-50/90 text-neutral-600 font-semibold border-b border-neutral-200">
            <tr>
              <th className="px-5 py-3">Consignment ID</th>
              <th className="px-5 py-3">Buyer / Consignee</th>
              <th className="px-5 py-3">Commodities</th>
              <th className="px-5 py-3">Total Value</th>
              <th className="px-5 py-3">Incoterm & Port</th>
              <th className="px-5 py-3">Container / Carrier</th>
              <th className="px-5 py-3">Consignment Stage</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-700 bg-white">
            {orders.map((ord) => (
              <tr
                key={ord._id}
                onClick={() => setSelectedOrderId(ord._id)}
                className={`transition-colors cursor-pointer ${
                  selectedOrderId === ord._id
                    ? 'bg-primary-50/80 font-medium border-l-4 border-l-primary-800'
                    : 'hover:bg-neutral-50/80'
                }`}
              >
                <td className="px-5 py-4 font-mono font-bold text-primary-900 whitespace-nowrap">
                  {ord.orderNumber}
                </td>
                <td className="px-5 py-4">
                  <div className="font-semibold text-neutral-900">{ord.buyer?.company}</div>
                  <div className="text-neutral-500 text-[11px]">{ord.buyer?.country}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="max-w-xs truncate text-neutral-700">
                    {ord.products?.map((p) => `${p.productName} (${p.quantity} ${p.unit})`).join(', ')}
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-neutral-900">
                  {ord.currency} {Number(ord.totalAmount).toLocaleString()}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="font-mono font-bold text-neutral-900">{ord.incoterm}</span>
                  <span className="text-neutral-500 text-[11px] block">{ord.destinationPort}</span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  {ord.shipment?.containerNumber ? (
                    <div>
                      <span className="font-mono font-bold text-neutral-800 text-xs">
                        {ord.shipment.containerNumber}
                      </span>
                      <span className="text-neutral-500 block text-[10px]">
                        {ord.shipment.shippingLine}
                      </span>
                    </div>
                  ) : (
                    <span className="text-neutral-400 italic text-[11px]">Booking in Progress</span>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <AdminStatusBadge status={ord.orderStatus} />
                </td>
                <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedOrderId(ord._id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary-800 bg-primary-50 hover:bg-primary-100 rounded-md border border-primary-200/80 transition-colors"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>
      </Reveal>

      {/* Consignment Slide-over Drawer using AdminDrawer */}
      <AdminDrawer
        isOpen={!!selectedOrderId && !!activeOrder}
        onClose={() => setSelectedOrderId(null)}
        title={activeOrder?.orderNumber || 'Consignment Dossier'}
        subtitle={`Export Shipping File • ${activeOrder ? activeOrder.buyer?.company : ''}`}
        badge={activeOrder && <AdminStatusBadge status={activeOrder.orderStatus} />}
        maxWidth="max-w-2xl"
      >
        {activeOrder && (
          <div className="space-y-6 text-xs">
            {/* Consignment Stage Selector */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/90 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">
                  Lifecycle Stage Progression
                </span>
                <select
                  value={activeOrder.orderStatus}
                  onChange={(e) =>
                    updateStatusMutation.mutate({ id: activeOrder._id, orderStatus: e.target.value })
                  }
                  className="font-semibold text-xs p-2 bg-white border border-neutral-300 rounded-lg capitalize text-neutral-800 focus:ring-2 focus:ring-primary-800"
                >
                  {[
                    'confirmed',
                    'processing',
                    'ready_for_shipment',
                    'shipped',
                    'in_transit',
                    'delivered',
                    'completed',
                    'cancelled',
                  ].map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total Consignment Value</span>
                <span className="font-mono text-base font-bold text-primary-900">
                  {activeOrder.currency} {Number(activeOrder.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Maritime Milestone Stepper */}
            <div className="bg-white border border-neutral-200/90 rounded-xl p-4 shadow-2xs space-y-3">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                Consignment Maritime Milestone
              </span>
              <div className="flex items-center justify-between relative px-2">
                <div className="absolute top-3 left-6 right-6 h-0.5 bg-neutral-200 -z-0" />
                {[
                  { label: 'Booking', key: 0 },
                  { label: 'Stuffing & QC', key: 1 },
                  { label: 'Port Load', key: 2 },
                  { label: 'High Seas', key: 3 },
                  { label: 'Discharge', key: 4 },
                ].map((step) => {
                  const s = String(activeOrder.orderStatus || '').toLowerCase();
                  let currentStep = 0;
                  if (['delivered', 'completed'].includes(s)) currentStep = 4;
                  else if (['in_transit'].includes(s)) currentStep = 3;
                  else if (['shipped'].includes(s)) currentStep = 2;
                  else if (['processing', 'ready_for_shipment'].includes(s)) currentStep = 1;

                  const isDone = currentStep > step.key;
                  const isCurrent = currentStep === step.key;

                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center text-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all ${
                          isCurrent
                            ? 'bg-primary-700 text-white ring-4 ring-primary-600/25 shadow-xs'
                            : isDone
                            ? 'bg-primary-800 text-white shadow-xs'
                            : 'bg-neutral-200 text-neutral-500'
                        }`}
                      >
                        {isDone ? '✓' : step.key + 1}
                      </div>
                      <span
                        className={`text-[10px] mt-1.5 font-semibold leading-tight max-w-[68px] ${
                          isCurrent
                            ? 'text-neutral-900 font-bold'
                            : isDone
                            ? 'text-primary-900'
                            : 'text-neutral-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Maritime Shipment Tracking Details */}
            <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Ship className="w-4 h-4 text-primary-800" />
                  <span>Maritime Container & B/L Intelligence</span>
                </h3>
                <button
                  onClick={handleOpenShipmentModal}
                  className="px-3 py-1 rounded-md bg-primary-50 text-primary-800 hover:bg-primary-100 font-bold text-xs border border-primary-200/70 transition-colors"
                >
                  Edit Shipment Parameters
                </button>
              </div>

              {activeOrder.shipment?.containerNumber ? (
                <div className="grid grid-cols-2 gap-3.5 bg-neutral-50/70 p-4 rounded-xl border border-neutral-200 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Container Number</span>
                    <strong className="font-mono text-neutral-900 text-sm">{activeOrder.shipment.containerNumber}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Shipping Line</span>
                    <strong className="text-neutral-900 text-sm">{activeOrder.shipment.shippingLine}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Port of Loading</span>
                    <span className="text-neutral-800 font-medium">{activeOrder.shipment.portOfLoading}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Port of Discharge</span>
                    <span className="text-neutral-800 font-medium">{activeOrder.shipment.portOfDischarge}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">ETD Departure</span>
                    <span className="font-mono text-neutral-800">
                      {activeOrder.shipment.etd ? new Date(activeOrder.shipment.etd).toLocaleDateString() : 'Scheduled'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">ETA Discharge</span>
                    <span className="font-mono text-neutral-800">
                      {activeOrder.shipment.eta ? new Date(activeOrder.shipment.eta).toLocaleDateString() : 'Pending'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Bill of Lading (B/L)</span>
                    <strong className="font-mono text-neutral-900">{activeOrder.shipment.billOfLadingNumber || 'Under issuance'}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Transit Status</span>
                    <span className="capitalize font-bold text-emerald-700">{activeOrder.shipment.shippingStatus}</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50 text-neutral-500 text-xs">
                  <Anchor className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                  <p className="font-semibold text-neutral-800">No container booking assigned yet.</p>
                  <p className="text-neutral-400 mt-0.5">Click "Edit Shipment Parameters" to input container code and sailing dates.</p>
                </div>
              )}
            </div>

            {/* Official Export Compliance Documents */}
            <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-primary-800" />
                  <span>Official Export Document Repository</span>
                </h3>
                <button
                  onClick={() => setDocModalOpen(true)}
                  className="px-3 py-1 rounded-md bg-neutral-900 text-white hover:bg-black font-bold text-xs border border-neutral-800 transition-colors"
                >
                  + Attach File
                </button>
              </div>

              {activeOrder.documents?.length > 0 ? (
                <div className="space-y-2">
                  {activeOrder.documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-primary-800 shrink-0" />
                        <div>
                          <strong className="text-neutral-900 block">{doc.documentType}</strong>
                          <span className="text-neutral-500 text-[11px]">
                            {doc.documentNumber ? `Ref: ${doc.documentNumber} • ` : ''}
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-primary-800 hover:text-primary-900 rounded hover:bg-neutral-200/60"
                          title="View Document"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => removeDocMutation.mutate({ orderId: activeOrder._id, docId: doc._id })}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50"
                          title="Remove Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-400 italic text-xs py-2">
                  No export compliance documents attached (Commercial Invoice, Phyto, COA, B/L).
                </p>
              )}
            </div>
          </div>
        )}
      </AdminDrawer>

      {/* Edit Shipment Parameters Modal */}
      {shipmentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-neutral-200 transform-gpu animate-in zoom-in-95 duration-200 [transition-timing-function:var(--ease-enter)]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
              <h3 className="font-serif text-base font-bold text-neutral-900">
                Update Container & Maritime Sailing
              </h3>
              <button
                onClick={() => setShipmentModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateShipmentMutation.mutate({ id: activeOrder._id, data: shipmentForm });
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Container Number</label>
                  <input
                    type="text"
                    value={shipmentForm.containerNumber}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, containerNumber: e.target.value })}
                    placeholder="e.g. MSKU-7892341"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Shipping Line</label>
                  <input
                    type="text"
                    value={shipmentForm.shippingLine}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, shippingLine: e.target.value })}
                    placeholder="e.g. Maersk / MSC / CMA CGM"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Port of Loading</label>
                  <input
                    type="text"
                    value={shipmentForm.portOfLoading}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, portOfLoading: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Port of Discharge</label>
                  <input
                    type="text"
                    value={shipmentForm.portOfDischarge}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, portOfDischarge: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">ETD (Sailing Date)</label>
                  <input
                    type="date"
                    value={shipmentForm.etd}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, etd: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">ETA (Discharge Date)</label>
                  <input
                    type="date"
                    value={shipmentForm.eta}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, eta: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Bill of Lading (B/L) Number</label>
                <input
                  type="text"
                  value={shipmentForm.billOfLadingNumber}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, billOfLadingNumber: e.target.value })}
                  placeholder="e.g. MEDUWA891278"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShipmentModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={updateShipmentMutation.isPending}
                >
                  Save Parameters
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-neutral-200 transform-gpu animate-in zoom-in-95 duration-200 [transition-timing-function:var(--ease-enter)]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
              <h3 className="font-serif text-base font-bold text-neutral-900">
                Attach Official Export Document
              </h3>
              <button onClick={() => setDocModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addDocMutation.mutate({ id: activeOrder._id, data: docForm });
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Document Type *</label>
                <select
                  value={docForm.documentType}
                  onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                >
                  <option value="Commercial Invoice">Commercial Invoice</option>
                  <option value="Packing List">Packing List</option>
                  <option value="Bill of Lading">Bill of Lading (B/L)</option>
                  <option value="Certificate of Origin">Certificate of Origin (COO)</option>
                  <option value="Phytosanitary Certificate">Phytosanitary Certificate</option>
                  <option value="Certificate of Analysis">NABL Certificate of Analysis (COA)</option>
                  <option value="Fumigation Certificate">Fumigation Certificate</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Document Reference Number</label>
                <input
                  type="text"
                  value={docForm.documentNumber}
                  onChange={(e) => setDocForm({ ...docForm, documentNumber: e.target.value })}
                  placeholder="e.g. COO-2026-98124"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">File Storage URL / Download Link *</label>
                <input
                  type="url"
                  required
                  value={docForm.fileUrl}
                  onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDocModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={addDocMutation.isPending}
                >
                  Attach to Vault
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;
