import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Inbox,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  Send,
  Eye,
  FileText,
  Ship,
  Sparkles,
  Globe,
  RotateCcw,
  Users,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Package,
} from 'lucide-react';
import { fetchAdminDashboard, fetchAiSalesInsights } from '../api';
import AdminStatCard from '../components/AdminStatCard';
import AdminStatusBadge from '../components/AdminStatusBadge';
import AdminTableShell from '../components/AdminTableShell';
import Reveal from '../../components/ui/Reveal';
import AnimatedCounter from '../../components/ui/AnimatedCounter';

export const Dashboard = () => {
  const [aiReport, setAiReport] = useState('');
  const [aiMetrics, setAiMetrics] = useState(null);

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboard,
    refetchInterval: 30000,
  });

  const aiInsightsMutation = useMutation({
    mutationFn: (q) => fetchAiSalesInsights(q),
    onSuccess: (data) => {
      setAiReport(data.insights);
      if (data.metricsSummary) {
        setAiMetrics(data.metricsSummary);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-neutral-200/60 rounded-lg w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-neutral-200/60 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-neutral-200/60 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">Failed to load operations dashboard. Please check network connection.</span>
      </div>
    );
  }

  const { inquiries, operations = {}, products, samples } = metrics;
  const statusCounts = inquiries?.byStatus || {};

  return (
    <>
      <Helmet>
        <title>Commercial Operations Command Center — Admin Suite</title>
      </Helmet>

      {/* Header Bar */}
      <Reveal direction="up" distance={16} duration={0.5} className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
              <span>EXPORT COMMAND BRIDGE • 48H SLA DISPATCH</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Commercial Export Operations Center
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
              Real-time tracking of international RFQ lead capture, proforma pipelines, active container consignments, and predictive AI analytics.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/admin/sales-desk"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg shadow-subtle hover:shadow-card transition-all active:scale-[0.98]"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sales Desk</span>
            </Link>
            <Link
              to="/admin/inquiries"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-cta-500 hover:bg-cta-600 text-white text-xs font-semibold rounded-lg shadow-subtle hover:shadow-card transition-all active:scale-[0.98]"
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Inquiries Desk</span>
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Urgent 48h SLA Operational Alert */}
      {operations.urgentSlaLeads > 0 && (
        <Reveal direction="up" distance={12} duration={0.4} className="mb-4">
          <div className="p-3.5 bg-gradient-to-r from-rose-500/15 via-rose-500/5 to-transparent border border-rose-300 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs animate-pulse">
                !
              </span>
              <span className="text-rose-950 font-medium">
                <strong>{operations.urgentSlaLeads} RFQs Awaiting Immediate Response (&le; 12h or Overdue):</strong> JHS GLOBAL 48-hour commercial SLA requires timely quote dispatch to international buyers.
              </span>
            </div>
            <Link
              to="/admin/inquiries"
              className="inline-flex items-center gap-1 font-bold text-rose-900 hover:text-rose-700 underline text-xs shrink-0"
            >
              <span>Triage Inquiries Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Reveal>
      )}

      {/* Urgent Operational Outreach Alert */}
      {operations.pendingFollowups > 0 && (
        <Reveal direction="up" distance={12} duration={0.4} className="mb-6">
          <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                !
              </span>
              <span className="text-amber-950 font-medium">
                <strong>{operations.pendingFollowups} Action Reminders Due Today:</strong> Scheduled buyer outreach or negotiation touchpoints require commercial desk resolution.
              </span>
            </div>
            <Link
              to="/admin/sales-desk"
              className="inline-flex items-center gap-1 font-bold text-amber-900 hover:text-amber-700 underline text-xs shrink-0"
            >
              <span>Resolve in Sales Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Reveal>
      )}

      {/* Hero KPI Stat Strip (4 Strategic Cards with Staggered Cascading Entrance) */}
      <Reveal cascade stagger={0.06} distance={18} duration={0.55} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard
          variant="dark"
          title="Pipeline Booking Value"
          value={`$${Number(operations.totalRevenue || 0).toLocaleString()}`}
          subtitle="Total proforma value across active deals"
          icon={DollarSign}
          trend={{ value: '18.4%', isPositive: true, label: 'MoM' }}
          badge="USD"
        />

        <AdminStatCard
          title="New Inbound RFQs"
          value={operations.newInquiries || inquiries?.new || 0}
          subtitle="Awaiting sales team qualification"
          icon={Inbox}
          trend={{ value: '12.5%', isPositive: true, label: 'this week' }}
          badge="High Intent"
        />

        <AdminStatCard
          title="Active Proformas Issued"
          value={operations.quotesSent || 0}
          subtitle="Binding quotations under review"
          icon={FileText}
          trend={{ value: `${operations.conversionRate || 0}%`, isPositive: true, label: 'win rate' }}
        />

        <AdminStatCard
          title="Consignments In Transit"
          value={operations.ordersInProcess || 0}
          subtitle="Ocean shipments & customs clearance"
          icon={Ship}
          badge="Port Mundra"
        />
      </Reveal>

      {/* Secondary Operational Flow Row */}
      <Reveal cascade stagger={0.04} distance={12} duration={0.45} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-neutral-200/90 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Follow-ups Due Today
            </span>
            <div className="text-xl font-serif font-bold text-amber-700 mt-1">
              <AnimatedCounter value={operations.pendingFollowups || 0} duration={1.0} />
            </div>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">Scheduled tasks</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Awaiting Buyer Response
            </span>
            <div className="text-xl font-serif font-bold text-sky-700 mt-1">
              <AnimatedCounter value={operations.awaitingReply || 0} duration={1.0} />
            </div>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">Proformas sent</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-700">
            <Send className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Orders Confirmed / Won
            </span>
            <div className="text-xl font-serif font-bold text-emerald-700 mt-1">
              <AnimatedCounter value={operations.ordersConfirmed || 0} duration={1.0} />
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Closed contracts</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Registered Overseas Buyers
            </span>
            <div className="text-xl font-serif font-bold text-primary-900 mt-1">
              <AnimatedCounter value={operations.totalCustomers || 0} duration={1.0} />
            </div>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">Verified accounts</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary-50 border border-primary-200/60 flex items-center justify-center text-primary-800">
            <Users className="w-4 h-4" />
          </div>
        </div>
      </Reveal>

      {/* AI Strategic Intelligence & Geographic Market Briefing */}
      <Reveal direction="up" distance={18} duration={0.5} className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Executive AI Briefing */}
        <div className="lg:col-span-2 relative rounded-xl bg-gradient-to-br from-[#06180E] via-[#0A2619] to-[#04120A] text-white p-6 shadow-card border border-primary-800 overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white tracking-wide">
                    Executive AI Commercial Intelligence
                  </h3>
                  <p className="text-xs text-neutral-300">
                    Neural analysis synthesized from live buyer RFQs, destination ports, and container velocity
                  </p>
                </div>
              </div>

              <button
                onClick={() => aiInsightsMutation.mutate()}
                disabled={aiInsightsMutation.isPending}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${aiInsightsMutation.isPending ? 'animate-spin' : ''}`} />
                <span>{aiInsightsMutation.isPending ? 'Analyzing Leads...' : 'Generate Fresh Insights'}</span>
              </button>
            </div>

            {aiMetrics && (
              <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-full font-mono">
                  ⚡ Avg Response SLA: {aiMetrics.avgResponseTimeHours}h
                </span>
                <span className="bg-sky-950/80 border border-sky-500/40 text-sky-300 px-2.5 py-1 rounded-full font-mono">
                  📈 Pipeline Win Rate: {aiMetrics.conversionRate}%
                </span>
                <span className="bg-neutral-900 border border-neutral-700 text-neutral-300 px-2.5 py-1 rounded-full font-mono">
                  📦 Inquiries Evaluated: {aiMetrics.totalInquiries}
                </span>
              </div>
            )}

            <div className="bg-black/40 rounded-lg p-4 border border-white/10 text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans max-h-52 overflow-y-auto">
              {aiReport ? (
                <div className="whitespace-pre-wrap">{aiReport}</div>
              ) : (
                <div className="text-neutral-400 italic">
                  💡 Click <strong>"Generate Fresh Insights"</strong> to evaluate all incoming buyer requests, detect high-demand commodities (e.g. Cumin, Dehydrated Onion, Sesame Seeds), and flag overdue quotations.
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
            <span>Grounding: Live PostgreSQL Export Catalogue & RFQs</span>
            <span className="text-neutral-300 font-medium">Enterprise Security & Compliance Guardrails</span>
          </div>
        </div>

        {/* Top Destination Markets Breakdown with Progress Visualizer */}
        <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base font-bold text-neutral-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary-800" />
                <span>Top Export Destinations</span>
              </h3>
              <span className="text-[11px] text-neutral-400">By RFQs received</span>
            </div>

            {operations.topCountries?.length > 0 ? (
              <div className="space-y-2.5">
                {(() => {
                  const maxLeads = Math.max(...operations.topCountries.map((c) => c.count || 1), 1);
                  return operations.topCountries.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70 hover:border-neutral-400 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-center font-mono text-neutral-400 font-semibold text-[11px]">
                            0{idx + 1}
                          </span>
                          <span className="font-semibold text-neutral-900">{c.country}</span>
                        </div>
                        <span className="font-mono font-bold text-primary-900 bg-white px-2 py-0.5 rounded border border-neutral-200 text-xs shadow-2xs">
                          {c.count} leads
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200/60 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.round(((c.count || 1) / maxLeads) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic py-4 text-center">
                No international buyer leads registered yet.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Total Registered Buyers:</span>
            <strong className="font-mono text-sm text-neutral-900">{operations.totalCustomers || 0}</strong>
          </div>
        </div>
      </Reveal>

      {/* Commercial Pipeline Distribution Strip */}
      <Reveal direction="up" distance={16} duration={0.45} className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-subtle mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neutral-800" />
            <h2 className="font-serif text-sm font-bold text-neutral-900">
              Commercial Deal Flow Distribution
            </h2>
          </div>
          <Link
            to="/admin/sales-desk"
            className="text-xs text-neutral-900 hover:text-black font-semibold flex items-center gap-1 group"
          >
            <span>Open Kanban Sales Desk</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
          {['new', 'in_review', 'quoted', 'sample_sent', 'negotiation', 'won', 'lost', 'spam'].map((statusKey) => {
            const count = statusCounts[statusKey] || 0;
            return (
              <div
                key={statusKey}
                className="p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/70 text-center hover:border-neutral-400 transition-colors"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 truncate">
                  {statusKey.replace(/_/g, ' ')}
                </div>
                <div className="font-serif text-xl font-bold text-neutral-900 mt-1">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* Recent Inquiries High-Density Table */}
      <Reveal direction="up" distance={20} duration={0.5}>
        <AdminTableShell
          title="Recent Inbound RFQ Dossiers"
          description="Overseas buyer inquiries logged from the public web portal requiring sales qualification"
          totalCount={inquiries?.recent?.length || 0}
          actions={
            <Link
              to="/admin/inquiries"
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:text-black group"
            >
              <span>View Complete Inbox</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          }
          empty={!inquiries?.recent || inquiries.recent.length === 0}
          emptyMessage="No buyer inquiries have arrived yet."
        >
          <table className="min-w-full divide-y divide-neutral-200 text-left text-xs">
            <thead className="bg-neutral-50/90 text-neutral-600 font-semibold border-b border-neutral-200">
              <tr>
                <th className="px-5 py-3">Reference No</th>
                <th className="px-5 py-3">Buyer & Company</th>
                <th className="px-5 py-3">Destination Country</th>
                <th className="px-5 py-3">Requested Commodities</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Trade Status</th>
                <th className="px-5 py-3">48H SLA Timer</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700 bg-white">
              {inquiries?.recent?.map((inq) => {
                const inqId = inq.id || inq._id;
                return (
                  <tr key={inqId || inq.referenceNo} className="hover:bg-primary-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-primary-900 whitespace-nowrap">
                      {inq.referenceNo}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-neutral-900">{inq.buyer?.name}</div>
                      <div className="text-neutral-500 text-[11px]">{inq.buyer?.company}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-neutral-800">
                      {inq.buyer?.country || 'International'}
                    </td>
                    <td className="px-5 py-3.5">
                      {inq.items?.length > 0 ? (
                        <div className="line-clamp-1 text-neutral-700">
                          {inq.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">Custom inquiry spec</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <AdminStatusBadge priority={inq.priority} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <AdminStatusBadge status={inq.status} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
                          inq.slaStatus === 'resolved'
                            ? 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                            : inq.slaStatus === 'breached'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                            : inq.slaStatus === 'critical'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                            : inq.slaStatus === 'warning'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>
                          {inq.slaStatus === 'resolved'
                            ? 'Resolved'
                            : inq.slaStatus === 'breached'
                            ? 'Breached'
                            : `${inq.slaRemainingHours ?? '--'}h rem`}
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/inquiries?id=${inqId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-neutral-100 hover:bg-primary-50 text-neutral-800 hover:text-primary-900 font-semibold border border-neutral-200 text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Dossier</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AdminTableShell>
      </Reveal>
    </>
  );
};

export default Dashboard;
