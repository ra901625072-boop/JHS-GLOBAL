import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Inbox,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  Tag,
  Calendar,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Send,
  AlertCircle,
  X,
  ShieldCheck,
  Check,
  Copy,
  Globe,
  User,
  Columns,
  List,
  Filter,
  FileText,
  MapPin,
  Building,
  DollarSign,
  Maximize2,
} from 'lucide-react';
import {
  fetchAdminInquiries,
  fetchAdminTodayTasks,
  updateAdminTaskStatus,
  createAdminTask,
  generateAiFollowUpDraft,
  updateAdminInquiryStatus,
} from '../api';
import Button from '../../components/ui/Button';
import AdminStatusBadge from '../components/AdminStatusBadge';
import AdminDrawer from '../components/AdminDrawer';
import AnimatedCounter from '../../components/ui/AnimatedCounter';

export const SalesDesk = () => {
  const queryClient = useQueryClient();
  const boardScrollRef = useRef(null);

  // Top-level workspace view & filter state
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'tasks'
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [hideEmptyColumns, setHideEmptyColumns] = useState(false);
  const [statusFilterPill, setStatusFilterPill] = useState('all');
  const [pipelineFilterQuery, setPipelineFilterQuery] = useState('');
  const [stageFeedback, setStageFeedback] = useState('');

  // Modals & In-Page Slide-Over Drawer
  const [selectedInquiryForDrawer, setSelectedInquiryForDrawer] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [aiFollowUpModalOpen, setAiFollowUpModalOpen] = useState(false);
  const [activeInquiryForAi, setActiveInquiryForAi] = useState(null);
  const [aiDraftChannel, setAiDraftChannel] = useState('email');
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [copiedDraft, setCopiedDraft] = useState(false);

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    taskType: 'whatsapp',
    company: '',
    customerName: '',
    country: '',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '10:00 AM',
    priority: 'high',
    notes: '',
  });

  const scrollBoard = (direction) => {
    if (boardScrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      boardScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Queries
  const { data: pipelineData, isLoading: pipelineLoading } = useQuery({
    queryKey: ['sales-pipeline-inquiries'],
    queryFn: () => fetchAdminInquiries({ limit: 100 }),
    refetchInterval: 25000,
  });

  const { data: todayTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['sales-today-tasks'],
    queryFn: fetchAdminTodayTasks,
    refetchInterval: 15000,
  });

  // Mutations
  const updateStageMutation = useMutation({
    mutationFn: ({ id, status }) => updateAdminInquiryStatus(id, { status }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries(['sales-pipeline-inquiries']);
      queryClient.invalidateQueries(['admin-inquiries']);
      queryClient.invalidateQueries(['admin-dashboard']);
      setStageFeedback(`Deal stage progressed: ${updated.status?.replace('_', ' ')}`);
      if (selectedInquiryForDrawer && selectedInquiryForDrawer._id === updated._id) {
        setSelectedInquiryForDrawer((prev) => ({ ...prev, status: updated.status }));
      }
      setTimeout(() => setStageFeedback(''), 3500);
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (id) => updateAdminTaskStatus(id, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['sales-today-tasks']);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => createAdminTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sales-today-tasks']);
      setTaskModalOpen(false);
      setTaskFormData({
        title: '',
        taskType: 'whatsapp',
        company: '',
        customerName: '',
        country: '',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '10:00 AM',
        priority: 'high',
        notes: '',
      });
    },
  });

  const aiFollowUpMutation = useMutation({
    mutationFn: (params) => generateAiFollowUpDraft(params),
    onSuccess: (data) => {
      setAiGeneratedText(data.followUpText);
    },
  });

  const handleOpenAiAssistant = (inquiry) => {
    setActiveInquiryForAi(inquiry);
    setAiGeneratedText('');
    setAiFollowUpModalOpen(true);
    aiFollowUpMutation.mutate({
      inquiryId: inquiry._id,
      channel: aiDraftChannel,
    });
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  // Filter Pipeline Inquiries
  const rawInquiries = pipelineData?.inquiries || [];
  const inquiries = rawInquiries.filter((inq) => {
    if (statusFilterPill !== 'all') {
      if (statusFilterPill === 'new' && inq.status !== 'new') return false;
      if (statusFilterPill === 'quoted' && !['quoted', 'quotation_sent'].includes(inq.status)) return false;
      if (statusFilterPill === 'negotiation' && inq.status !== 'negotiation') return false;
      if (statusFilterPill === 'won' && !['won', 'confirmed', 'completed'].includes(inq.status)) return false;
    }
    if (!pipelineFilterQuery.trim()) return true;
    const q = pipelineFilterQuery.toLowerCase();
    const ref = inq.referenceNo?.toLowerCase() || '';
    const comp = inq.buyer?.company?.toLowerCase() || '';
    const name = inq.buyer?.name?.toLowerCase() || '';
    const country = inq.buyer?.country?.toLowerCase() || '';
    const items = inq.items?.map((i) => i.productName?.toLowerCase()).join(' ') || '';
    return (
      ref.includes(q) ||
      comp.includes(q) ||
      name.includes(q) ||
      country.includes(q) ||
      items.includes(q)
    );
  });

  // Pipeline Columns
  const kanbanColumns = [
    {
      id: 'new',
      label: 'New Inbound Leads',
      shortLabel: 'New Leads',
      filter: (inq) => inq.status === 'new',
      accentBorder: 'border-t-4 border-t-amber-500',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
      dotClass: 'bg-amber-500',
      icon: Inbox,
    },
    {
      id: 'contacted',
      label: 'Initial Outreach',
      shortLabel: 'Contacted',
      filter: (inq) => ['contacted', 'in_review'].includes(inq.status),
      accentBorder: 'border-t-4 border-t-sky-500',
      badgeClass: 'bg-sky-50 text-sky-800 border-sky-300',
      dotClass: 'bg-sky-500',
      icon: Phone,
    },
    {
      id: 'qualified',
      label: 'Specifications Confirmed',
      shortLabel: 'Specs Verified',
      filter: (inq) => ['requirement_confirmed', 'quotation_preparing', 'sample_sent'].includes(inq.status),
      accentBorder: 'border-t-4 border-t-indigo-500',
      badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
      dotClass: 'bg-indigo-500',
      icon: ShieldCheck,
    },
    {
      id: 'quoted',
      label: 'Proforma Invoice Sent',
      shortLabel: 'Quoted',
      filter: (inq) => ['quoted', 'quotation_sent'].includes(inq.status),
      accentBorder: 'border-t-4 border-t-purple-500',
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
      dotClass: 'bg-purple-500',
      icon: FileText,
    },
    {
      id: 'negotiation',
      label: 'Commercial Negotiation',
      shortLabel: 'Negotiation',
      filter: (inq) => inq.status === 'negotiation',
      accentBorder: 'border-t-4 border-t-teal-500',
      badgeClass: 'bg-teal-50 text-teal-800 border-teal-300',
      dotClass: 'bg-teal-500',
      icon: TrendingUp,
    },
    {
      id: 'won',
      label: 'Closed & Won (Contract)',
      shortLabel: 'Closed Won',
      filter: (inq) => ['won', 'confirmed', 'order_processing', 'completed'].includes(inq.status),
      accentBorder: 'border-t-4 border-t-emerald-500',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      dotClass: 'bg-emerald-500',
      icon: CheckCircle2,
    },
  ];

  const displayedColumns = hideEmptyColumns
    ? kanbanColumns.filter((col) => inquiries.some(col.filter))
    : kanbanColumns;

  // Pipeline Counts
  const newCount = rawInquiries.filter((i) => i.status === 'new').length;
  const quoteCount = rawInquiries.filter((i) => ['quoted', 'quotation_sent'].includes(i.status)).length;
  const wonCount = rawInquiries.filter((i) => ['won', 'confirmed', 'completed'].includes(i.status)).length;

  return (
    <>
      <Helmet>
        <title>Commercial Sales & Pipeline Desk — Admin Suite</title>
      </Helmet>

      <div className="space-y-4">
        {/* 1. Sovereign Command Bar (Header + Metrics + CTAs) */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 lg:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-neutral-900" />
                <span>COMMERCIAL DEAL FLOW & EXPORT PIPELINE</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                International Sales Desk
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
                Multi-stage trade pipeline monitoring, AI commercial negotiations, and scheduled buyer touchpoints.
              </p>
            </div>

            {/* Top Primary Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setTaskModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 shadow-2xs transition-all active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5 text-neutral-500" />
                <span>Schedule Task</span>
              </button>

              <Link
                to="/admin/quotations"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-black text-white shadow-subtle transition-all active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>+ Proforma Invoice</span>
              </Link>
            </div>
          </div>

          {/* Metric Ticker & Sub-Nav Bar */}
          <div className="pt-4 border-t border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Workspace Sub-Tabs */}
            <div className="flex items-center gap-1.5 bg-neutral-100/80 p-1 rounded-xl border border-neutral-200/80 self-start">
              <button
                onClick={() => setActiveTab('pipeline')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'pipeline'
                    ? 'bg-white text-neutral-950 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5 text-neutral-700" />
                <span>Deal Pipeline</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 font-mono text-neutral-600 font-bold border border-neutral-200">
                  {rawInquiries.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'tasks'
                    ? 'bg-white text-primary-950 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Today's Actions</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold border ${
                    todayTasks.length > 0
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                  }`}
                >
                  {todayTasks.length}
                </span>
              </button>
            </div>

            {/* Quick KPI Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Inbound Leads:</span>
                <strong className="font-mono font-bold"><AnimatedCounter value={newCount} duration={1.0} /></strong>
              </div>

              <div className="px-3 py-1 rounded-lg bg-purple-50/80 border border-purple-200 text-purple-900 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>Proformas Sent:</span>
                <strong className="font-mono font-bold"><AnimatedCounter value={quoteCount} duration={1.0} /></strong>
              </div>

              <div className="px-3 py-1 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Won Contracts:</span>
                <strong className="font-mono font-bold"><AnimatedCounter value={wonCount} duration={1.0} /></strong>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Urgent Outreach Alert Banner (if tasks due today and on pipeline tab) */}
        {activeTab === 'pipeline' && todayTasks.length > 0 && (
          <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                !
              </span>
              <span className="text-amber-950 font-medium">
                <strong>{todayTasks.length} Action Reminders Due Today:</strong> Scheduled outreach touchpoints require commercial desk resolution.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="font-bold text-amber-900 hover:text-amber-700 underline text-xs shrink-0 flex items-center gap-1"
            >
              <span>Switch to Task Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Feedback Notification */}
        {stageFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center justify-between shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{stageFeedback}</span>
            </div>
            <button
              onClick={() => setStageFeedback('')}
              className="text-emerald-700 hover:text-emerald-900 text-sm font-bold px-1"
            >
              ×
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: DEAL PIPELINE (Kanban Board or Table Register)                     */}
        {/* ========================================================================= */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Control Bar: Search + Filter Pills + View Switcher */}
            <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Left: Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setStatusFilterPill('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilterPill === 'all'
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  All Stages ({rawInquiries.length})
                </button>
                <button
                  onClick={() => setStatusFilterPill('new')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilterPill === 'new'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  New Leads ({newCount})
                </button>
                <button
                  onClick={() => setStatusFilterPill('quoted')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilterPill === 'quoted'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Quoted ({quoteCount})
                </button>
                <button
                  onClick={() => setStatusFilterPill('won')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilterPill === 'won'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Won ({wonCount})
                </button>
              </div>

              {/* Right: Search + Active Only Toggle + View Mode Switcher + Scroll Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Box */}
                <div className="relative min-w-[200px] sm:w-60">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={pipelineFilterQuery}
                    onChange={(e) => setPipelineFilterQuery(e.target.value)}
                    placeholder="Search buyer, ref, HS..."
                    className="w-full pl-9 pr-7 py-1.5 text-xs bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-800 text-neutral-800 placeholder-neutral-400 transition-all"
                  />
                  {pipelineFilterQuery && (
                    <button
                      onClick={() => setPipelineFilterQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 px-1"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Active Stages Toggle */}
                <button
                  onClick={() => setHideEmptyColumns(!hideEmptyColumns)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    hideEmptyColumns
                      ? 'bg-primary-900 text-white border-primary-900'
                      : 'bg-white text-neutral-600 hover:text-neutral-900 border-neutral-200'
                  }`}
                  title="Toggle visibility of empty stages"
                >
                  <Filter className="w-3 h-3" />
                  <span className="hidden sm:inline">{hideEmptyColumns ? 'Active Stages' : 'All Stages'}</span>
                </button>

                {/* View Switcher: Board vs Table */}
                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                      viewMode === 'kanban'
                        ? 'bg-white text-primary-900 shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                    title="Kanban Board View"
                  >
                    <Columns className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-primary-900 shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                    title="Table Register View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Horizontal Scroll Controls (Kanban View) */}
                {viewMode === 'kanban' && (
                  <div className="hidden xl:flex items-center gap-1 border-l border-neutral-200 pl-2">
                    <button
                      onClick={() => scrollBoard('left')}
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                      title="Scroll Left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => scrollBoard('right')}
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                      title="Scroll Right"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* View Mode 1: Kanban Board View with Spacious Columns & Horizontal Scroll */}
            {viewMode === 'kanban' ? (
              <div
                ref={boardScrollRef}
                className="flex gap-5 overflow-x-auto pb-6 pt-1 snap-x admin-scrollbar min-h-[640px]"
              >
                {displayedColumns.map((col) => {
                  const colInquiries = inquiries.filter(col.filter);
                  const ColIcon = col.icon;
                  return (
                    <div
                      key={col.id}
                      className={`w-[330px] min-w-[330px] max-w-[330px] shrink-0 bg-neutral-100/70 border border-neutral-200/80 rounded-2xl p-4 flex flex-col snap-start ${col.accentBorder}`}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200/80">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${col.dotClass}`} />
                          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider truncate">
                            {col.label}
                          </h3>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${col.badgeClass}`}
                        >
                          {colInquiries.length}
                        </span>
                      </div>

                      {/* Cards List in Column */}
                      <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[680px] pr-1 admin-scrollbar">
                        {colInquiries.length === 0 ? (
                          <div className="py-16 px-4 text-center border border-dashed border-neutral-200 rounded-xl bg-white/40 flex flex-col items-center justify-center space-y-2">
                            <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                              <ColIcon className="w-4 h-4" />
                            </div>
                            <p className="text-xs font-semibold text-neutral-600">No active dossiers</p>
                            <p className="text-[11px] text-neutral-400">Stage currently clear</p>
                          </div>
                        ) : (
                          colInquiries.map((inq) => (
                            <div
                              key={inq._id}
                              className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs hover:shadow-card hover:border-neutral-400 transform-gpu hover:-translate-y-0.5 transition-all duration-200 p-4 space-y-3.5 group relative"
                            >
                              {/* Card Header: Ref # & Country Pill */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-xs font-bold text-primary-950 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200/70 shrink-0 shadow-2xs">
                                  {inq.referenceNo}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200/80 truncate max-w-[140px]">
                                  <Globe className="w-3 h-3 text-neutral-400 shrink-0" />
                                  <span className="truncate">{inq.buyer?.country || 'International'}</span>
                                </span>
                              </div>

                              {/* Buyer Company & Attention Name */}
                              <div>
                                <h4 className="text-sm font-bold text-neutral-900 group-hover:text-primary-900 transition-colors truncate">
                                  {inq.buyer?.company || inq.buyer?.name}
                                </h4>
                                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5 truncate">
                                  <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                  <span className="truncate">Attn: {inq.buyer?.name || 'Commercial Officer'}</span>
                                </div>
                              </div>

                              {/* Commodities Specification Box */}
                              {inq.items?.length > 0 && (
                                <div className="p-2.5 bg-neutral-50/90 rounded-xl border border-neutral-100 space-y-1.5">
                                  {inq.items.slice(0, 2).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs">
                                      <span className="font-medium text-neutral-800 truncate mr-2">
                                        {item.productName}
                                      </span>
                                      <span className="font-mono font-bold text-primary-900 shrink-0 bg-white px-2 py-0.5 rounded border border-neutral-200/80 text-[11px] shadow-2xs">
                                        {item.quantity} {item.unit}
                                      </span>
                                    </div>
                                  ))}
                                  {inq.items.length > 2 && (
                                    <span className="text-[10px] text-neutral-400 font-semibold block pt-0.5">
                                      +{inq.items.length - 2} additional commodity line items
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Incoterm & Lead Score Row */}
                              <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-100/80 text-neutral-500">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold uppercase text-[11px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200">
                                    {inq.incoterm || 'CIF'}
                                  </span>
                                  {inq.portOfDischarge && (
                                    <span className="text-[11px] text-neutral-500 truncate max-w-[110px]" title={inq.portOfDischarge}>
                                      {inq.portOfDischarge}
                                    </span>
                                  )}
                                </div>

                                {inq.ai?.leadScore != null && (
                                  <span
                                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200"
                                    title="AI Lead Intent Score (0-100)"
                                  >
                                    Score: {inq.ai.leadScore}/100
                                  </span>
                                )}
                              </div>

                              {/* Action Footer: Stage Advance Dropdown & Dossier Trigger */}
                              <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
                                {/* Fast Stage Advancement Select */}
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <select
                                    value={inq.status}
                                    onChange={(e) =>
                                      updateStageMutation.mutate({ id: inq._id, status: e.target.value })
                                    }
                                    className="w-full text-xs font-semibold bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200 rounded-lg py-1.5 px-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-800 cursor-pointer transition-colors"
                                    title="Advance Deal Stage"
                                  >
                                    <option value="new">● New Lead</option>
                                    <option value="contacted">● Contacted</option>
                                    <option value="requirement_confirmed">● Confirmed</option>
                                    <option value="quotation_sent">● Quoted</option>
                                    <option value="negotiation">● Negotiation</option>
                                    <option value="won">● Won / Contract</option>
                                    <option value="lost">● Lost</option>
                                  </select>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => handleOpenAiAssistant(inq)}
                                    className="p-1.5 text-neutral-700 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors"
                                    title="Generate AI Follow-up Nudge"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
                                  </button>

                                  <button
                                    onClick={() => setSelectedInquiryForDrawer(inq)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-900 hover:bg-primary-950 text-white font-bold text-xs transition-colors shadow-2xs"
                                    title="Inspect Dossier in Slide-over Drawer"
                                  >
                                    <span>Inspect</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* View Mode 2: Pipeline Register Table View */
              <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto min-w-full">
                  <table className="min-w-full divide-y divide-neutral-200 text-left text-xs">
                    <thead className="bg-neutral-50/90 text-neutral-600 font-semibold border-b border-neutral-200">
                      <tr>
                        <th className="px-5 py-3.5">Reference No</th>
                        <th className="px-5 py-3.5">Buyer & Company</th>
                        <th className="px-5 py-3.5">Destination Country</th>
                        <th className="px-5 py-3.5">Requested Commodities</th>
                        <th className="px-5 py-3.5">Incoterm & Port</th>
                        <th className="px-5 py-3.5">AI Lead Score</th>
                        <th className="px-5 py-3.5">Pipeline Stage</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-700 bg-white">
                      {inquiries.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-neutral-400">
                            No deal dossiers match the filter criteria.
                          </td>
                        </tr>
                      ) : (
                        inquiries.map((inq) => (
                          <tr
                            key={inq._id}
                            className="hover:bg-primary-50/30 transition-colors group"
                          >
                            <td className="px-5 py-4 font-mono font-bold text-primary-900 whitespace-nowrap">
                              {inq.referenceNo}
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-bold text-neutral-900">{inq.buyer?.company || inq.buyer?.name}</div>
                              <div className="text-neutral-500 text-[11px] mt-0.5">Attn: {inq.buyer?.name}</div>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap font-medium text-neutral-800">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200/80">
                                <Globe className="w-3 h-3 text-neutral-400" />
                                <span>{inq.buyer?.country || 'International'}</span>
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="max-w-xs truncate text-neutral-700 font-medium">
                                {inq.items?.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ') || 'Custom Specs'}
                              </div>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="font-mono font-bold uppercase text-[11px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200">
                                {inq.incoterm || 'CIF'}
                              </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              {inq.ai?.leadScore != null ? (
                                <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">
                                  {inq.ai.leadScore}/100
                                </span>
                              ) : (
                                <span className="text-neutral-400 font-mono text-xs">N/A</span>
                              )}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <select
                                value={inq.status}
                                onChange={(e) =>
                                  updateStageMutation.mutate({ id: inq._id, status: e.target.value })
                                }
                                className="text-xs font-semibold bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg py-1 px-2 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary-800 cursor-pointer"
                              >
                                <option value="new">● New Lead</option>
                                <option value="contacted">● Contacted</option>
                                <option value="requirement_confirmed">● Confirmed</option>
                                <option value="quotation_sent">● Quoted</option>
                                <option value="negotiation">● Negotiation</option>
                                <option value="won">● Won / Contract</option>
                                <option value="lost">● Lost</option>
                              </select>
                            </td>
                            <td className="px-5 py-4 text-right whitespace-nowrap space-x-1.5">
                              <button
                                onClick={() => handleOpenAiAssistant(inq)}
                                className="p-1.5 text-neutral-700 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors"
                                title="Generate AI Follow-up Nudge"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
                              </button>
                              <button
                                onClick={() => setSelectedInquiryForDrawer(inq)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-900 hover:bg-primary-950 text-white font-bold text-xs transition-colors shadow-2xs"
                              >
                                <span>Inspect</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between text-xs text-neutral-500 font-mono">
                  <span>Displaying {inquiries.length} verified trade dossiers</span>
                  <span className="text-neutral-400 font-sans text-[11px]">ICC Incoterms 2020 Compliance</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TODAY'S ACTION QUEUE & BUYER TOUCHPOINTS                           */}
        {/* ========================================================================= */}
        {activeTab === 'tasks' && (
          <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs p-5 lg:p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <h2 className="font-serif text-base font-bold text-neutral-900">
                  Scheduled Buyer Outreach Tasks
                </h2>
                <span className="bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {todayTasks.length} Due Today
                </span>
              </div>

              <button
                onClick={() => setTaskModalOpen(true)}
                className="text-xs text-neutral-900 hover:text-black font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Schedule Item</span>
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 text-neutral-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-neutral-800 text-sm">All commercial follow-ups for today are cleared!</p>
                <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                  Switch to the Deal Pipeline tab to advance active dossiers or click "+ Add Schedule Item" to set up buyer communication reminders.
                </p>
                <button
                  onClick={() => setActiveTab('pipeline')}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-900 text-white font-semibold text-xs shadow-2xs"
                >
                  <span>Go to Deal Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/70 hover:bg-white hover:border-neutral-400 transition-all flex flex-col justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-mono text-[11px]">
                          {task.dueTime}
                        </span>
                        <span className="font-medium text-neutral-500 text-[11px]">{task.country || 'International'}</span>
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900">{task.company}</h4>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{task.title}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-200/70 text-xs">
                      <div className="flex items-center gap-2">
                        {task.taskType === 'whatsapp' ? (
                          <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200" title="WhatsApp Follow-up">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </span>
                        ) : task.taskType === 'call' ? (
                          <span className="p-1.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200" title="Phone Call">
                            <Phone className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200" title="Email Follow-up">
                            <Mail className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-600 capitalize font-medium">{task.taskType}</span>
                      </div>

                      <button
                        onClick={() => completeTaskMutation.mutate(task._id)}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors flex items-center gap-1 active:scale-[0.98]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Complete Task</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* IN-PAGE SLIDE-OVER DOSSIER INSPECTOR DRAWER                               */}
      {/* ========================================================================= */}
      <AdminDrawer
        isOpen={!!selectedInquiryForDrawer}
        onClose={() => setSelectedInquiryForDrawer(null)}
        title={selectedInquiryForDrawer?.referenceNo || 'Commercial Dossier'}
        subtitle={selectedInquiryForDrawer?.buyer?.company || selectedInquiryForDrawer?.buyer?.name}
        badge={<AdminStatusBadge status={selectedInquiryForDrawer?.status} />}
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <Link
              to={`/admin/inquiries?id=${selectedInquiryForDrawer?._id}`}
              className="text-xs text-neutral-900 hover:text-black font-bold flex items-center gap-1"
            >
              <span>Open in Full Inquiries Desk</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setSelectedInquiryForDrawer(null)}
            >
              Done
            </Button>
          </div>
        }
      >
        {selectedInquiryForDrawer && (
          <div className="space-y-5 text-xs text-neutral-700">
            {/* Quick Stage Advancement Control */}
            <div className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Update Deal Stage
              </label>
              <select
                value={selectedInquiryForDrawer.status}
                onChange={(e) =>
                  updateStageMutation.mutate({
                    id: selectedInquiryForDrawer._id,
                    status: e.target.value,
                  })
                }
                className="w-full text-xs font-semibold bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-neutral-900 focus:ring-2 focus:ring-primary-800"
              >
                <option value="new">1. New Inbound Lead</option>
                <option value="contacted">2. Initial Outreach</option>
                <option value="requirement_confirmed">3. Specifications Confirmed</option>
                <option value="quotation_sent">4. Proforma Invoice Sent</option>
                <option value="negotiation">5. Commercial Negotiation</option>
                <option value="won">6. Closed & Won (Contract)</option>
                <option value="lost">7. Lost / Inactive</option>
              </select>
            </div>

            {/* Buyer Identity Profile */}
            <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-3">
              <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-primary-800" />
                <span>Buyer Account Information</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Company</span>
                  <span className="font-bold text-neutral-900">{selectedInquiryForDrawer.buyer?.company || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Contact Person</span>
                  <span className="font-semibold text-neutral-800">{selectedInquiryForDrawer.buyer?.name}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Destination Country</span>
                  <span className="font-semibold text-neutral-800">{selectedInquiryForDrawer.buyer?.country || 'International'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Email</span>
                  <a href={`mailto:${selectedInquiryForDrawer.buyer?.email}`} className="text-primary-800 underline truncate block">
                    {selectedInquiryForDrawer.buyer?.email}
                  </a>
                </div>
                {selectedInquiryForDrawer.buyer?.phone && (
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Phone</span>
                    <span className="font-mono text-neutral-800">{selectedInquiryForDrawer.buyer?.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Commodities & Packaging Specs */}
            <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-3">
              <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary-800" />
                <span>Commodities Requested</span>
              </h4>
              {selectedInquiryForDrawer.items?.length > 0 ? (
                <div className="space-y-2">
                  {selectedInquiryForDrawer.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-neutral-900">{item.productName}</span>
                        {item.targetPrice && (
                          <span className="text-[10px] text-neutral-500 block">Target: ${item.targetPrice}</span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-primary-900 bg-white px-2 py-0.5 rounded border border-neutral-200 shadow-2xs">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-400 italic">Custom specification request without line items.</p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Requested Incoterm</span>
                  <span className="font-mono font-bold text-neutral-900">{selectedInquiryForDrawer.incoterm || 'CIF'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Discharge Port</span>
                  <span className="font-medium text-neutral-800">{selectedInquiryForDrawer.portOfDischarge || 'Not Specified'}</span>
                </div>
              </div>
            </div>

            {/* AI Assistant Quick Trigger */}
            <div className="p-4 bg-primary-950 text-white rounded-xl border border-primary-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs flex items-center gap-1.5 text-white">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
                  <span>AI Negotiation Assistant</span>
                </span>
                <button
                  onClick={() => handleOpenAiAssistant(selectedInquiryForDrawer)}
                  className="px-2.5 py-1 rounded bg-white hover:bg-neutral-100 text-black font-bold text-[10px] transition-colors"
                >
                  Generate Nudge
                </button>
              </div>
              <p className="text-[11px] text-neutral-300">
                Draft a commercial WhatsApp nudge or formal email quotation follow-up tailored to this buyer.
              </p>
            </div>
          </div>
        )}
      </AdminDrawer>

      {/* Schedule Follow-up Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
              <h3 className="font-serif text-base font-bold text-neutral-900">
                Schedule Commercial Outreach
              </h3>
              <button
                onClick={() => setTaskModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createTaskMutation.mutate(taskFormData);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Company / Importer Name *</label>
                <input
                  type="text"
                  required
                  value={taskFormData.company}
                  onChange={(e) => setTaskFormData({ ...taskFormData, company: e.target.value })}
                  placeholder="e.g. EuroFoods Import GmbH"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-800 focus:bg-white text-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Follow-up Action Summary *</label>
                <input
                  type="text"
                  required
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  placeholder="e.g. Send proforma revision with revised CFR Rotterdam ocean freight"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-800 focus:bg-white text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Contact Channel</label>
                  <select
                    value={taskFormData.taskType}
                    onChange={(e) => setTaskFormData({ ...taskFormData, taskType: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-800 focus:bg-white text-neutral-900"
                  >
                    <option value="whatsapp">WhatsApp Message</option>
                    <option value="email">Commercial Email</option>
                    <option value="call">Phone Call</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-800 focus:bg-white text-neutral-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setTaskModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={createTaskMutation.isPending}
                >
                  Save Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Follow-up Nudge Modal */}
      {aiFollowUpModalOpen && activeInquiryForAi && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-neutral-900">
                    AI Commercial Negotiation Nudge
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Drafted for {activeInquiryForAi.buyer?.company || activeInquiryForAi.buyer?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiFollowUpModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAiDraftChannel('whatsapp');
                  aiFollowUpMutation.mutate({ inquiryId: activeInquiryForAi._id, channel: 'whatsapp' });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  aiDraftChannel === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                WhatsApp Short Nudge
              </button>
              <button
                onClick={() => {
                  setAiDraftChannel('email');
                  aiFollowUpMutation.mutate({ inquiryId: activeInquiryForAi._id, channel: 'email' });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  aiDraftChannel === 'email'
                    ? 'bg-primary-900 text-white shadow-2xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Formal Email Follow-up
              </button>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-800 font-sans leading-relaxed min-h-[120px] max-h-60 overflow-y-auto whitespace-pre-wrap">
              {aiFollowUpMutation.isPending ? (
                <div className="py-8 text-center text-neutral-400 flex flex-col items-center gap-2">
                  <Sparkles className="w-5 h-5 text-neutral-800 animate-spin" />
                  <span>Synthesizing commercial follow-up tone...</span>
                </div>
              ) : (
                aiGeneratedText || 'Select channel above to draft tailored nudge message.'
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <button
                onClick={() => handleCopy(aiGeneratedText)}
                disabled={!aiGeneratedText}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {copiedDraft ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setAiFollowUpModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SalesDesk;
