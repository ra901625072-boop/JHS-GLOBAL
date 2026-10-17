import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Inbox,
  Clock,
  MessageSquare,
  AlertCircle,
  Phone,
  Mail,
  Building,
  Tag,
  Sparkles,
  Bot,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Eye,
  Send,
  Ban,
  ShieldAlert,
} from 'lucide-react';
import {
  fetchAdminInquiries,
  fetchAdminInquiryById,
  updateAdminInquiryStatus,
  sendAdminInquiryReply,
  runInquiryAiSummarize,
  generateInquiryAiReplyDraft,
  flagAdminInquirySpam,
  unspamAdminInquiry,
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

export const Inquiries = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedInquiryId, setSelectedInquiryId] = useState(searchParams.get('id') || null);
  const [drawerTab, setDrawerTab] = useState('overview'); // 'overview' | 'reply' | 'pipeline'
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Status & Note state for drawer
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [noteText, setNoteText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Spam action state
  const [showSpamDialog, setShowSpamDialog] = useState(false);
  const [spamReason, setSpamReason] = useState('');

  // AI Reply Draft editable state
  const [replySubject, setReplySubject] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyInstructions, setReplyInstructions] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Fetch Inquiries List
  const { data: inquiryData, isLoading } = useQuery({
    queryKey: ['admin-inquiries', selectedStatus, searchQuery, page],
    queryFn: () =>
      fetchAdminInquiries({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        q: searchQuery.trim() || undefined,
        page,
        limit: 25,
      }),
  });

  // Fetch Selected Inquiry Details
  const { data: activeInquiry, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-inquiry-detail', selectedInquiryId],
    queryFn: () => fetchAdminInquiryById(selectedInquiryId),
    enabled: !!selectedInquiryId,
  });

  useEffect(() => {
    if (activeInquiry) {
      setNewStatus(activeInquiry.status);
      setNewPriority(activeInquiry.priority);
      setNoteText('');
      setFeedbackMsg('');
      setReplySubject(
        activeInquiry.ai?.replySubject ||
          `Commercial Quotation & Export Response [Ref: ${activeInquiry.referenceNo}] — JHS GLOBAL`
      );
      setReplyText(activeInquiry.ai?.suggestedReply || activeInquiry.ai?.draftReply || '');
      setReplyInstructions('');
      setDrawerTab('overview');
      setShowSpamDialog(false);
    }
  }, [activeInquiry]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminInquiryStatus(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries(['admin-inquiries']);
      queryClient.invalidateQueries(['admin-inquiry-detail', updated.id || updated._id]);
      queryClient.invalidateQueries(['admin-dashboard']);
      setFeedbackMsg('Inquiry updated successfully');
      setNoteText('');
      setTimeout(() => setFeedbackMsg(''), 4000);
    },
  });

  const summarizeMutation = useMutation({
    mutationFn: (id) => runInquiryAiSummarize(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-inquiry-detail', selectedInquiryId]);
      queryClient.invalidateQueries(['admin-inquiries']);
      setFeedbackMsg('AI Lead Scoring & Analysis refreshed');
      setTimeout(() => setFeedbackMsg(''), 4000);
    },
  });

  const replyDraftMutation = useMutation({
    mutationFn: ({ id, options }) => generateInquiryAiReplyDraft(id, options),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['admin-inquiry-detail', selectedInquiryId]);
      if (data?.subject) setReplySubject(data.subject);
      if (data?.suggestedReply) setReplyText(data.suggestedReply);
      setFeedbackMsg('AI Sales Reply Draft regenerated');
      setTimeout(() => setFeedbackMsg(''), 4000);
    },
    onError: (err) => {
      setFeedbackMsg(`Failed to regenerate draft: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setFeedbackMsg(''), 5000);
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: ({ id, data }) => sendAdminInquiryReply(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-inquiry-detail', selectedInquiryId]);
      queryClient.invalidateQueries(['admin-inquiries']);
      queryClient.invalidateQueries(['admin-dashboard']);
      setFeedbackMsg('Official commercial reply approved and dispatched to buyer!');
      setTimeout(() => setFeedbackMsg(''), 5000);
    },
    onError: (err) => {
      setFeedbackMsg(`Failed to send reply: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setFeedbackMsg(''), 5000);
    },
  });

  const spamMutation = useMutation({
    mutationFn: ({ id, reason }) => flagAdminInquirySpam(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-inquiries']);
      queryClient.invalidateQueries(['admin-inquiry-detail', selectedInquiryId]);
      queryClient.invalidateQueries(['admin-dashboard']);
      setShowSpamDialog(false);
      setSelectedInquiryId(null);
      setFeedbackMsg('Lead flagged as spam and removed from active inbox');
      setTimeout(() => setFeedbackMsg(''), 4000);
    },
    onError: (err) => {
      setFeedbackMsg(`Spam action failed: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setFeedbackMsg(''), 5000);
    },
  });

  const unspamMutation = useMutation({
    mutationFn: (id) => unspamAdminInquiry(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-inquiries']);
      queryClient.invalidateQueries(['admin-inquiry-detail', selectedInquiryId]);
      queryClient.invalidateQueries(['admin-dashboard']);
      setFeedbackMsg('Lead restored from spam to active inbox');
      setTimeout(() => setFeedbackMsg(''), 4000);
    },
  });

  const handleCopyDraft = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!selectedInquiryId) return;

    updateMutation.mutate({
      id: selectedInquiryId,
      data: {
        status: newStatus,
        priority: newPriority,
        note: noteText.trim() || undefined,
      },
    });
  };

  const statusOptions = [
    { id: 'all', label: 'All Active RFQs' },
    { id: 'new', label: 'New / Unreviewed' },
    { id: 'in_review', label: 'Under Review' },
    { id: 'quoted', label: 'Quoted' },
    { id: 'sample_sent', label: 'Sample Sent' },
    { id: 'negotiation', label: 'Negotiation' },
    { id: 'won', label: 'Won / Confirmed' },
    { id: 'lost', label: 'Lost' },
    { id: 'spam', label: 'Spam' },
  ];

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'referenceNo',
        label: 'Reference No',
        sortable: true,
        headerClassName: 'w-36',
        render: (_, row) => (
          <span className="font-mono font-bold text-primary-900">{row.referenceNo}</span>
        ),
      },
      {
        key: 'buyer',
        label: 'Buyer & Company',
        sortable: false,
        render: (_, row) => (
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
        render: (_, row) => (
          <span className="font-medium text-neutral-800">{row.buyer?.country || 'International'}</span>
        ),
      },
      {
        key: 'items',
        label: 'Commodities & Volume',
        sortable: false,
        render: (_, row) =>
          row.items?.length > 0 ? (
            <div className="max-w-xs truncate text-neutral-700">
              {row.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
            </div>
          ) : (
            <span className="text-neutral-400 italic">Custom specification request</span>
          ),
      },
      {
        key: 'priority',
        label: 'Priority / Score',
        sortable: false,
        render: (_, row) => (
          <div className="flex items-center gap-1.5">
            <AdminStatusBadge priority={row.priority} />
            {row.ai?.leadScore != null && (
              <span
                className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[10px] font-mono font-bold border border-neutral-200"
                title="AI Lead Intent Score (0-100)"
              >
                {row.ai.leadScore}/100
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: false,
        render: (_, row) => <AdminStatusBadge status={row.status} />,
      },
      {
        key: 'sla',
        label: '48H SLA Timer',
        sortable: false,
        render: (_, row) => (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
              row.slaStatus === 'resolved'
                ? 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                : row.slaStatus === 'breached'
                ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                : row.slaStatus === 'critical'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                : row.slaStatus === 'warning'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>
              {row.slaStatus === 'resolved'
                ? 'Resolved'
                : row.slaStatus === 'breached'
                ? 'Breached'
                : `${row.slaRemainingHours ?? '--'}h rem`}
            </span>
          </span>
        ),
      },
      {
        key: 'createdAt',
        label: 'Received',
        sortable: true,
        render: (_, row) => (
          <span className="font-mono text-neutral-500 text-[11px]">
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Action',
        headerClassName: 'text-right',
        render: (_, row) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedInquiryId(row.id || row._id);
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
        <title>Overseas RFQs & Inquiries Desk — JHS GLOBAL</title>
      </Helmet>

      {/* Page Header */}
      <Reveal direction="up" distance={16} duration={0.5} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold mb-2">
              <Inbox className="w-3.5 h-3.5 text-neutral-900" />
              <span>GLOBAL BUYER INBOX • B2B LEAD QUALIFICATION</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Overseas RFQs & Procurement Inquiries
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
              Direct import inquiries, sample requests, and containerized pricing requirements captured from international buyers for JHS GLOBAL export divisions.
            </p>
          </div>
        </div>
      </Reveal>

      {/* FilterBar with Status Pills & Debounced Search */}
      <Reveal direction="up" distance={12} duration={0.4} className="mb-5">
        <div className="bg-white border border-neutral-200/90 rounded-xl p-4 shadow-2xs">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setPage(1);
            }}
            searchPlaceholder="Search by Reference No, Company, Buyer Name, Country, or Commodity..."
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
              data={inquiryData?.inquiries || []}
              keyField="referenceNo"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              page={page}
              totalPages={inquiryData?.meta?.pages || 1}
              totalCount={inquiryData?.meta?.total || 0}
              onPageChange={setPage}
              onRowClick={(row) => setSelectedInquiryId(row.id || row._id)}
              emptyMessage="No buyer inquiries match the selected criteria."
            />
          )}
        </div>
      </Reveal>

      {/* Slide-over Inspection Drawer with Tabbed Navigation */}
      <AdminDrawer
        isOpen={!!selectedInquiryId}
        onClose={() => {
          setSelectedInquiryId(null);
          setShowSpamDialog(false);
        }}
        title={activeInquiry?.referenceNo || 'Loading RFQ Dossier...'}
        subtitle={`Inbound Buyer Lead • Received ${
          activeInquiry ? new Date(activeInquiry.createdAt).toLocaleString() : ''
        }`}
        badge={activeInquiry && <AdminStatusBadge status={activeInquiry.status} />}
        tabs={
          activeInquiry && (
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
                Commercial Specs
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('reply')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  drawerTab === 'reply'
                    ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
                <span>AI Reply Desk</span>
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
                Pipeline & Notes
              </button>
            </div>
          )
        }
        maxWidth="max-w-2xl"
      >
        {detailLoading || !activeInquiry ? (
          <div className="py-20 text-center text-neutral-500 flex flex-col items-center justify-center space-y-3">
            <div className="w-7 h-7 border-2 border-primary-800 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Fetching inquiry dossier details...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Action Pill Bar with Spam Action */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
              <div className="flex items-center gap-2">
                {activeInquiry.buyer?.whatsapp && (
                  <a
                    href={`https://wa.me/${activeInquiry.buyer.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {activeInquiry.buyer?.email && (
                  <a
                    href={`mailto:${activeInquiry.buyer.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-800 hover:bg-primary-900 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Buyer</span>
                  </a>
                )}
                {activeInquiry.status === 'spam' || activeInquiry.isSpam ? (
                  <button
                    type="button"
                    onClick={() => unspamMutation.mutate(activeInquiry.id || activeInquiry._id)}
                    disabled={unspamMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{unspamMutation.isPending ? 'Restoring...' : 'Restore Lead'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSpamDialog(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-200 hover:bg-rose-100 text-neutral-700 hover:text-rose-800 text-xs font-semibold transition-colors border border-neutral-300"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Flag as Spam</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-neutral-400">Score:</span>
                <strong className="text-primary-900 font-bold bg-white px-2 py-0.5 rounded border border-neutral-200">
                  {activeInquiry.ai?.leadScore ?? 75}/100
                </strong>
              </div>
            </div>

            {/* Spam Confirmation Banner */}
            {showSpamDialog && (
              <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  <span>Flag this inquiry as SPAM?</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Flagged inquiries are excluded from commercial lead queues and SLA timers, and an audit trail is recorded.
                </p>
                <input
                  type="text"
                  value={spamReason}
                  onChange={(e) => setSpamReason(e.target.value)}
                  placeholder="Optional reason (e.g. unsolicited marketing, invalid contacts)..."
                  className="w-full text-xs p-2.5 bg-white border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSpamDialog(false)}
                    className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      spamMutation.mutate({
                        id: activeInquiry.id || activeInquiry._id,
                        reason: spamReason.trim(),
                      })
                    }
                    disabled={spamMutation.isPending}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    {spamMutation.isPending ? 'Flagging...' : 'Confirm Spam'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 1: Commercial Overview & Buyer Profile */}
            {drawerTab === 'overview' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Requested Commodities & Volume */}
                <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-3">
                  <h3 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary-800" />
                    <span>Requested Commodities & Volume</span>
                  </h3>

                  {activeInquiry.items?.length > 0 ? (
                    <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden">
                      {activeInquiry.items.map((item, idx) => (
                        <div key={idx} className="p-3 text-xs flex items-center justify-between bg-neutral-50/50">
                          <div>
                            <div className="font-bold text-neutral-900 text-sm">{item.productName}</div>
                            <div className="text-neutral-500 text-[11px] mt-0.5">
                              {item.packing ? `Packing: ${item.packing} • ` : ''}
                              {item.grade ? `Grade: ${item.grade}` : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-primary-900 text-sm">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 italic py-2">No specific line items attached.</p>
                  )}

                  {/* Incoterms & Payment terms strip */}
                  <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Incoterm</span>
                      <span className="font-bold text-neutral-900 font-mono">{activeInquiry.incoterm || 'CIF'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Payment Term</span>
                      <span className="font-bold text-neutral-900 font-mono">{activeInquiry.paymentTerm || '30% TT'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Shipment Target</span>
                      <span className="font-bold text-neutral-900">{activeInquiry.targetShipmentMonth || 'Immediate'}</span>
                    </div>
                  </div>

                  {activeInquiry.message && (
                    <div className="mt-3 p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-700 leading-relaxed">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                        Buyer Note / Specification Request:
                      </span>
                      {activeInquiry.message}
                    </div>
                  )}
                </div>

                {/* Buyer & Corporate Identity Profile */}
                <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-4">
                  <h3 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary-800" />
                    <span>Buyer Corporate Profile</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Contact Person</span>
                      <strong className="text-neutral-900 text-sm">{activeInquiry.buyer?.name}</strong>
                      {activeInquiry.buyer?.designation && (
                        <span className="text-neutral-500 block text-xs mt-0.5">{activeInquiry.buyer.designation}</span>
                      )}
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Company Name</span>
                      <strong className="text-neutral-900 text-sm">{activeInquiry.buyer?.company}</strong>
                      <span className="text-neutral-500 block text-xs mt-0.5 capitalize">
                        Buyer Category: {activeInquiry.buyer?.buyerType || 'Importer'}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Corporate Email</span>
                      <a
                        href={`mailto:${activeInquiry.buyer?.email}`}
                        className="text-primary-800 font-semibold hover:underline flex items-center gap-1.5 mt-0.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{activeInquiry.buyer?.email}</span>
                      </a>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Destination Port & Country</span>
                      <span className="text-neutral-900 font-semibold text-sm block mt-0.5">
                        {activeInquiry.destinationPort || 'Port TBD'} ({activeInquiry.buyer?.country})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI Sales Reply & Email Dispatch */}
            {drawerTab === 'reply' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* MANDATORY AI GOVERNANCE LABEL */}
                <div className="p-3 bg-amber-500/10 border border-amber-400/50 rounded-xl flex items-center gap-2.5 text-xs text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>[AI GENERATED SUGGESTION — REQUIRES HUMAN APPROVAL]:</strong> Verify commercial pricing, specifications, and shipment terms before dispatching reply to buyer.
                  </span>
                </div>

                {/* AI Lead Intelligence Card */}
                <div className="bg-gradient-to-br from-[#06180E] via-[#0A2619] to-[#04120A] text-white rounded-xl p-5 shadow-card border border-primary-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-serif text-sm font-bold text-white tracking-wide">
                          AI Lead Qualification & Scoring
                        </h3>
                        <p className="text-[10px] text-neutral-300">
                          Neural intent analysis from commodity volume & buyer signals
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => summarizeMutation.mutate(activeInquiry.id || activeInquiry._id)}
                      disabled={summarizeMutation.isPending}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                    >
                      <RotateCcw className={`w-3 h-3 ${summarizeMutation.isPending ? 'animate-spin' : ''}`} />
                      <span>{summarizeMutation.isPending ? 'Scoring...' : 'Re-Score'}</span>
                    </button>
                  </div>

                  {/* Lead Score Progress */}
                  <div className="bg-black/40 rounded-lg p-3.5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300 font-medium">Buyer Intent Quality:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {activeInquiry.ai?.leadScore ?? 75}/100
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                          {activeInquiry.ai?.priority || activeInquiry.priority || 'WARM'} Intent
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 rounded-full bg-emerald-400"
                        style={{ width: `${Math.min(100, Math.max(5, activeInquiry.ai?.leadScore || 75))}%` }}
                      />
                    </div>

                    {activeInquiry.ai?.signals?.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {activeInquiry.ai.signals.map((sig, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 text-[10px] font-medium"
                          >
                            ✓ {sig}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {activeInquiry.ai?.summary && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/5 text-xs text-neutral-200 leading-relaxed">
                      <span className="text-[10px] uppercase font-bold text-neutral-300 block mb-1 tracking-wider">
                        Executive Trade Assessment:
                      </span>
                      {activeInquiry.ai.summary}
                    </div>
                  )}

                  {/* AI Sales Reply Drafter */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-neutral-300" />
                        <span className="text-xs font-bold uppercase text-white tracking-wider">
                          Commercial Proforma Reply Drafter
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowInstructions(!showInstructions)}
                          className="text-[10px] text-neutral-300 hover:text-white px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          {showInstructions ? 'Hide Guidance' : '+ Custom Guidance'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyDraft(replyText || activeInquiry.ai?.suggestedReply)}
                          className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-neutral-200 font-medium text-[10px] flex items-center gap-1 transition-colors"
                        >
                          {copiedDraft ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-neutral-300" />
                              <span>Copy Draft</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {showInstructions && (
                      <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-400 block">
                          Custom guidance (e.g., mention 500g courier sample, CIF Rotterdam ocean transit):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyInstructions}
                            onChange={(e) => setReplyInstructions(e.target.value)}
                            placeholder="Add special commercial instructions..."
                            className="flex-1 bg-neutral-900 border border-white/10 rounded px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-white/40"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              replyDraftMutation.mutate({
                                id: activeInquiry.id || activeInquiry._id,
                                options: { customInstructions: replyInstructions.trim() || undefined },
                              })
                            }
                            disabled={replyDraftMutation.isPending}
                            className="px-3 py-1 rounded bg-white hover:bg-neutral-100 text-black font-bold text-xs"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block">
                        Subject Line
                      </label>
                      <input
                        type="text"
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-white/40 font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span className="uppercase font-bold">Quotation Response Body (Staff Editable)</span>
                        <span className="text-emerald-400 font-medium">Human Approval Required</span>
                      </div>
                      <textarea
                        rows={7}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-neutral-200 font-sans leading-relaxed focus:outline-none focus:border-white/40 resize-y whitespace-pre-wrap"
                      />
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-neutral-400">
                        Recipient: <strong className="text-white">{activeInquiry.buyer?.email}</strong>
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          sendReplyMutation.mutate({
                            id: activeInquiry.id || activeInquiry._id,
                            data: {
                              subject: replySubject.trim(),
                              message: replyText.trim(),
                              status: 'quoted',
                            },
                          })
                        }
                        disabled={sendReplyMutation.isPending || !replyText.trim()}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors active:scale-[0.98] disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Approve & Dispatch Email</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Pipeline Control & Notes History */}
            {drawerTab === 'pipeline' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Pipeline Stage & Priority Control */}
                <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-800" />
                    <span>Commercial Pipeline Stage</span>
                  </h3>

                  {feedbackMsg && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">{feedbackMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                          Pipeline Stage
                        </label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
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
                          Urgency / Priority
                        </label>
                        <select
                          value={newPriority}
                          onChange={(e) => setNewPriority(e.target.value)}
                          className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-800 focus:bg-white uppercase font-semibold text-neutral-800"
                        >
                          <option value="hot">HOT (High Intent / Urgency)</option>
                          <option value="warm">WARM (Standard Procurement)</option>
                          <option value="cold">COLD (Informational Enquiry)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                        Add Staff Follow-up Note
                      </label>
                      <textarea
                        rows={3}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Log quotation details, port freight check, or buyer conversation notes..."
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-800 focus:bg-white text-neutral-800 placeholder-neutral-400"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      loading={updateMutation.isPending}
                      className="w-full text-xs py-2.5 font-semibold"
                    >
                      Save Pipeline Status & Notes
                    </Button>
                  </form>
                </div>

                {/* Internal Audit Notes & History */}
                <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-3">
                  <h3 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary-800" />
                    <span>Internal Audit Log & Notes</span>
                  </h3>

                  {activeInquiry.notes?.length > 0 ? (
                    <div className="space-y-2.5">
                      {activeInquiry.notes.map((n, i) => (
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
                    <p className="text-xs text-neutral-400 italic">No team notes logged yet.</p>
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

export default Inquiries;
