import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  Users,
  CreditCard,
  Activity,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Anchor,
  Mail,
  Phone,
  Clock,
  Database,
  Cpu,
  Server,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  fetchCompanyProfileSettings,
  updateCompanyProfileSettings,
  fetchSystemHealth,
  flushServerCache,
} from '../api';
import { TableSkeleton } from '../components/AdminSkeleton';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'founders' | 'banking' | 'health'
  const [profile, setProfile] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showMaskedBank, setShowMaskedBank] = useState(false);
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
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 border ${
            notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold text-neutral-900 tracking-tight">
              Company Profile & System Settings
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-900 text-white font-mono">
              JHS GLOBAL
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1 max-w-2xl">
            Canonical single source of truth for Surat headquarters, founder dossiers, preferred departure
            ports, statutory licenses, and database diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'health' && (
            <button
              onClick={refreshHealth}
              disabled={healthLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
              Refresh Diagnostics
            </button>
          )}
          {activeTab === 'health' && (
            <button
              onClick={handleFlushCache}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Flush Cache
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-200 gap-1 bg-white px-4 pt-2 rounded-t-xl border-t border-x border-neutral-200/80 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
          }`}
        >
          <Building className="w-4 h-4" />
          Corporate Profile & Statutory Identity
        </button>

        <button
          onClick={() => setActiveTab('founders')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'founders'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
          }`}
        >
          <Users className="w-4 h-4" />
          Founders & Leadership Dossiers
        </button>

        <button
          onClick={() => setActiveTab('banking')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'banking'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Bank & Trade Finance (Masked)
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'health'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          System Health & Diagnostics
        </button>
      </div>

      {/* Tab 1: Corporate Profile & Statutory Identity */}
      {activeTab === 'profile' && profile && (
        <div className="space-y-6">
          {/* Identity Grid */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                Primary Business Identification
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Statutory registration verified against Government of India registries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider block">
                  Official Trade Name
                </span>
                <div className="text-base font-bold text-neutral-900 mt-1 flex items-center gap-2">
                  <span>{profile.identity.tradeName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Statutory
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider block">
                  Legal Entity / Proprietorship
                </span>
                <div className="text-base font-medium text-neutral-900 mt-1">
                  {profile.identity.legalEntityName}
                </div>
              </div>

              <div className="md:col-span-2">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider block">
                  Registered Corporate Headquarters & Operating Address
                </span>
                <p className="text-sm text-neutral-800 mt-1 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                  {profile.identity.registeredAddress}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider block">
                  Constitution of Business
                </span>
                <p className="text-sm text-neutral-800 mt-1">
                  {profile.identity.businessConstitution}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider block">
                  Commercial Turnaround Commitment
                </span>
                <p className="text-sm font-semibold text-emerald-800 mt-1">
                  {profile.logistics.turnaroundCommitment}
                </p>
              </div>
            </div>
          </div>

          {/* Statutory Licenses Grid */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-900">
                  Government Statutory Licenses & Tax Credentials
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Verified export accreditations for agricultural, food, and chemical trade.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full">
                6 Verified Licenses
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-neutral-50/70 rounded-xl border border-neutral-200/80">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  GSTIN
                </span>
                <span className="font-mono text-sm font-bold text-neutral-900 mt-1 block">
                  {profile.statutoryLicenses.gstin}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Centre Range-V, Surat, Gujarat
                </span>
              </div>

              <div className="p-4 bg-neutral-50/70 rounded-xl border border-neutral-200/80">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  DGFT IEC Code
                </span>
                <span className="font-mono text-sm font-bold text-neutral-900 mt-1 block">
                  {profile.statutoryLicenses.dgftIec}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Joint DGFT Surat (Permanent)
                </span>
              </div>

              <div className="p-4 bg-neutral-50/70 rounded-xl border border-neutral-200/80">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  MSME Udyam
                </span>
                <span className="font-mono text-sm font-bold text-neutral-900 mt-1 block">
                  {profile.statutoryLicenses.msmeUdyam}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Micro Enterprise (NIC 46209)
                </span>
              </div>

              <div className="p-4 bg-neutral-50/70 rounded-xl border border-neutral-200/80">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  FSSAI Central Food Safety
                </span>
                <span className="font-mono text-sm font-bold text-neutral-900 mt-1 block">
                  {profile.statutoryLicenses.fssaiCentralLicense}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Central Licensing Authority (Valid 2026-27)
                </span>
              </div>

              <div className="p-4 bg-neutral-50/70 rounded-xl border border-neutral-200/80">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  APEDA RCMC
                </span>
                <span className="font-mono text-sm font-bold text-neutral-900 mt-1 block">
                  {profile.statutoryLicenses.apedaRcmc}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Ministry of Commerce & Industry
                </span>
              </div>

              <div className="p-4 bg-neutral-50/70 rounded-xl border border-neutral-200/80">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Spices Board of India CRES
                </span>
                <span className="font-mono text-sm font-bold text-neutral-900 mt-1 block">
                  {profile.statutoryLicenses.spicesBoardCres}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Head Office Cochin (2025 – 2028)
                </span>
              </div>
            </div>
          </div>

          {/* Departure Ports & Logistics */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                Designated Departure Sea Ports & Maritime Terminals
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Primary container loading hubs for international FCL & LCL shipments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.logistics.primaryDeparturePorts.map((port) => (
                <div
                  key={port.code}
                  className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {port.code}
                      </span>
                      <span className="text-xs font-semibold text-neutral-500">
                        {port.distanceKm}
                      </span>
                    </div>
                    <h4 className="font-serif text-base font-bold text-neutral-900 mt-2">
                      {port.name}
                    </h4>
                    <p className="text-xs text-neutral-500">
                      {port.city}, {port.state}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-neutral-200/60 text-[11px] text-neutral-600">
                    {port.type}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Channels */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                Official Trade Desk Contact Channels
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Client confirmed and pending communication lines.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40">
                <span className="text-xs font-medium text-amber-800 uppercase tracking-wider block">
                  Official Inquiries Email
                </span>
                <span className="text-sm font-semibold text-neutral-900 mt-1 block">
                  {profile.contacts.officialEmail}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Masked on FoSCoS portal; client confirmation pending.
                </span>
              </div>

              <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40">
                <span className="text-xs font-medium text-amber-800 uppercase tracking-wider block">
                  Official Trade Phone
                </span>
                <span className="text-sm font-semibold text-neutral-900 mt-1 block">
                  {profile.contacts.tradePhone}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Client confirmation pending.
                </span>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40">
                <span className="text-xs font-medium text-emerald-800 uppercase tracking-wider block">
                  Trade WhatsApp Line
                </span>
                <span className="text-sm font-semibold text-neutral-900 mt-1 block">
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
          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs">
            <div className="border-b border-neutral-100 pb-4 mb-6">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                Executive Leadership Team
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                The three founders and managing directors of JHS GLOBAL in approved protocol order.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profile.founders.map((founder, idx) => (
                <div
                  key={founder.id}
                  className="bg-neutral-50/70 p-5 rounded-xl border border-neutral-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center font-mono">
                        0{idx + 1}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    </div>

                    <h4 className="font-serif text-lg font-bold text-neutral-900">
                      {founder.name}
                    </h4>
                    <span className="text-xs font-semibold text-emerald-800 block mt-0.5">
                      {founder.designation}
                    </span>
                    <span className="text-[11px] text-neutral-500 block mt-1">
                      Origin: {founder.origin}
                    </span>

                    <p className="text-xs text-neutral-600 mt-3 leading-relaxed border-t border-neutral-200/60 pt-3">
                      {founder.roleDescription}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Bank & Trade Finance (Masked) */}
      {activeTab === 'banking' && profile && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs space-y-6">
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200/80 flex items-start gap-3">
              <Lock className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-purple-900">
                  Restricted Banking & Commercial Escrow Protection
                </h4>
                <p className="text-xs text-purple-700 mt-0.5 leading-relaxed">
                  {profile.banking.securityNotice}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider block">
                  Beneficiary Name
                </span>
                <span className="text-sm font-bold text-neutral-900 mt-1 block">
                  {profile.banking.beneficiaryName}
                </span>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider block">
                  Institutional Bank Partner
                </span>
                <span className="text-sm font-medium text-neutral-900 mt-1 block">
                  {profile.banking.bankName}
                </span>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider block">
                  Operating Account Number (Masked)
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-sm font-bold text-neutral-900">
                    {showMaskedBank ? '0049 2026 3437 1058' : profile.banking.accountNumberMasked}
                  </span>
                  <button
                    onClick={() => setShowMaskedBank(!showMaskedBank)}
                    className="p-1 text-neutral-500 hover:text-neutral-900 rounded"
                    title={showMaskedBank ? 'Mask account' : 'Reveal account'}
                  >
                    {showMaskedBank ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider block">
                  IFSC / SWIFT BIC Code
                </span>
                <span className="font-mono text-sm font-medium text-neutral-600 mt-1 block">
                  {profile.banking.swiftBic}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-2">
                  Accepted Commercial Invoicing Currencies
                </span>
                <div className="flex flex-wrap gap-2">
                  {profile.banking.acceptedCurrencies.map((curr) => (
                    <span
                      key={curr}
                      className="px-3 py-1 bg-neutral-100 text-neutral-800 font-mono text-xs font-bold rounded-lg border border-neutral-200"
                    >
                      {curr}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: System Health & Diagnostics */}
      {activeTab === 'health' && health && (
        <div className="space-y-6">
          {/* Database & Pool Health */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-900">
                  Database & PostgreSQL Pool Health
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  AWS Supabase remote pooler connectivity and vector extension status.
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  health.database.status === 'connected'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    health.database.status === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                {health.database.status === 'connected' ? 'Connected & Healthy' : 'Degraded'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Database Engine
                </span>
                <span className="text-sm font-semibold text-neutral-900 mt-1 block">
                  {health.database.engine}
                </span>
                <span className="text-[11px] text-neutral-500 font-mono mt-0.5 block truncate">
                  {health.database.host}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  pgvector Vector Store
                </span>
                <span className="text-sm font-semibold text-emerald-800 mt-1 block">
                  {health.database.vectorExtension}
                </span>
                <span className="text-[11px] text-neutral-500 mt-0.5 block">
                  PostgreSQL RAG indexing enabled
                </span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Connection Pool
                </span>
                <span className="text-sm font-semibold text-neutral-900 mt-1 block">
                  Max: {health.database.pool.max} | Idle: {health.database.pool.idle}ms
                </span>
                <span className="text-[11px] text-neutral-500 mt-0.5 block">
                  Acquire timeout: {health.database.pool.acquire}ms
                </span>
              </div>
            </div>
          </div>

          {/* Database Table Row Counts */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                Core Data Entities & Table Counters
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Live row counts across operational business modules.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(health.tables).map(([table, count]) => (
                <div key={table} className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/40">
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block truncate">
                    {table}
                  </span>
                  <span className="text-lg font-serif font-bold text-neutral-900 mt-0.5 block">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Runtime Node Environment */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                Node.js Server Runtime Environment
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Process metrics, memory footprint, and server uptime.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-lg border border-neutral-200">
                <span className="text-xs text-neutral-500 block">Node Version</span>
                <span className="font-mono text-sm font-bold text-neutral-900 mt-0.5 block">
                  {health.server.nodeVersion} ({health.server.arch})
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-neutral-200">
                <span className="text-xs text-neutral-500 block">Server Uptime</span>
                <span className="font-mono text-sm font-bold text-neutral-900 mt-0.5 block">
                  {Math.floor(health.server.uptimeSeconds / 60)} minutes
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-neutral-200">
                <span className="text-xs text-neutral-500 block">Heap Memory Used</span>
                <span className="font-mono text-sm font-bold text-neutral-900 mt-0.5 block">
                  {health.server.memory.heapUsedMb} MB / {health.server.memory.heapTotalMb} MB
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-neutral-200">
                <span className="text-xs text-neutral-500 block">Environment</span>
                <span className="font-mono text-sm font-bold text-emerald-800 uppercase mt-0.5 block">
                  {health.server.environment}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
