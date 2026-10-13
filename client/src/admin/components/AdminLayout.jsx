import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Inbox,
  FileText,
  Users,
  Ship,
  Package,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Building,
  Clock,
  Plus,
  ChevronRight,
  Anchor,
  Globe2,
  Search,
  Sparkles,
  Command,
} from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';
import AdminCommandPalette from './AdminCommandPalette';
import RouteTransition from '../../components/layout/RouteTransition';

export const AdminLayout = () => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showPortDetails, setShowPortDetails] = useState(false);

  const brandName = import.meta.env.VITE_BRAND_NAME || 'JHS GLOBAL';

  // Global keyboard shortcut for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live clocks for international trade operations
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatPortTime = (timeZone) => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(currentTime);
    } catch {
      return currentTime.toLocaleTimeString();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      to: '/admin',
      label: 'Operations Command Center',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      end: true,
      roles: ['admin', 'sales', 'editor'],
    },
    {
      to: '/admin/sales-desk',
      label: 'Sales Desk & Pipeline',
      shortLabel: 'Sales Desk',
      icon: TrendingUp,
      roles: ['admin', 'sales'],
    },
    {
      to: '/admin/inquiries',
      label: 'Inquiries & RFQ Leads',
      shortLabel: 'Inquiries',
      icon: Inbox,
      roles: ['admin', 'sales'],
    },
    {
      to: '/admin/quotations',
      label: 'Quotations & Proformas',
      shortLabel: 'Quotations',
      icon: FileText,
      roles: ['admin', 'sales'],
    },
    {
      to: '/admin/customers',
      label: 'Buyer Accounts (CRM)',
      shortLabel: 'Buyers',
      icon: Users,
      roles: ['admin', 'sales'],
    },
    {
      to: '/admin/orders',
      label: 'Orders & Shipments',
      shortLabel: 'Shipments',
      icon: Ship,
      roles: ['admin', 'sales'],
    },
    {
      to: '/admin/products',
      label: 'Commodity Catalogue',
      shortLabel: 'Products',
      icon: Package,
      roles: ['admin', 'editor'],
    },
    {
      to: '/admin/company-knowledge',
      label: 'Company Knowledge Base',
      shortLabel: 'Company Facts',
      icon: Building,
      roles: ['admin', 'editor'],
    },
    {
      to: '/admin/ai-inquiries',
      label: 'AI Inquiries & Knowledge Gaps',
      shortLabel: 'AI Review',
      icon: Sparkles,
      roles: ['admin', 'sales', 'editor'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role));

  // Determine current active page label for topbar breadcrumb
  const currentNavItem = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SO';

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col md:flex-row font-sans text-neutral-800 antialiased selection:bg-primary-100 selection:text-primary-900">
      {/* Mobile Topbar */}
      <header className="md:hidden bg-primary-950 text-white p-4 flex items-center justify-between border-b border-primary-800/80 z-40 sticky top-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif font-bold text-sm tracking-wide block">{brandName}</span>
            <span className="text-[10px] text-neutral-300 uppercase tracking-widest block font-medium">
              Operations Desk
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 text-neutral-300 hover:text-white rounded-lg hover:bg-primary-900 focus:outline-none"
            aria-label="Search and Quick Actions"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-300 hover:text-white rounded-lg hover:bg-primary-900 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 h-[100dvh] h-screen w-64 lg:w-72 bg-gradient-to-b from-[#05140B] via-[#0A2619] to-[#04120A] text-neutral-200 flex flex-col justify-between border-r border-primary-800/80 z-50 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto admin-scrollbar">
          {/* Logo & Export Accreditation Header */}
          <div className="p-5 lg:p-6 border-b border-primary-800/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-xs shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="font-serif text-sm lg:text-base font-bold text-white tracking-wide truncate">
                  {brandName}
                </h1>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-neutral-300 text-[10px] font-semibold tracking-wider mt-1">
                  <span>APEDA & FSSAI RECOGNIZED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Commercial Operations
            </div>
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 transform-gpu active:scale-[0.98] ${
                      isActive
                        ? 'bg-white/10 text-white border border-white/20 font-semibold shadow-xs'
                        : 'text-neutral-300 hover:bg-primary-800/50 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-1 w-1 h-4 bg-primary-300 rounded-full transition-all duration-200" />
                      )}
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-neutral-400 group-hover:text-white'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}

            <div className="pt-5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              External Buyer Portal
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-neutral-300 hover:bg-primary-800/50 hover:text-white transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Globe2 className="w-4 h-4 shrink-0 text-neutral-400 group-hover:text-white transition-transform" />
                <span>Open Buyer Website</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
            </a>
          </nav>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:pb-4 border-t border-primary-800/70 bg-primary-950/60">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-full bg-primary-900 border border-primary-700 flex items-center justify-center text-white text-xs font-bold font-mono shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Staff Officer'}</p>
                <p className="text-[10px] text-neutral-400 truncate">{user?.email}</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border bg-primary-900/80 text-primary-200 border-primary-700 capitalize shrink-0">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-primary-900/60 hover:bg-rose-950/60 border border-primary-800 hover:border-rose-800 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Executive Desktop Topbar */}
        <header className="hidden md:flex sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-6 py-3 items-center justify-between gap-4 shadow-2xs">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => navigate('/admin')}
              className="text-neutral-400 hover:text-primary-900 font-medium transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
              <span>Export Bridge</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
            <span className="font-semibold text-neutral-900 bg-neutral-100/80 px-2 py-0.5 rounded-md">
              {currentNavItem?.shortLabel || 'Command Center'}
            </span>
          </div>

          {/* Center Quick Search / Command Palette Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100/90 border border-neutral-200/90 text-xs text-neutral-500 hover:text-neutral-800 transition-all shadow-2xs group focus:outline-none focus:ring-2 focus:ring-primary-800/20"
            title="Press ⌘K or Ctrl+K to search anything"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-primary-900 transition-colors" />
            <span className="font-medium">Search RFQs, HS codes, buyers & commands...</span>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-neutral-200 rounded font-mono text-neutral-500 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </button>

          {/* Right Controls: World Port Timezones & Quick Actions */}
          <div className="flex items-center gap-3">
            {/* World Port Clocks with interactive status popup */}
            <div className="relative">
              <button
                onClick={() => setShowPortDetails(!showPortDetails)}
                onMouseEnter={() => setShowPortDetails(true)}
                className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-neutral-100/90 hover:bg-neutral-200/80 border border-neutral-200 text-[11px] font-mono text-neutral-700 transition-all duration-150 transform-gpu active:scale-[0.98] cursor-pointer shadow-2xs"
                aria-label="Toggle Port Operations Status"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Anchor className="w-3.5 h-3.5 text-neutral-800" />
                  <span>Mundra: <strong className="text-neutral-900">{formatPortTime('Asia/Kolkata')}</strong></span>
                </div>
                <span className="text-neutral-300">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                  <Clock className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Rotterdam: <strong className="text-neutral-900">{formatPortTime('UTC')}</strong></span>
                </div>
              </button>

              {/* Port Operational Status Hover / Click Popover */}
              {showPortDetails && (
                <div
                  onMouseLeave={() => setShowPortDetails(false)}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-neutral-200/90 p-4 z-40 text-xs transform-gpu origin-top-right transition-all duration-200 animate-in fade-in zoom-in-95"
                >
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-neutral-100">
                    <span className="font-serif font-bold text-neutral-900 flex items-center gap-1.5">
                      <Anchor className="w-3.5 h-3.5 text-neutral-800" />
                      <span>International Maritime Status</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                      Live Gate Sync
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900">Port of Mundra (INMUN1)</span>
                        <span className="font-mono text-emerald-700 font-bold">IST (UTC+5:30)</span>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        APM Terminals Mundra & MICT • 24/7 Gate In / Stuffing Active
                      </p>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        Local Date: {currentTime.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' })}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900">Port of Rotterdam (NLRTM)</span>
                        <span className="font-mono text-neutral-700 font-bold">UTC / CET</span>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Maasvlakte ECT Delta & Euromax • European Inbound Clearing
                      </p>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        Local Date: {currentTime.toLocaleDateString('en-GB', { timeZone: 'UTC', dateStyle: 'medium' })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <button
              onClick={() => navigate('/admin/quotations')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary-900 hover:bg-primary-950 text-white shadow-xs hover:shadow-subtle transition-all duration-150 transform-gpu active:scale-[0.97]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Proforma</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </main>
      </div>

      {/* Global Command Palette (⌘K) */}
      <AdminCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};

export default AdminLayout;
