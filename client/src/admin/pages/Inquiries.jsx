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
  AdminPageHeader,
  Tabs,
} from '../components';

export const Inquiries = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

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
          <span className="font-mono font-bold text-[var(--admin-text-primary)] tracking-tight">{row.referenceNo}</span>
        ),
      },
      {
        key: 'buyer',
        label: 'Buyer & Company',
        sortable: false,
        render: (_, row) => (
          <div>
            <div className="font-semibold text-[var(--admin-text-primary)] text-xs sm:text-sm">{row.buyer?.name}</div>
            <div className="text-[var(--admin-text-muted)] text-[11px] truncate max-w-[180px]">{row.buyer?.company}</div>
          </div>
        ),
      },
      {
        key: 'country',
        label: 'Destination',
        sortable: false,
        render: (_, row) => (
          <span className="font-medium text-[var(--admin-text-secondary)] text-xs">{row.buyer?.country || 'International'}</span>
        ),
      },
      {
        key: 'items',
        label: 'Commodities & Volume',
        sortable: false,
        render: (_, row) => (
          <div>
            {row.items?.length > 0 ? (
              <div className="max-w-xs truncate text-[var(--admin-text-secondary)] text-xs">
                {row.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
              </div>
            ) : (
              <span className="text-[var(--admin-text-placeholder)] italic text-xs">Custom specification request</span>
            )}
            {(row.needsPrivateLabel || row.needsSample) && (
              <div className="flex items-center gap-1.5 mt-1">
                {row.needsPrivateLabel && (
                  <span className="px-1.5 py-0.5 rounded-admin-sm text-[10px] font-semibold bg-[#F1F5F9] text-[#334155] border border-[var(--admin-border)]">
                    Private Label
                  </span>
                )}
                {row.needsSample && (
                  <span className="px-1.5 py-0.5 rounded-admin-sm text-[10px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B40]">
                    Sample Req.
                  </span>
                )}
              </div>
            )}
          </div>
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
                className="px-1.5 py-0.5 bg-[var(--admin-surface-subtle)] text-[var(--admin-text-primary)] rounded-admin-sm text-[10px] font-mono tabular-nums font-bold border border-[var(--admin-border)]"
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
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-admin-sm text-[11px] font-mono tabular-nums font-medium border ${
              row.slaStatus === 'resolved'
                ? 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E140]'
                : row.slaStatus === 'breached'
                ? 'bg-[#FEE2E2] text-[#991B1B] border-[#EF444440] font-bold'
                : row.slaStatus === 'critical'
                ? 'bg-[#FEE2E2] text-[#991B1B] border-[#EF444440]'
                : row.slaStatus === 'warning'
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B40]'
                : 'bg-[#D1FAE5] text-[#065F46] border-[#10B98140]'
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
          <span className="font-mono tabular-nums text-[var(--admin-text-muted)] text-xs">
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
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[var(--admin-text-primary)] bg-white hover:bg-[var(--admin-surface-subtle)] rounded-admin-md border border-[var(--admin-border)] transition-colors"
              style={{ transitionDuration: 'var(--admin-duration-micro)' }}
            >
              <Eye className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />
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

      {/* Standardized Page Header */}
      <AdminPageHeader
        breadcrumb={[
          { label: 'Admin', to: '/admin' },
          { label: 'Inquiries & RFQs' },
        ]}
        title="Overseas RFQs & Procurement Inquiries"
        description="Direct import inquiries, sample requests, and containerized pricing requirements captured from international buyers."
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--admin-text-muted)] font-medium hidden sm:inline">
              Active RFQs:{' '}
              <strong className="text-[var(--admin-text-primary)] font-mono tabular-nums">
                {inquiryData?.meta?.total || 0}
              </strong>
            </span>
          </div>
        }
      />

      {/* FilterBar Container */}
      <div className="bg-white border border-[var(--admin-border)] rounded-admin-lg p-4 mb-6">
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

      {/* Main DataTable Card */}
      <div className="bg-white border border-[var(--admin-border)] rounded-admin-lg overflow-hidden">
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
            <Tabs
              tabs={[
                { id: 'overview', label: 'Commercial Specs' },
                { id: 'reply', label: 'AI Reply Desk' },
                { id: 'pipeline', label: 'Pipeline & Notes' },
              ]}
              activeTab={drawerTab}
              onChange={setDrawerTab}
            />
          )
        }
        maxWidth="max-w-2xl"
      >
        {detailLoading || !activeInquiry ? (
          <div className="py-20 text-center text-[var(--admin-text-muted)] flex flex-col items-center justify-center space-y-3">
            <div className="w-7 h-7 border-2 border-[var(--admin-brand)] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Fetching inquiry dossier details...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Action Pill Bar with Spam Action */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border border-[var(--admin-border)] rounded-admin-md">
              <div className="flex items-center gap-2">
                {(activeInquiry.buyer?.whatsapp || activeInquiry.buyer?.phone) && (
                  <a
                    href={`https://wa.me/${(activeInquiry.buyer.whatsapp || activeInquiry.buyer.phone).replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-admin-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {activeInquiry.buyer?.email && (
                  <a
                    href={`mailto:${activeInquiry.buyer.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-admin-md bg-[var(--admin-brand)] hover:bg-[var(--admin-brand-hover)] text-white text-xs font-semibold transition-colors"
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-admin-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{unspamMutation.isPending ? 'Restoring...' : 'Restore Lead'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSpamDialog(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-admin-md bg-white hover:bg-rose-50 text-[var(--admin-text-secondary)] hover:text-rose-700 text-xs font-semibold transition-colors border border-[var(--admin-border)]"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Flag as Spam</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[var(--admin-text-muted)]">Score:</span>
                <strong className="text-[var(--admin-text-primary)] font-bold bg-[var(--admin-surface-subtle)] px-2 py-0.5 rounded-admin-sm border border-[var(--admin-border)] tabular-nums">
                  {activeInquiry.ai?.leadScore ?? 75}/100
                </strong>
              </div>
            </div>

            {/* Spam Confirmation Banner */}
            {showSpamDialog && (
              <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-admin-md space-y-3">
                <div className="flex items-center gap-2 text-[#991B1B] font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
                  <span>Flag this inquiry as SPAM?</span>
                </div>
                <p className="text-xs text-[#991B1B] leading-relaxed">
                  Flagged inquiries are excluded from commercial lead queues and SLA timers, and an audit trail is recorded.
                </p>
                <input
                  type="text"
                  value={spamReason}
                  onChange={(e) => setSpamReason(e.target.value)}
                  placeholder="Optional reason (e.g. unsolicited marketing, invalid contacts)..."
                  className="w-full text-xs p-2.5 bg-white border border-[#FCA5A5] rounded-admin-md focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSpamDialog(false)}
                    className="px-3 py-1.5 text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] font-medium"
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
                    className="px-3.5 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-admin-md text-xs font-bold transition-colors"
                  >
                    {spamMutation.isPending ? 'Flagging...' : 'Confirm Spam'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 1: Commercial Overview & Buyer Profile */}
            {drawerTab === 'overview' && (
              <div className="space-y-5">
                {/* Requested Commodities & Volume */}
                <div className="bg-white border border-[var(--admin-border)] rounded-admin-lg p-5 space-y-3">
                  <h3 className="text-sm font-bold text-[var(--admin-text-primary)] flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[var(--admin-brand)]" />
                    <span>Requested Commodities & Volume</span>
                  </h3>

                  {activeInquiry.items?.length > 0 ? (
                    <div className="divide-y divide-[var(--admin-border-subtle)] border border-[var(--admin-border)] rounded-admin-md overflow-hidden">
                      {activeInquiry.items.map((item, idx) => (
                        <div key={idx} className="p-3 text-xs flex items-center justify-between bg-white">
                          <div>
                            <div className="font-bold text-[var(--admin-text-primary)] text-sm">{item.productName}</div>
                            <div className="text-[var(--admin-text-muted)] text-[11px] mt-0.5">
                              {item.packing ? `Packing: ${item.packing} • ` : ''}
                              {item.grade ? `Grade: ${item.grade}` : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-[var(--admin-text-primary)] text-sm tabular-nums">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--admin-text-muted)] italic py-2">No specific line items attached.</p>
                  )}

                  {/* Incoterms & Payment terms strip */}
                  <div className="mt-3 pt-3 border-t border-[var(--admin-border-subtle)] grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[var(--admin-text-muted)] block text-[10px] uppercase font-semibold">Incoterm</span>
                      <span className="font-bold text-[var(--admin-text-primary)] font-mono">{activeInquiry.incoterm || 'CIF'}</span>
                    </div>
                    <div>
                      <span className="text-[var(--admin-text-muted)] block text-[10px] uppercase font-semibold">Payment Term</span>
                      <span className="font-bold text-[var(--admin-text-primary)] font-mono">{activeInquiry.paymentTerm || '30% TT'}</span>
                    </div>
                    <div>
                      <span className="text-[var(--admin-text-muted)] block text-[10px] uppercase font-semibold">Shipment Target</span>
                      <span className="font-bold text-[var(--admin-text-primary)]">{activeInquiry.targetShipmentMonth || 'Immediate'}</span>
                    </div>
                  </div>

                  {activeInquiry.message && (
                    <div className="mt-3 p-3.5 bg-[var(--admin-surface-subtle)] rounded-admin-md border border-[var(--admin-border)] text-xs text-[var(--admin-text-secondary)] leading-relaxed">
                      <span className="text-[10px] uppercase font-bold text-[var(--admin-text-muted)] block mb-1">
                        Buyer Note / Specification Request:
                      </span>
                      {activeInquiry.message}
                    </div>
                  )}

                  {/* Private Label & Sample Badges */}
                  {(activeInquiry.needsPrivateLabel || activeInquiry.needsSample) && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--admin-border-subtle)]">
                      {activeInquiry.needsPrivateLabel && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-admin-sm text-xs font-semibold bg-[var(--admin-surface-subtle)] text-[var(--admin-text-primary)] border border-[var(--admin-border)]">
                          <Sparkles className="w-3.5 h-3.5 text-[var(--admin-accent)]" />
                          <span>Private Label Branding Requested</span>
                        </span>
                      )}
                      {activeInquiry.needsSample && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-admin-sm text-xs font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B40]">
                          <Check className="w-3.5 h-3.5" />
                          <span>Analytical Sample Requested</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Buyer & Corporate Identity Profile */}
                <div className="bg-white border border-[var(--admin-border)] rounded-admin-lg p-5 space-y-4">
                  <h3 className="text-sm font-bold text-[var(--admin-text-primary)] flex items-center gap-2">
                    <Building className="w-4 h-4 text-[var(--admin-brand)]" />
                    <span>Buyer Corporate Profile</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[var(--admin-text-muted)] block text-[10px] uppercase font-semibold">Contact Person</span>
                      <strong className="text-[var(--admin-text-primary)] text-sm">{activeInquiry.buyer?.name}</strong>
                      {activeInquiry.buyer?.designation && (
                        <span className="text-[var(--admin-text-muted)] block text-xs mt-0.5">{activeInquiry.buyer.designation}</span>
                      )}
                    </div>

                    <div>
                      <span className="text-[var(--admin-text-muted)] block text-[10px] uppercase font-semibold">Company Name</span>
                      <strong className="text-[var(--admin-text-primary)] text-sm">{activeInquiry.buyer?.company}</strong>
                      <span className="text-[var(--admin-text-muted)] block text-xs mt-0.5 capitalize">
                        Buyer Category: {activeInquiry.buyer?.buyerType || 'Importer'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[var(--admin-text-muted)] block text-[10px] uppercase font-semibold">Corporate Email</span>
                      <a
                        href={`mailto:${activeInquiry.buyer?.email}`}
                        className="text-[var(--admin-brand)] font-semibold hover:underline flex items-center gap-1.5 mt-0.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{activeInquiry.buyer?.email}</span>
                      </a>
                    </div>

                    <div>
                      <span className="text-[var(--admin-text-muted)] block text-[10px] uppercase font-semibold">Destination Port & Country</span>
                      <span className="text-[var(--admin-text-primary)] font-semibold text-sm block mt-0.5">
                        {activeInquiry.destinationPort || 'Port TBD'} ({activeInquiry.buyer?.country || 'International'})
                      </span>
                    </div>

                    <div>
                      <span className="text-[var(--admin-text-muted)] block text-[10px] uppercase font-semibold">Phone / WhatsApp</span>
                      <span className="text-[var(--admin-text-primary)] font-semibold text-sm block mt-0.5 font-mono">
                        {activeInquiry.buyer?.phone || activeInquiry.buyer?.whatsapp || 'Not provided'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[var(--admin-text-muted)] block text-[10px] uppercase font-semibold">City & Website</span>
                      <div className="text-[var(--admin-text-primary)] text-sm mt-0.5">
                        <span className="font-semibold block">{activeInquiry.buyer?.city || 'City TBD'}</span>
                        {activeInquiry.buyer?.website ? (
                          <a
                            href={
                              activeInquiry.buyer.website.startsWith('http')
                                ? activeInquiry.buyer.website
                                : `https://${activeInquiry.buyer.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--admin-brand)] hover:underline block text-xs truncate max-w-[200px]"
                          >
                            {activeInquiry.buyer.website}
                          </a>
                        ) : (
                          <span className="text-[var(--admin-text-placeholder)] text-xs">No website provided</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automated Dispatch & Delivery Status */}
                <div className="bg-[var(--admin-surface-subtle)] border border-[var(--admin-border)] rounded-admin-lg p-4 text-xs space-y-2">
                  <div className="text-[10px] uppercase font-bold text-[var(--admin-text-muted)] tracking-wider">
                    Automated Notification Dispatch
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          activeInquiry.emailSent?.buyer ? 'bg-emerald-500' : 'bg-neutral-300'
                        }`}
                      />
                      <span className="text-[var(--admin-text-secondary)]">Buyer Acknowledgment:</span>
                      <span className="font-semibold text-[var(--admin-text-primary)]">
                        {activeInquiry.emailSent?.buyer ? 'Sent' : 'Pending / Skipped'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          activeInquiry.emailSent?.team ? 'bg-emerald-500' : 'bg-neutral-300'
                        }`}
                      />
                      <span className="text-[var(--admin-text-secondary)]">Sales Alert:</span>
                      <span className="font-semibold text-[var(--admin-text-primary)]">
                        {activeInquiry.emailSent?.team ? 'Delivered' : 'Pending / Skipped'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI Sales Reply & Email Dispatch */}
            {drawerTab === 'reply' && (
              <div className="space-y-5">
                {/* MANDATORY AI GOVERNANCE LABEL */}
                <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-admin-md flex items-center gap-2.5 text-xs text-[#92400E]">
                  <ShieldCheck className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>
                    <strong>[AI GENERATED SUGGESTION — REQUIRES HUMAN APPROVAL]:</strong> Verify commercial pricing, specifications, and shipment terms before dispatching reply to buyer.
                  </span>
                </div>

                {/* AI Lead Intelligence Card - Flat Deep Forest Card */}
                <div className="bg-[#06180E] text-white rounded-admin-lg p-5 border border-[#0A2619] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-admin-md bg-white/10 flex items-center justify-center text-white">
                        <Sparkles className="w-4 h-4 text-[var(--admin-accent)]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">
                          AI Lead Qualification & Scoring
                        </h3>
                        <p className="text-[10px] text-neutral-400">
                          Neural intent analysis from commodity volume & buyer signals
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => summarizeMutation.mutate(activeInquiry.id || activeInquiry._id)}
                      disabled={summarizeMutation.isPending}
                      className="px-2.5 py-1.5 rounded-admin-md bg-white/10 hover:bg-white/20 text-neutral-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                    >
                      <RotateCcw className={`w-3 h-3 ${summarizeMutation.isPending ? 'animate-spin' : ''}`} />
                      <span>{summarizeMutation.isPending ? 'Scoring...' : 'Re-Score'}</span>
                    </button>
                  </div>

                  {/* Lead Score Progress */}
                  <div className="bg-black/30 rounded-admin-md p-3.5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300 font-medium">Buyer Intent Quality:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm tabular-nums">
                          {activeInquiry.ai?.leadScore ?? 75}/100
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-admin-sm bg-white/10 text-white border border-white/20">
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
                            className="px-2 py-0.5 rounded-admin-sm bg-white/10 text-neutral-300 text-[10px] font-medium"
                          >
                            ✓ {sig}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {activeInquiry.ai?.summary && (
                    <div className="bg-white/5 rounded-admin-md p-3 border border-white/10 text-xs text-neutral-200 leading-relaxed">
                      <span className="text-[10px] uppercase font-bold text-[var(--admin-accent)] block mb-1 tracking-wider">
                        Executive Trade Assessment:
                      </span>
                      {activeInquiry.ai.summary}
                    </div>
                  )}

                  {/* AI Sales Reply Drafter */}
                  <div className="bg-white/5 rounded-admin-lg p-4 border border-white/10 space-y-3">
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
                          className="text-[10px] text-neutral-300 hover:text-white px-2 py-1 rounded-admin-sm bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          {showInstructions ? 'Hide Guidance' : '+ Custom Guidance'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyDraft(replyText || activeInquiry.ai?.suggestedReply)}
                          className="px-2.5 py-1 rounded-admin-sm bg-white/10 hover:bg-white/20 text-neutral-200 font-medium text-[10px] flex items-center gap-1 transition-colors"
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
                      <div className="bg-black/50 p-2.5 rounded-admin-md border border-white/10 space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-400 block">
                          Custom guidance (e.g., mention 500g courier sample, CIF Rotterdam ocean transit):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyInstructions}
                            onChange={(e) => setReplyInstructions(e.target.value)}
                            placeholder="Add special commercial instructions..."
                            className="flex-1 bg-neutral-900 border border-white/10 rounded-admin-sm px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-[var(--admin-accent)]"
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
                            className="px-3 py-1 rounded-admin-sm bg-[var(--admin-accent)] hover:bg-[#b5924a] text-neutral-900 font-bold text-xs"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick-Reply Template Shortcuts */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span className="uppercase font-bold tracking-wider">Quick-Reply Presets</span>
                        <span className="text-[10px] text-neutral-400">1-click statutory export templates</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setReplySubject(`Commercial Clarification — Incoterms & Destination Port — ${activeInquiry.referenceNo || 'RFQ'}`);
                            setReplyText(
`Dear ${activeInquiry.buyer?.name || 'Customer'},

Thank you for reaching out to JHS GLOBAL regarding our export commodities.

To ensure our Commercial Operations Desk calculates the most precise freight, insurance, and packaging terms, could you please confirm:
1. Preferred Incoterm (e.g., CIF, CFR, or FOB Indian Gateway Port)?
2. Designated discharge port and country?
3. Target packaging specifications (e.g., ISO Tanks, 200kg HDPE Drums, or 25kg Palletised Bags)?

Upon confirmation, our team will dispatch the formal pro-forma quotation alongside our statutory specification dossier.

Best regards,
Commercial Operations Desk
JHS GLOBAL`
                            );
                          }}
                          className="px-2 py-1.5 rounded-admin-sm bg-white/10 hover:bg-white/20 border border-white/10 text-[11px] text-neutral-200 text-left transition-colors flex flex-col"
                        >
                          <span className="font-semibold text-white">1. Incoterm Clarification</span>
                          <span className="text-[10px] text-neutral-400">Port, terms & packaging check</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setReplySubject(`Pro-Forma Quotation & Export Specification — ${activeInquiry.referenceNo || 'RFQ'}`);
                            setReplyText(
`Dear ${activeInquiry.buyer?.name || 'Customer'},

We have reviewed your RFQ for ${activeInquiry.items?.[0]?.product?.name || activeInquiry.product_name || 'our export commodities'} (${activeInquiry.items?.[0]?.quantity || ''} ${activeInquiry.items?.[0]?.unit || 'MT'}).

Our Commercial Export Desk has prepared the formal quotation tailored to your requested shipment timeline:
- Port of Dispatch: Indian Gateway Port (agreed per order)
- Export Standards: Verified statutory credentials (FSSAI, APEDA, FIEO, Spices Board) and phytosanitary certification
- Payment Terms: Standard Irrevocable LC at Sight or 30% T/T Advance

Please review our preliminary commercial offer. Let us know if you wish to adjust the order lot size or container configuration.

Best regards,
Commercial Operations Desk
JHS GLOBAL`
                            );
                          }}
                          className="px-2 py-1.5 rounded-admin-sm bg-white/10 hover:bg-white/20 border border-white/10 text-[11px] text-neutral-200 text-left transition-colors flex flex-col"
                        >
                          <span className="font-semibold text-white">2. Pro-Forma Quotation</span>
                          <span className="text-[10px] text-neutral-400">Pricing, terms & dispatch port</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setReplySubject(`Analytical Sample Dispatch & Courier Tracking — ${activeInquiry.referenceNo || 'RFQ'}`);
                            setReplyText(
`Dear ${activeInquiry.buyer?.name || 'Customer'},

Thank you for your interest in evaluating our export quality.

We have arranged the analytical reference sample for ${activeInquiry.items?.[0]?.product?.name || activeInquiry.product_name || 'your requested product'}. The sample package has been prepared along with the manufacturer Certificate of Analysis (CoA) and Safety Data Sheet (SDS).

Dispatch details:
- Courier Service: International Express Air Freight
- Documentation Enclosed: CoA, Non-Dangerous Goods Declaration, Commercial Invoice

Please review upon arrival and advise your laboratory evaluation results.

Best regards,
Sample Dispatch Desk
JHS GLOBAL`
                            );
                          }}
                          className="px-2 py-1.5 rounded-admin-sm bg-white/10 hover:bg-white/20 border border-white/10 text-[11px] text-neutral-200 text-left transition-colors flex flex-col"
                        >
                          <span className="font-semibold text-white">3. Sample Dispatch</span>
                          <span className="text-[10px] text-neutral-400">CoA, tracking & courier alert</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block">
                        Subject Line
                      </label>
                      <input
                        type="text"
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-admin-md px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-[var(--admin-accent)] font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span className="uppercase font-bold">Quotation Response Body (Staff Editable)</span>
                        <span className="text-[var(--admin-accent)] font-medium">Human Approval Required</span>
                      </div>
                      <textarea
                        rows={7}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-admin-md p-3 text-xs text-neutral-200 font-sans leading-relaxed focus:outline-none focus:border-[var(--admin-accent)] resize-y whitespace-pre-wrap"
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
                        className="px-4 py-2 rounded-admin-md bg-[var(--admin-accent)] hover:bg-[#b5924a] text-neutral-900 font-bold text-xs flex items-center gap-2 transition-colors active:scale-[0.98] disabled:opacity-50"
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
              <div className="space-y-5">
                {/* Pipeline Stage & Priority Control */}
                <div className="bg-white border border-[var(--admin-border)] rounded-admin-lg p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-primary)] mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--admin-brand)]" />
                    <span>Commercial Pipeline Stage</span>
                  </h3>

                  {feedbackMsg && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-admin-md flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">{feedbackMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-text-secondary)] mb-1.5">
                          Pipeline Stage
                        </label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-[var(--admin-border)] rounded-admin-md focus:border-[var(--admin-brand)] capitalize font-medium text-[var(--admin-text-primary)]"
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
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-text-secondary)] mb-1.5">
                          Urgency / Priority
                        </label>
                        <select
                          value={newPriority}
                          onChange={(e) => setNewPriority(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-[var(--admin-border)] rounded-admin-md focus:border-[var(--admin-brand)] uppercase font-semibold text-[var(--admin-text-primary)]"
                        >
                          <option value="hot">HOT (High Intent / Urgency)</option>
                          <option value="warm">WARM (Standard Procurement)</option>
                          <option value="cold">COLD (Informational Enquiry)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-text-secondary)] mb-1.5">
                        Add Staff Follow-up Note
                      </label>
                      <textarea
                        rows={3}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Log quotation details, port freight check, or buyer conversation notes..."
                        className="w-full text-xs p-2.5 bg-white border border-[var(--admin-border)] rounded-admin-md focus:border-[var(--admin-brand)] text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)]"
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
                <div className="bg-white border border-[var(--admin-border)] rounded-admin-lg p-5 space-y-3">
                  <h3 className="text-sm font-bold text-[var(--admin-text-primary)] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[var(--admin-brand)]" />
                    <span>Internal Audit Log & Notes</span>
                  </h3>

                  {activeInquiry.notes?.length > 0 ? (
                    <div className="space-y-2.5">
                      {activeInquiry.notes.map((n, i) => (
                        <div key={i} className="text-xs p-3 rounded-admin-md bg-[var(--admin-surface-subtle)] border border-[var(--admin-border)]">
                          <div className="flex items-center justify-between text-[var(--admin-text-muted)] text-[10px] mb-1">
                            <strong className="text-[var(--admin-text-primary)]">{n.by}</strong>
                            <span className="font-mono tabular-nums">{new Date(n.at).toLocaleString()}</span>
                          </div>
                          <p className="text-[var(--admin-text-secondary)]">{n.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--admin-text-placeholder)] italic">No team notes logged yet.</p>
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
