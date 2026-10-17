import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  History,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Clock,
  User,
  Globe,
  Layers,
  FileCode,
  ArrowRight,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import { fetchAdminAuditLogs } from '../api';
import DataTable from '../components/DataTable';
import AdminDrawer from '../components/AdminDrawer';
import { TableSkeleton } from '../components/AdminSkeleton';

const ACTION_COLORS = {
  create: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  update: 'bg-blue-50 text-blue-700 border-blue-200',
  delete: 'bg-rose-50 text-rose-700 border-rose-200',
  dispatch: 'bg-purple-50 text-purple-700 border-purple-200',
  login: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  toggle_active: 'bg-amber-50 text-amber-700 border-amber-200',
  reset_password: 'bg-orange-50 text-orange-700 border-orange-200',
  reindex: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const getActionColor = (action = '') => {
  const act = action.toLowerCase();
  for (const [key, cls] of Object.entries(ACTION_COLORS)) {
    if (act.includes(key)) return cls;
  }
  return 'bg-neutral-100 text-neutral-700 border-neutral-200';
};

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });

  // Detail Drawer State
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        entityType: entityFilter !== 'all' ? entityFilter : undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
      };
      const res = await fetchAdminAuditLogs(params);
      setLogs(res.logs || []);
      if (res.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: res.pagination.total,
          pages: res.pagination.pages,
        }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, entityFilter, actionFilter]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  // Handle open inspect drawer
  const handleInspect = (log) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = pagination.total || logs.length;
    const today = new Date().toDateString();
    const todayCount = logs.filter((l) => new Date(l.createdAt).toDateString() === today).length;
    const uniqueActors = new Set(logs.map((l) => l.userName).filter(Boolean)).size;
    const deletes = logs.filter((l) => l.action?.includes('delete')).length;
    return { total, todayCount, uniqueActors, deletes };
  }, [logs, pagination.total]);

  // Columns
  const columns = [
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      cell: (row) => {
        const d = new Date(row.createdAt);
        return (
          <div className="text-xs text-neutral-800 flex flex-col">
            <span className="font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-neutral-400" />
              {d.toLocaleDateString('en-GB')}
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Staff Actor',
      accessor: 'userName',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 flex items-center justify-center text-[11px] font-bold shrink-0">
            {row.userName ? row.userName[0].toUpperCase() : 'S'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-neutral-900 truncate">
              {row.userName || 'System / Batch'}
            </div>
            <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
              {row.userRole || 'system'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Action Verb',
      accessor: 'action',
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${getActionColor(
            row.action
          )}`}
        >
          {row.action}
        </span>
      ),
    },
    {
      header: 'Target Entity',
      accessor: 'entityType',
      cell: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-neutral-800 capitalize">{row.entityType}</span>
          {row.entityId && (
            <span className="ml-1 text-[11px] font-mono text-neutral-400">#{row.entityId}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Origin IP / Network',
      accessor: 'ipAddress',
      cell: (row) => (
        <div className="text-xs text-neutral-600 font-mono flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span>{row.ipAddress || 'Internal Local'}</span>
        </div>
      ),
    },
    {
      header: 'Snapshot',
      accessor: 'id',
      cell: (row) => (
        <button
          onClick={() => handleInspect(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Inspect Diff
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold text-neutral-900 tracking-tight">
              Compliance & Security Audit Trail
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldAlert className="w-3 h-3 text-emerald-600" />
              Immutable Ledger
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1 max-w-2xl">
            Chronological audit recording of all administrative operations, entity lifecycle mutations,
            role escalations, and dispatch events with sanitized JSON before/after snapshots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAuditLogs}
            className="p-2.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Total Audit Records
          </span>
          <p className="text-2xl font-serif font-bold text-neutral-900 mt-1">{metrics.total}</p>
          <span className="text-[11px] text-neutral-400 mt-0.5 block">Stored in database</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Today's Mutations
          </span>
          <p className="text-2xl font-serif font-bold text-emerald-900 mt-1">{metrics.todayCount}</p>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Logged in last 24h</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Active Staff Actors
          </span>
          <p className="text-2xl font-serif font-bold text-blue-900 mt-1">{metrics.uniqueActors}</p>
          <span className="text-[11px] text-neutral-400 mt-0.5 block">Distinct operators</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Deletion Events
          </span>
          <p className="text-2xl font-serif font-bold text-rose-900 mt-1">{metrics.deletes}</p>
          <span className="text-[11px] text-rose-600 mt-0.5 block">Soft deletion actions</span>
        </div>
      </div>

      {/* FilterBar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by actor, action verb, entity, or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          >
            <option value="all">All Entities</option>
            <option value="product">Products</option>
            <option value="category">Categories</option>
            <option value="certificate">Certificates</option>
            <option value="blog">Blog Articles</option>
            <option value="faq">FAQs</option>
            <option value="companyfact">Company Facts</option>
            <option value="inquiry">Inquiries / RFQ</option>
            <option value="sample">Samples</option>
            <option value="quotation">Quotations</option>
            <option value="user">Staff Users</option>
            <option value="settings">System Settings</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          >
            <option value="all">All Action Verbs</option>
            <option value="create">Creates</option>
            <option value="update">Updates</option>
            <option value="delete">Deletions</option>
            <option value="dispatch">Dispatches</option>
            <option value="toggle_active">Status Toggles</option>
            <option value="reset_password">Password Resets</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-xl border border-neutral-200">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-neutral-900 font-medium">{error}</p>
          <button
            onClick={loadAuditLogs}
            className="mt-3 text-sm text-neutral-600 underline hover:text-neutral-900"
          >
            Try reloading audit logs
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          pagination={{
            page: pagination.page,
            totalPages: pagination.pages,
            totalItems: pagination.total,
            onPageChange: (p) => setPagination((prev) => ({ ...prev, page: p })),
          }}
          emptyMessage="No audit records match your query."
        />
      )}

      {/* Inspect Snapshot Drawer */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Audit Mutation Inspector"
        subtitle={
          selectedLog
            ? `${selectedLog.action} on ${selectedLog.entityType} #${selectedLog.entityId || 'N/A'}`
            : 'Detail View'
        }
        badge={
          selectedLog && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${getActionColor(
                selectedLog.action
              )}`}
            >
              {selectedLog.action}
            </span>
          )
        }
        maxWidth="max-w-3xl"
        footer={
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        }
      >
        {selectedLog && (
          <div className="space-y-6">
            {/* Meta Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div>
                <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider block">
                  Staff Operator
                </span>
                <span className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  {selectedLog.userName || 'System'}
                  <span className="text-[10px] text-neutral-500 font-mono">
                    ({selectedLog.userRole || 'system'})
                  </span>
                </span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider block">
                  Origin IP & Network
                </span>
                <span className="text-sm font-mono text-neutral-800 flex items-center gap-1.5 mt-0.5">
                  <Globe className="w-3.5 h-3.5 text-neutral-500" />
                  {selectedLog.ipAddress || 'Internal Network'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider block">
                  Exact Timestamp
                </span>
                <span className="text-xs text-neutral-800 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  {new Date(selectedLog.createdAt).toLocaleString('en-GB')}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider block">
                  Browser / User Agent
                </span>
                <span
                  className="text-xs font-mono text-neutral-600 truncate block mt-0.5"
                  title={selectedLog.userAgent}
                >
                  {selectedLog.userAgent || 'API Direct'}
                </span>
              </div>
            </div>

            {/* Before / After Snapshot Diff */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-neutral-500" />
                Sanitized Mutation Snapshots
              </h4>

              {selectedLog.beforeSnapshot && (
                <div>
                  <span className="text-xs font-medium text-neutral-600 mb-1.5 block">
                    Before Mutation State:
                  </span>
                  <pre className="p-3 bg-neutral-900 text-neutral-200 rounded-lg text-xs font-mono overflow-x-auto max-h-56 admin-scrollbar border border-neutral-800">
                    {JSON.stringify(selectedLog.beforeSnapshot, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.afterSnapshot && (
                <div>
                  <span className="text-xs font-medium text-neutral-600 mb-1.5 block">
                    After Mutation State:
                  </span>
                  <pre className="p-3 bg-neutral-900 text-neutral-200 rounded-lg text-xs font-mono overflow-x-auto max-h-56 admin-scrollbar border border-neutral-800">
                    {JSON.stringify(selectedLog.afterSnapshot, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <span className="text-xs font-medium text-neutral-600 mb-1.5 block">
                    Operation Metadata:
                  </span>
                  <pre className="p-3 bg-neutral-50 text-neutral-800 rounded-lg text-xs font-mono overflow-x-auto max-h-48 admin-scrollbar border border-neutral-200">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {!selectedLog.beforeSnapshot &&
                !selectedLog.afterSnapshot &&
                (!selectedLog.metadata || Object.keys(selectedLog.metadata).length === 0) && (
                  <div className="p-4 bg-neutral-50 rounded-lg text-center text-xs text-neutral-500 border border-neutral-200">
                    No state payload recorded for this specific administrative event.
                  </div>
                )}
            </div>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
};

export default AuditLogs;
