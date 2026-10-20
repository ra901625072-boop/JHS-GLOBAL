import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Settings as SettingsIcon,
  Building,
  Users,
  Activity,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Anchor,
  Mail,
  Phone,
  Clock,
  Database,
  Cpu,
  Server,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import {
  fetchCompanyProfileSettings,
  updateCompanyProfileSettings,
  fetchSystemHealth,
  flushServerCache,
} from '../api';
import Button from '../../components/ui/Button';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminStatusBadge,
  AdminSkeleton,
} from '../components';

const SETTINGS_SECTIONS = [
  {
    id: 'profile',
    label: 'Corporate Profile & Identity',
    sublabel: 'Statutory registrations, address & ports',
    icon: Building,
  },
  {
    id: 'founders',
    label: 'Founders & Leadership',
    sublabel: 'Approved executive team protocol',
    icon: Users,
  },
  {
    id: 'health',
    label: 'System Health & Diagnostics',
    sublabel: 'PostgreSQL pool, pgvector & runtime',
    icon: Activity,
  },
];

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'founders' | 'health'
  const [profile, setProfile] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [profData, healthData] = await Promise.all([
        fetchCompanyProfileSettings().catch(() => null),
        fetchSystemHealth().catch(() => null),
      ]);
      setProfile(profData);
      setHealth(healthData);
    } catch (err) {
      showNotification('Failed to load system settings and profile', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshHealth = async () => {
    try {
      setHealthLoading(true);
      const healthData = await fetchSystemHealth();
      setHealth(healthData);
      showNotification('System health diagnostics refreshed');
    } catch (err) {
      showNotification('Failed to query health diagnostics', 'error');
    } finally {
      setHealthLoading(false);
    }
  };

  const handleFlushCache = async () => {
    try {
      setActionLoading(true);
      await flushServerCache();
      showNotification('Server in-memory cache flushed successfully');
    } catch (err) {
      showNotification('Failed to flush server cache', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminSkeleton type="table" rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Helmet>
        <title>Settings & System Health | JHS GLOBAL Admin</title>
      </Helmet>

      {/* Symmetrical Page Header */}
      <AdminPageHeader
        breadcrumb={[
          { label: 'JHS GLOBAL Desk', to: '/admin' },
          { label: 'System Settings', to: '/admin/settings' },
        ]}
        title="Company Profile & System Settings"
        badge="JHS GLOBAL"
        description="Canonical single source of truth for Surat headquarters, founder dossiers, preferred departure ports, statutory licenses, and database diagnostics."
        actions={
          activeTab === 'health' && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshHealth}
                disabled={healthLoading}
                className="flex items-center space-x-1.5 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                <RotateCw className={`w-3.5 h-3.5 text-neutral-600 ${healthLoading ? 'animate-spin text-primary-800' : ''}`} />
                <span>Refresh Diagnostics</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFlushCache}
                disabled={actionLoading}
                className="flex items-center space-x-1.5 border-red-200 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Flush Cache</span>
              </Button>
            </div>
          )
        }
      />

      {/* Notifications Toast */}
      {notification && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm ${
            notification.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{notification.msg}</span>
          </div>
        </div>
      )}

      {/* Template 5: Left Section Navigation (3 cols) + Right Content Canvas (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section Navigation */}
        <aside className="lg:col-span-3 elevation-flat bg-white rounded-admin-lg border border-neutral-200 p-2 space-y-1">
          {SETTINGS_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-start justify-between ${
                  isActive
                    ? 'bg-primary-50/80 text-primary-950 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-1.5 rounded-md mt-0.5 ${
                      isActive
                        ? 'bg-primary-900 text-white'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block leading-tight">
                      {sec.label}
                    </span>
                    <span className="text-[11px] text-neutral-400 block mt-0.5 font-normal">
                      {sec.sublabel}
                    </span>
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-primary-900 shrink-0 mt-1" />
                )}
              </button>
            );
          })}
        </aside>

        {/* Right Content Canvas */}
        <div className="lg:col-span-9 space-y-6">
          {/* Tab 1: Corporate Profile & Statutory Identity */}
          {activeTab === 'profile' && profile && (
            <div className="space-y-6">
              {/* Primary Business Identity Card */}
              <div className="elevation-flat bg-white p-6 rounded-admin-lg border border-neutral-200 space-y-6">
                <div className="border-b border-neutral-100 pb-3">
                  <h3 className="font-semibold text-base text-neutral-900">
                    Primary Business Identification
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Statutory registration verified against Government of India registries.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                      Official Trade Name
                    </span>
                    <div className="text-sm font-bold text-neutral-900 mt-1 flex items-center gap-2">
                      <span>{profile.identity.tradeName}</span>
                      <AdminStatusBadge status="STATUTORY" variant="success" dot />
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                      Legal Entity / Constitution
                    </span>
                    <div className="text-sm font-medium text-neutral-900 mt-1">
                      {profile.identity.legalEntityName}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                      Registered Corporate Headquarters & Operating Address
                    </span>
                    <p className="text-xs text-neutral-800 mt-1 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-200 font-mono">
                      {profile.identity.registeredAddress}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                      Constitution of Business
                    </span>
                    <p className="text-xs text-neutral-800 mt-1">
                      {profile.identity.businessConstitution}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                      Commercial Turnaround Commitment
                    </span>
                    <p className="text-xs font-semibold text-emerald-800 mt-1">
                      {profile.logistics.turnaroundCommitment}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statutory Licenses Grid */}
              <div className="elevation-flat bg-white p-6 rounded-admin-lg border border-neutral-200 space-y-4">
                <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-base text-neutral-900">
                      Government Statutory Licenses & Credentials
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Verified export accreditations for agricultural, food, and chemical trade.
                    </p>
                  </div>
                  <AdminStatusBadge status="6 LICENSES" variant="info" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                      GSTIN
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-900 mt-1 block">
                      {profile.statutoryLicenses.gstin}
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-0.5 block">
                      Centre Range-V, Surat, Gujarat
                    </span>
                  </div>

                  <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                      DGFT IEC Code
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-900 mt-1 block">
                      {profile.statutoryLicenses.dgftIec}
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-0.5 block">
                      Joint DGFT Surat (Permanent)
                    </span>
                  </div>

                  <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                      MSME Udyam
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-900 mt-1 block">
                      {profile.statutoryLicenses.msmeUdyam}
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-0.5 block">
                      Micro Enterprise (NIC 46209)
                    </span>
                  </div>

                  <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                      FSSAI Central Food Safety
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-900 mt-1 block">
                      {profile.statutoryLicenses.fssaiCentralLicense}
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-0.5 block">
                      Central Authority (Valid 2026-27)
                    </span>
                  </div>

                  <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                      APEDA RCMC
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-900 mt-1 block">
                      {profile.statutoryLicenses.apedaRcmc}
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-0.5 block">
                      Ministry of Commerce & Industry
                    </span>
                  </div>

                  <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                      Spices Board of India CRES
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-900 mt-1 block">
                      {profile.statutoryLicenses.spicesBoardCres}
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-0.5 block">
                      Head Office Cochin (2025 – 2028)
                    </span>
                  </div>
                </div>
              </div>

              {/* Designated Departure Ports */}
              <div className="elevation-flat bg-white p-6 rounded-admin-lg border border-neutral-200 space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <h3 className="font-semibold text-base text-neutral-900">
                    Designated Departure Sea Ports & Maritime Hubs
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Primary container loading hubs for international FCL & LCL shipments.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {profile.logistics.primaryDeparturePorts.map((port) => (
                    <div
                      key={port.code}
                      className="p-4 rounded-admin-lg border border-neutral-200 bg-neutral-50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-primary-900 bg-white px-2 py-0.5 rounded border border-neutral-200">
                            {port.code}
                          </span>
                          <span className="text-xs font-semibold text-neutral-500 tabular-nums">
                            {port.distanceKm}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-neutral-900 mt-2">
                          {port.name}
                        </h4>
                        <p className="text-xs text-neutral-500">
                          {port.city}, {port.state}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-neutral-200 text-[11px] text-neutral-600">
                        {port.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Trade Contact Channels */}
              <div className="elevation-flat bg-white p-6 rounded-admin-lg border border-neutral-200 space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <h3 className="font-semibold text-base text-neutral-900">
                    Official Trade Desk Contact Channels
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Client confirmed and pending communication lines.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-admin-lg border border-amber-200 bg-amber-50/50">
                    <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
                      Inquiries Email
                    </span>
                    <span className="text-xs font-semibold text-neutral-900 mt-1 block font-mono">
                      {profile.contacts.officialEmail}
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-1 block">
                      TODO(client): Masked on FoSCoS portal; client confirmation pending.
                    </span>
                  </div>

                  <div className="p-4 rounded-admin-lg border border-amber-200 bg-amber-50/50">
                    <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
                      Official Phone
                    </span>
                    <span className="text-xs font-semibold text-neutral-900 mt-1 block font-mono">
                      {profile.contacts.tradePhone}
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-1 block">
                      TODO(client): Client confirmation pending.
                    </span>
                  </div>

                  <div className="p-4 rounded-admin-lg border border-emerald-200 bg-emerald-50/50">
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                      Trade WhatsApp Line
                    </span>
                    <span className="text-xs font-semibold text-neutral-900 mt-1 block font-mono">
                      {profile.contacts.tradeWhatsApp}
                    </span>
                    <span className="text-[11px] text-emerald-700 mt-1 block">
                      Active website RFQ widget integration.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Founders & Leadership Dossiers */}
          {activeTab === 'founders' && profile && (
            <div className="space-y-6">
              <div className="elevation-flat bg-white p-6 rounded-admin-lg border border-neutral-200">
                <div className="border-b border-neutral-100 pb-3 mb-6">
                  <h3 className="font-semibold text-base text-neutral-900">
                    Executive Leadership Team
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    The three founders and managing directors of JHS GLOBAL in approved protocol order.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {profile.founders.map((founder, idx) => (
                    <div
                      key={founder.id}
                      className="bg-neutral-50 p-5 rounded-admin-lg border border-neutral-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="w-7 h-7 rounded-full bg-primary-900 text-white font-bold text-xs flex items-center justify-center font-mono">
                            0{idx + 1}
                          </span>
                          <AdminStatusBadge status="VERIFIED" variant="success" dot />
                        </div>

                        <h4 className="text-base font-semibold text-neutral-900">
                          {founder.name}
                        </h4>
                        <span className="text-xs font-semibold text-primary-900 block mt-0.5">
                          {founder.designation}
                        </span>
                        <span className="text-[11px] text-neutral-500 block mt-1">
                          Origin: {founder.origin}
                        </span>

                        <p className="text-xs text-neutral-600 mt-3 leading-relaxed border-t border-neutral-200 pt-3">
                          {founder.roleDescription}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: System Health & Diagnostics */}
          {activeTab === 'health' && health && (
            <div className="space-y-6">
              {/* Database & Pool Health */}
              <div className="elevation-flat bg-white p-6 rounded-admin-lg border border-neutral-200 space-y-4">
                <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-base text-neutral-900">
                      Database & PostgreSQL Pool Health
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      AWS Supabase remote pooler connectivity and vector extension status.
                    </p>
                  </div>
                  <AdminStatusBadge
                    status={health.database.status === 'connected' ? 'CONNECTED' : 'DEGRADED'}
                    variant={health.database.status === 'connected' ? 'success' : 'danger'}
                    dot
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                      Database Engine
                    </span>
                    <span className="text-xs font-semibold text-neutral-900 mt-1 block">
                      {health.database.engine}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono mt-0.5 block truncate">
                      {health.database.host}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                      pgvector Vector Store
                    </span>
                    <span className="text-xs font-semibold text-primary-900 mt-1 block">
                      {health.database.vectorExtension}
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-0.5 block">
                      PostgreSQL RAG indexing enabled
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                      Connection Pool
                    </span>
                    <span className="text-xs font-semibold text-neutral-900 mt-1 block font-mono">
                      Max: {health.database.pool.max} | Idle: {health.database.pool.idle}ms
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-0.5 block">
                      Acquire timeout: {health.database.pool.acquire}ms
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Counters */}
              <div className="elevation-flat bg-white p-6 rounded-admin-lg border border-neutral-200 space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <h3 className="font-semibold text-base text-neutral-900">
                    Core Data Entities & Table Counters
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Live row counts across operational business modules.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.entries(health.tables).map(([table, count]) => (
                    <div key={table} className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block truncate">
                        {table}
                      </span>
                      <span className="text-lg font-bold text-neutral-900 mt-0.5 block tabular-nums">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Runtime Environment */}
              <div className="elevation-flat bg-white p-6 rounded-admin-lg border border-neutral-200 space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <h3 className="font-semibold text-base text-neutral-900">
                    Node.js Server Runtime Environment
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Process metrics, memory footprint, and server uptime.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50">
                    <span className="text-xs text-neutral-500 block">Node Version</span>
                    <span className="font-mono text-xs font-bold text-neutral-900 mt-0.5 block">
                      {health.server.nodeVersion} ({health.server.arch})
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50">
                    <span className="text-xs text-neutral-500 block">Server Uptime</span>
                    <span className="font-mono text-xs font-bold text-neutral-900 mt-0.5 block tabular-nums">
                      {Math.floor(health.server.uptimeSeconds / 60)} minutes
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50">
                    <span className="text-xs text-neutral-500 block">Heap Memory</span>
                    <span className="font-mono text-xs font-bold text-neutral-900 mt-0.5 block tabular-nums">
                      {health.server.memory.heapUsedMb} MB / {health.server.memory.heapTotalMb} MB
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50">
                    <span className="text-xs text-neutral-500 block">Environment</span>
                    <span className="font-mono text-xs font-bold text-primary-900 uppercase mt-0.5 block">
                      {health.server.environment}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
