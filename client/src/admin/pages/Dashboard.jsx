import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Inbox,
  AlertCircle,
  ArrowRight,
  Clock,
  Eye,
  Globe,
  Package,
  FlaskConical,
  ShieldCheck,
} from 'lucide-react';
import { fetchAdminDashboard } from '../api';
import AdminStatCard from '../components/AdminStatCard';
import AdminStatusBadge from '../components/AdminStatusBadge';
import AdminPageHeader from '../components/AdminPageHeader';
import { CardGridSkeleton, TableSkeleton } from '../components/AdminSkeleton';
import AnimatedCounter from '../../components/ui/AnimatedCounter';

export const Dashboard = () => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboard,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-[#E5E7EB] rounded-admin-sm w-48 animate-pulse" />
        <CardGridSkeleton count={4} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-admin-md text-[#991B1B] flex items-center gap-3 text-xs sm:text-sm">
        <AlertCircle className="w-5 h-5 shrink-0 text-[#DC2626]" />
        <span className="font-medium">Failed to load operations dashboard. Please check server connection.</span>
      </div>
    );
  }

  const { inquiries, operations = {}, products, samples } = metrics || {};
  const statusCounts = inquiries?.byStatus || {};
  const totalInquiries = inquiries?.total || operations.newInquiries || 0;

  const pipelineStages = [
    { key: 'new', label: 'New Lead', color: 'bg-[#D97706]', count: statusCounts.new || 0 },
    { key: 'in_review', label: 'In Review', color: 'bg-[#0284C7]', count: statusCounts.in_review || 0 },
    { key: 'quoted', label: 'Quoted', color: 'bg-[#4F46E5]', count: statusCounts.quoted || 0 },
    { key: 'sample_sent', label: 'Sample Sent', color: 'bg-[#059669]', count: statusCounts.sample_sent || 0 },
    { key: 'won', label: 'Confirmed / Won', color: 'bg-[#15803D]', count: statusCounts.won || 0 },
    { key: 'spam', label: 'Filtered', color: 'bg-[#94A3B8]', count: statusCounts.spam || 0 },
  ];

  return (
    <>
      <Helmet>
        <title>Commercial Operations Dashboard — JHS GLOBAL Admin</title>
      </Helmet>

      {/* Standard Page Header */}
      <AdminPageHeader
        breadcrumb={[
          { label: 'Admin', to: '/admin' },
          { label: 'Overview' },
        ]}
        title="Operations Overview"
        description="Real-time telemetry tracking international RFQ leads, sample dispatch requests, and active export commodities."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-admin-sm bg-[#F1F3F5] border border-[var(--admin-border)] text-[var(--admin-text-primary)] text-[10px] font-semibold tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--admin-brand)]" />
            <span>48H SLA Active</span>
          </span>
        }
        actions={
          <Link
            to="/admin/inquiries"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--admin-brand)] hover:bg-[var(--admin-brand-hover)] text-white text-xs font-semibold rounded-admin-md transition-colors"
            style={{ transitionDuration: 'var(--admin-duration-micro)' }}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Inquiries Inbox</span>
          </Link>
        }
      />

      {/* Urgent 48h SLA Operational Alert Ribbon */}
      {operations.urgentSlaLeads > 0 && (
        <div className="mb-6 p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-admin-md flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-5 h-5 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
              !
            </span>
            <span className="text-[#991B1B] font-medium truncate">
              <strong>{operations.urgentSlaLeads} RFQs Awaiting Immediate Response (&le; 12h or Overdue):</strong> 48-hour commercial SLA requires quote dispatch.
            </span>
          </div>
          <Link
            to="/admin/inquiries"
            className="inline-flex items-center gap-1 font-semibold text-[#991B1B] hover:underline text-xs shrink-0"
          >
            <span>Triage Inquiries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Row 1: Core Website KPI Stat Strip (Equal Heights) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard
          title="Inbound RFQ Leads"
          value={totalInquiries}
          subtitle={`${inquiries?.new || 0} awaiting qualification`}
          icon={Inbox}
          trend={{ value: `${inquiries?.new || 0} new`, isPositive: true, label: 'pending' }}
          badge="RFQs"
        />

        <AdminStatCard
          title="Sample Requests"
          value={samples?.total || 0}
          subtitle="International buyer sample requests"
          icon={FlaskConical}
          trend={{ value: `${samples?.pending || 0} pending`, isPositive: true, label: 'dispatch' }}
          badge="Samples"
        />

        <AdminStatCard
          title="Active Commodities"
          value={products?.active || products?.total || 20}
          subtitle="Specifications published to portal"
          icon={Package}
          trend={{ value: '3 Divisions', isPositive: true, label: 'catalogue' }}
          badge="Products"
        />

        <AdminStatCard
          title="SLA Compliance Rate"
          value={`${operations.slaComplianceRate || 98}%`}
          subtitle="RFQ responses within 48-hour SLA"
          icon={ShieldCheck}
          badge="Target 100%"
        />
      </div>

      {/* Row 2: Pipeline Distribution (Horizontal Segmented Bar + Counts) */}
      <div className="bg-white border border-[var(--admin-border)] rounded-admin-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--admin-border-subtle)]">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-[var(--admin-text-muted)]" />
            <h2 className="text-sm font-bold text-[var(--admin-text-primary)]">
              Inquiry Pipeline Distribution
            </h2>
          </div>
          <Link
            to="/admin/inquiries"
            className="text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] font-medium flex items-center gap-1 group"
          >
            <span>View Full Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Proportional Segmented Progress Bar */}
        {totalInquiries > 0 && (
          <div className="w-full h-2 rounded-full overflow-hidden flex bg-[var(--admin-surface-subtle)] mb-4">
            {pipelineStages.map((stage) => {
              const pct = (stage.count / totalInquiries) * 100;
              if (pct <= 0) return null;
              return (
                <div
                  key={stage.key}
                  style={{ width: `${pct}%` }}
                  className={`${stage.color} h-full transition-all`}
                  title={`${stage.label}: ${stage.count} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {pipelineStages.map((stage) => (
            <div
              key={stage.key}
              className="p-3 rounded-admin-md border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-subtle)] text-center"
            >
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] truncate">
                <span className={`w-1.5 h-1.5 rounded-full ${stage.color}`} />
                <span>{stage.label}</span>
              </div>
              <div className="text-xl font-bold text-[var(--admin-text-primary)] mt-1 tabular-nums">
                <AnimatedCounter value={stage.count} duration={0.8} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Top Destination Markets */}
      {operations.topCountries?.length > 0 && (
        <div className="bg-white border border-[var(--admin-border)] rounded-admin-lg p-5 mb-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--admin-border-subtle)]">
            <h3 className="text-sm font-bold text-[var(--admin-text-primary)] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--admin-text-muted)]" />
              <span>Top Export Inbound Destinations</span>
            </h3>
            <span className="text-[11px] text-[var(--admin-text-muted)]">By RFQs received</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {operations.topCountries.slice(0, 5).map((c, idx) => (
              <div
                key={idx}
                className="p-3 rounded-admin-md bg-[var(--admin-surface-subtle)] border border-[var(--admin-border-subtle)] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[var(--admin-text-placeholder)] font-semibold text-xs">
                    0{idx + 1}
                  </span>
                  <span className="font-semibold text-[var(--admin-text-primary)] text-xs">{c.country}</span>
                </div>
                <span className="font-mono font-bold text-[var(--admin-text-primary)] bg-white px-2 py-0.5 rounded-admin-sm border border-[var(--admin-border)] text-xs">
                  {c.count} leads
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 4: Recent Inquiries Dossiers */}
      <div className="bg-white border border-[var(--admin-border)] rounded-admin-lg overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[var(--admin-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--admin-text-primary)]">Recent Inbound RFQ Dossiers</h3>
            <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
              Overseas buyer inquiries logged from the public web portal requiring commercial qualification
            </p>
          </div>
          <Link
            to="/admin/inquiries"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] group"
          >
            <span>View Complete Inbox ({inquiries?.recent?.length || 0})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {!inquiries?.recent || inquiries.recent.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--admin-text-muted)] italic">
            No buyer inquiries have arrived yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--admin-border-subtle)] text-left text-xs">
              <thead className="bg-[var(--admin-surface-subtle)] text-[var(--admin-text-muted)] font-semibold border-b border-[var(--admin-border)] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Reference No</th>
                  <th className="px-4 py-3">Buyer & Company</th>
                  <th className="px-4 py-3">Destination Country</th>
                  <th className="px-4 py-3">Requested Commodities</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Trade Status</th>
                  <th className="px-4 py-3">48H SLA Timer</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border-subtle)] text-[var(--admin-text-secondary)] bg-white">
                {inquiries.recent.map((inq) => {
                  const inqId = inq.id || inq._id;
                  return (
                    <tr
                      key={inqId || inq.referenceNo}
                      className="hover:bg-[var(--admin-surface-subtle)] transition-colors"
                      style={{ transitionDuration: 'var(--admin-duration-micro)' }}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[var(--admin-text-primary)] whitespace-nowrap">
                        {inq.referenceNo}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[var(--admin-text-primary)]">{inq.buyer?.name}</div>
                        <div className="text-[var(--admin-text-muted)] text-[11px]">{inq.buyer?.company}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-[var(--admin-text-secondary)]">
                        {inq.buyer?.country || 'International'}
                      </td>
                      <td className="px-4 py-3">
                        {inq.items?.length > 0 ? (
                          <div className="line-clamp-1 text-[var(--admin-text-secondary)]">
                            {inq.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                          </div>
                        ) : (
                          <span className="text-[var(--admin-text-placeholder)] italic">Custom inquiry spec</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <AdminStatusBadge priority={inq.priority} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <AdminStatusBadge status={inq.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-admin-sm text-[11px] font-mono font-medium border ${
                            inq.slaStatus === 'resolved'
                              ? 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E140]'
                              : inq.slaStatus === 'breached'
                              ? 'bg-[#FEE2E2] text-[#991B1B] border-[#EF444440] font-bold'
                              : inq.slaStatus === 'critical'
                              ? 'bg-[#FEE2E2] text-[#991B1B] border-[#EF444440]'
                              : inq.slaStatus === 'warning'
                              ? 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B40]'
                              : 'bg-[#D1FAE5] text-[#065F46] border-[#10B98140]'
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
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link
                          to={`/admin/inquiries?id=${inqId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-admin-md bg-white hover:bg-[var(--admin-surface-subtle)] text-[var(--admin-text-primary)] font-medium border border-[var(--admin-border)] text-xs transition-colors"
                          style={{ transitionDuration: 'var(--admin-duration-micro)' }}
                        >
                          <Eye className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />
                          <span>Dossier</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
