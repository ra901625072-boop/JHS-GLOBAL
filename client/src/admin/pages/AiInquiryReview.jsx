import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Plus,
  RefreshCw,
  Check,
  X,
  FileText,
  ShieldAlert,
  HelpCircle,
  Eye,
  MessageSquare,
} from 'lucide-react';
import {
  fetchAiChatAuditLogs,
  fetchRepeatedUnknowns,
  resolveAiChatAuditLog,
} from '../api';

export const AiInquiryReview = () => {
  const [logs, setLogs] = useState([]);
  const [repeatedUnknowns, setRepeatedUnknowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'needs_human' | 'low_confidence' | 'unhelpful' | 'resolved'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntent, setSelectedIntent] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [resolveNote, setResolveNote] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const params = {
        page,
        limit: 15,
        search: searchTerm || undefined,
        intent: selectedIntent || undefined,
      };

      if (activeTab === 'needs_human') {
        params.needsHuman = true;
        params.isResolved = false;
      } else if (activeTab === 'low_confidence') {
        params.lowConfidence = true;
        params.isResolved = false;
      } else if (activeTab === 'unhelpful') {
        params.rating = 'unhelpful';
      } else if (activeTab === 'resolved') {
        params.isResolved = true;
      }

      const [logsRes, repeatedRes] = await Promise.all([
        fetchAiChatAuditLogs(params),
        fetchRepeatedUnknowns(),
      ]);

      setLogs(logsRes.logs || []);
      setTotalPages(logsRes.totalPages || 1);
      setTotalCount(logsRes.total || 0);
      setRepeatedUnknowns(repeatedRes || []);
    } catch (err) {
      console.error('Failed to load AI audit logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, activeTab, selectedIntent]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleResolve = async (id) => {
    try {
      setResolvingId(id);
      await resolveAiChatAuditLog(id, { resolvedNote: resolveNote || 'Fact verified or added by staff' });
      setResolveNote('');
      setSelectedLog(null);
      await loadData();
    } catch (err) {
      alert(`Failed to resolve inquiry: ${err.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  // KPI Calculations
  const urgentRepeated = repeatedUnknowns.filter((r) => r.alert);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-700" />
            AI Inquiries & Knowledge Gap Review
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Monitor real buyer inquiries, identify missing specifications, and train the export assistant.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary-800' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/company-knowledge"
            className="px-3 py-1.5 rounded-lg bg-primary-900 hover:bg-primary-950 text-accent-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Company Knowledge Base</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Total Queries Logged
          </span>
          <span className="text-2xl font-black text-neutral-900 mt-1 block">
            {totalCount}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            Filtered across current view
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Escalated to Desk
          </span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {logs.filter((l) => l.needsHuman && !l.isResolved).length}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            Awaiting human confirmation
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Repeated Unknowns
          </span>
          <span className="text-2xl font-black text-red-600 mt-1 block">
            {repeatedUnknowns.length}
          </span>
          <span className="text-[11px] text-red-600 font-medium mt-0.5 block">
            {urgentRepeated.length} urgent alerts (3+ times)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Knowledge Gaps
          </span>
          <span className="text-2xl font-black text-primary-900 mt-1 block">
            {logs.filter((l) => l.confidence < 0.75).length}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            Low-confidence inquiries
          </span>
        </div>
      </div>

      {/* Repeated Unknown Questions Alert Box */}
      {repeatedUnknowns.length > 0 && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Repeated Unknown Questions ({repeatedUnknowns.length} topics detected)
              </h2>
            </div>
            <span className="text-[10px] font-medium text-amber-800">
              Add missing facts to prevent future buyer escalations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {repeatedUnknowns.slice(0, 6).map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-amber-200 rounded-lg p-3 text-xs flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                      {item.intent}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.alert
                          ? 'bg-red-100 text-red-800 animate-pulse'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      Asked {item.count}×
                    </span>
                  </div>
                  <p className="font-semibold text-neutral-900 line-clamp-2">
                    "{item.originalMessage}"
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400">
                    {new Date(item.lastSeenAt).toLocaleDateString()}
                  </span>
                  <Link
                    to="/admin/company-knowledge"
                    className="text-[11px] font-bold text-primary-900 hover:text-accent-600 flex items-center gap-1"
                  >
                    <span>+ Add Fact</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-neutral-200/90 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-3.5 border-b border-neutral-200/80 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Inquiries' },
              { id: 'needs_human', label: 'Escalated / Needs Fact' },
              { id: 'low_confidence', label: 'Low Confidence (<75%)' },
              { id: 'unhelpful', label: 'Unhelpful Rating' },
              { id: 'resolved', label: 'Resolved' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-200/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Intent Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedIntent}
              onChange={(e) => {
                setSelectedIntent(e.target.value);
                setPage(1);
              }}
              className="text-xs px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-700 focus:outline-none focus:ring-1 focus:ring-primary-800"
            >
              <option value="">All Intents</option>
              <option value="product_spec">Product Specs</option>
              <option value="certifications">Certifications</option>
              <option value="pricing_moq">Pricing & MOQ</option>
              <option value="sample">Samples</option>
              <option value="shipping_logistics">Shipping & Logistics</option>
              <option value="company_about">Company About</option>
              <option value="compliance_regulatory">Regulatory</option>
              <option value="off_topic">Off Topic</option>
              <option value="abuse">Security / Abuse</option>
            </select>

            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs pl-8 pr-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary-800 w-44 sm:w-52"
              />
            </form>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-primary-800 border-t-transparent rounded-full animate-spin" />
            <span>Loading inquiry audit logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            No inquiry logs found matching current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-100/60 border-b border-neutral-200 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  <th className="py-2.5 px-4">Date / Time</th>
                  <th className="py-2.5 px-4">Buyer Inquiry</th>
                  <th className="py-2.5 px-4">Intent</th>
                  <th className="py-2.5 px-4">Confidence</th>
                  <th className="py-2.5 px-4">Grounded Facts</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Feedback</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {logs.map((log) => {
                  const confidenceNum = Number(log.confidence) || 0;
                  const isHighConf = confidenceNum >= 0.9;
                  const isMedConf = confidenceNum >= 0.75 && confidenceNum < 0.9;

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="py-3 px-4 text-neutral-400 whitespace-nowrap text-[11px]">
                        {new Date(log.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        <span className="text-neutral-300">
                          {new Date(log.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs sm:max-w-md">
                        <span className="font-medium text-neutral-900 block truncate">
                          {log.message}
                        </span>
                        {log.pageContext?.slug && (
                          <span className="text-[10px] text-primary-800 mt-0.5 block truncate">
                            PDP: /{log.pageContext.slug}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700">
                          {log.intent}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isHighConf
                              ? 'bg-emerald-50 text-emerald-700'
                              : isMedConf
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {Math.round(confidenceNum * 100)}%
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[11px] text-neutral-600 font-medium">
                          {Array.isArray(log.usedFactIds) && log.usedFactIds.length > 0 ? (
                            <span>{log.usedFactIds.length} fact cited</span>
                          ) : (
                            <span className="text-neutral-400">0 facts (General)</span>
                          )}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.isResolved ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Resolved
                          </span>
                        ) : log.needsHuman ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Needs Fact
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">Answered</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.feedbackRating === 'helpful' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                            <ThumbsUp className="w-3 h-3" /> Helpful
                          </span>
                        ) : log.feedbackRating === 'unhelpful' ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-medium text-[11px]">
                            <ThumbsDown className="w-3 h-3" /> Unhelpful
                          </span>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="p-1 rounded text-neutral-400 hover:text-primary-850 hover:bg-neutral-100"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!log.isResolved && (
                            <button
                              type="button"
                              onClick={() => handleResolve(log.id)}
                              disabled={resolvingId === log.id}
                              className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-semibold"
                              title="Mark resolved"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-neutral-200/80 bg-neutral-50/50 flex items-center justify-between text-xs text-neutral-500">
            <span>
              Page {page} of {totalPages} ({totalCount} total inquiries)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-neutral-200 bg-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 rounded border border-neutral-200 bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inquiry Detail Drawer / Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-neutral-900/50 z-50 flex items-center justify-end backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-primary-950 text-white flex items-center justify-between border-b border-primary-800 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Inquiry Audit Record #{selectedLog.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-neutral-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Visitor Question */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Visitor Query
                </span>
                <p className="text-sm font-semibold text-neutral-900">
                  "{selectedLog.message}"
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-neutral-500">
                  <span>Intent: <strong className="text-neutral-800">{selectedLog.intent}</strong></span>
                  <span>Confidence: <strong className="text-neutral-800">{Math.round(selectedLog.confidence * 100)}%</strong></span>
                  {selectedLog.pageContext?.slug && (
                    <span>Page: <strong className="text-neutral-800">/{selectedLog.pageContext.slug}</strong></span>
                  )}
                </div>
              </div>

              {/* Generated Answer */}
              <div className="bg-white border border-neutral-200 rounded-lg p-3 space-y-2 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Ground-Truth Model Response
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                    [AI GENERATED SUGGESTION — REQUIRES HUMAN APPROVAL]
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-neutral-800 whitespace-pre-wrap">
                  {selectedLog.answer}
                </p>
              </div>

              {/* Cited Fact IDs */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Cited Fact Ledger IDs
                </span>
                {Array.isArray(selectedLog.usedFactIds) && selectedLog.usedFactIds.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLog.usedFactIds.map((id, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 font-mono text-[10px] border border-blue-200"
                      >
                        {id}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-400 italic">No specific fact IDs cited (general answer or unknown).</p>
                )}
              </div>

              {/* Suggested Action & Escalation */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 rounded-lg border border-neutral-200 bg-neutral-50">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block">Needs Human?</span>
                  <span className={`text-xs font-bold ${selectedLog.needsHuman ? 'text-amber-700' : 'text-neutral-700'}`}>
                    {selectedLog.needsHuman ? 'Yes — Escalated' : 'No'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-neutral-200 bg-neutral-50">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block">Suggested Action</span>
                  <span className="text-xs font-bold text-neutral-800 uppercase">
                    {selectedLog.suggestedAction || 'none'}
                  </span>
                </div>
              </div>

              {/* Resolve Section */}
              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Resolve Inquiry / Add Knowledge
                </span>
                <textarea
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="Notes (e.g., Added bulk density specification to company knowledge base)..."
                  rows={2}
                  className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-800"
                />
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handleResolve(selectedLog.id)}
                    disabled={resolvingId === selectedLog.id}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark as Resolved</span>
                  </button>
                  <Link
                    to="/admin/company-knowledge"
                    className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Turn into Fact</span>
                  </Link>
                  <Link
                    to="/admin/faqs"
                    className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium text-xs flex items-center gap-1 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Turn into FAQ</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiInquiryReview;
