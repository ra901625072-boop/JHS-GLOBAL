import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Package,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Plus,
  ChevronRight,
  FlaskConical,
  Layers,
  Award,
  BookOpen,
  HelpCircle,
  UserCheck,
  Settings,
  Search,
  Globe2,
  Building,
} from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';
import AdminCommandPalette from './AdminCommandPalette';
import RouteTransition from '../../components/layout/RouteTransition';

export const AdminLayout = () => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const brandName = 'JHS GLOBAL';

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

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navGroups = [
    {
      group: 'Overview',
      items: [
        {
          to: '/admin',
          label: 'Dashboard',
          shortLabel: 'Dashboard',
          icon: LayoutDashboard,
          end: true,
          roles: ['admin', 'sales', 'editor'],
        },
      ],
    },
    {
      group: 'Leads & Inquiries',
      items: [
        {
          to: '/admin/inquiries',
          label: 'Inquiries',
          shortLabel: 'Inquiries',
          icon: Inbox,
          roles: ['admin', 'sales'],
        },
        {
          to: '/admin/samples',
          label: 'Samples',
          shortLabel: 'Samples',
          icon: FlaskConical,
          roles: ['admin', 'sales'],
        },
      ],
    },
    {
      group: 'Commodity Catalogue',
      items: [
        {
          to: '/admin/products',
          label: 'Products',
          shortLabel: 'Products',
          icon: Package,
          roles: ['admin', 'editor'],
        },
        {
          to: '/admin/categories',
          label: 'Categories',
          shortLabel: 'Categories',
          icon: Layers,
          roles: ['admin', 'editor'],
        },
        {
          to: '/admin/certificates',
          label: 'Certificates',
          shortLabel: 'Certificates',
          icon: Award,
          roles: ['admin', 'editor'],
        },
      ],
    },
    {
      group: 'Content CMS',
      items: [
        {
          to: '/admin/company-knowledge',
          label: 'Company Facts',
          shortLabel: 'Company Facts',
          icon: Building,
          roles: ['admin', 'editor'],
        },
        {
          to: '/admin/blog',
          label: 'Blog',
          shortLabel: 'Blog CMS',
          icon: BookOpen,
          roles: ['admin', 'editor'],
        },
        {
          to: '/admin/faqs',
          label: 'FAQs',
          shortLabel: 'FAQs',
          icon: HelpCircle,
          roles: ['admin', 'editor'],
        },
      ],
    },
    {
      group: 'Admin & Settings',
      items: [
        {
          to: '/admin/users',
          label: 'Users',
          shortLabel: 'Users',
          icon: UserCheck,
          roles: ['admin'],
        },
        {
          to: '/admin/settings',
          label: 'Settings',
          shortLabel: 'Settings',
          icon: Settings,
          roles: ['admin'],
        },
      ],
    },
  ];

  const allNavItems = navGroups.flatMap((g) => g.items);

  // Determine current active page label for topbar breadcrumb
  const currentNavItem = allNavItems.find((item) =>
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
    <div className="min-h-screen flex flex-col md:flex-row font-sans antialiased">
      {/* Mobile Topbar */}
      <header className="md:hidden bg-[#06180E] text-white px-4 py-3 flex items-center justify-between border-b border-[#0A2619] sticky top-0 shadow-admin-raised" style={{ zIndex: 'var(--admin-z-overlay)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-admin-md bg-white border border-white/20 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
            <img
              src="/images/logo/logo-mark.png"
              alt="JHS GLOBAL Logo"
              className="w-full h-full object-contain"
              width="32"
              height="32"
            />
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide block">{brandName}</span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-medium">
              Operations Desk
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 text-neutral-400 hover:text-white rounded-admin-md hover:bg-white/10 transition-colors"
            style={{ transitionDuration: 'var(--admin-duration-micro)' }}
            aria-label="Search and Quick Actions"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-400 hover:text-white rounded-admin-md hover:bg-white/10 transition-colors cursor-pointer"
            style={{ transitionDuration: 'var(--admin-duration-micro)' }}
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
          className="fixed inset-0 bg-neutral-950/60 md:hidden"
          style={{
            zIndex: 'var(--admin-z-backdrop)',
            backdropFilter: 'blur(2px)',
            transition: `opacity var(--admin-duration-base) var(--admin-ease-out)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 h-dvh w-60 lg:w-[272px] bg-[#06180E] text-neutral-300 flex flex-col justify-between border-r border-[#0A2619] transition-transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          zIndex: 'var(--admin-z-overlay)',
          transitionDuration: 'var(--admin-duration-base)',
          transitionTimingFunction: 'var(--admin-ease-out)',
        }}
      >
        <div className="flex flex-col flex-1 overflow-y-auto admin-scrollbar">
          {/* Logo Header */}
          <div className="px-5 py-4 lg:px-6 lg:py-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-admin-lg bg-white flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                <img
                  src="/images/logo/logo-mark.png"
                  alt="JHS GLOBAL Logo"
                  className="w-full h-full object-contain"
                  width="36"
                  height="36"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-[13px] font-bold text-white tracking-wide truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {brandName}
                </h1>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium block mt-0.5">
                  Operations Desk
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-3 space-y-5 flex-1">
            {navGroups.map((group) => {
              const accessibleItems = group.items.filter(
                (item) => !item.roles || item.roles.includes(user?.role)
              );
              if (accessibleItems.length === 0) return null;

              return (
                <div key={group.group} className="space-y-0.5">
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                    {group.group}
                  </div>
                  {accessibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 px-3 py-[7px] rounded-admin-md text-[13px] font-medium transition-colors ${
                            isActive
                              ? 'bg-white/[0.08] text-white'
                              : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
                          }`
                        }
                        style={{ transitionDuration: 'var(--admin-duration-micro)' }}
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span
                                className="absolute left-0 w-[2px] h-4 rounded-full"
                                style={{ backgroundColor: 'var(--admin-accent)' }}
                              />
                            )}
                            <Icon
                              className={`w-[15px] h-[15px] shrink-0 ${
                                isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              );
            })}

            <div className="pt-2 border-t border-white/[0.06]">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                External
              </div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-[7px] rounded-admin-md text-[13px] text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200 transition-colors group"
                style={{ transitionDuration: 'var(--admin-duration-micro)' }}
              >
                <div className="flex items-center gap-3">
                  <Globe2 className="w-[15px] h-[15px] shrink-0 text-neutral-500 group-hover:text-neutral-300" />
                  <span>View Website</span>
                </div>
                <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300" />
              </a>
            </div>
          </nav>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:pb-3 border-t border-white/[0.08]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-7 h-7 rounded-full bg-primary-900 border border-primary-700 flex items-center justify-center text-white text-[11px] font-bold font-mono shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-white truncate">{user?.name || 'Staff Officer'}</p>
                <p className="text-[10px] text-neutral-500 truncate">{user?.email}</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-admin-sm border bg-white/[0.06] text-neutral-400 border-white/[0.1] capitalize shrink-0">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-[12px] font-medium text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-rose-950/40 border border-white/[0.08] hover:border-rose-800/40 rounded-admin-md transition-colors"
            style={{ transitionDuration: 'var(--admin-duration-micro)' }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Desktop Topbar */}
        <header
          className="hidden md:flex sticky top-0 bg-white border-b px-6 py-2.5 items-center justify-between gap-4"
          style={{
            zIndex: 'var(--admin-z-topbar)',
            borderColor: 'var(--admin-border)',
          }}
        >
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-[12px]">
            <button
              onClick={() => navigate('/admin')}
              className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] font-medium transition-colors flex items-center gap-1.5"
              style={{ transitionDuration: 'var(--admin-duration-micro)' }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <ChevronRight className="w-3 h-3 text-[var(--admin-border-strong)]" />
            <span className="font-semibold text-[var(--admin-text-primary)]">
              {currentNavItem?.shortLabel || 'Dashboard'}
            </span>
          </div>

          {/* Center Quick Search / Command Palette Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-admin-md border text-[12px] transition-colors group admin-focus-ring"
            style={{
              borderColor: 'var(--admin-border)',
              backgroundColor: 'var(--admin-surface-subtle)',
              color: 'var(--admin-text-muted)',
              transitionDuration: 'var(--admin-duration-micro)',
            }}
            title="Press ⌘K or Ctrl+K to search anything"
          >
            <Search className="w-3.5 h-3.5 text-[var(--admin-text-placeholder)] group-hover:text-[var(--admin-text-muted)]" />
            <span className="font-medium">Search RFQs, products, HS codes…</span>
            <kbd
              className="px-1.5 py-0.5 text-[10px] border rounded font-mono ml-2"
              style={{
                backgroundColor: 'var(--admin-surface)',
                borderColor: 'var(--admin-border)',
                color: 'var(--admin-text-placeholder)',
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-admin-md text-[12px] font-medium transition-colors"
              style={{
                color: 'var(--admin-text-muted)',
                transitionDuration: 'var(--admin-duration-micro)',
              }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Website</span>
            </a>

            <button
              onClick={() => navigate('/admin/products')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-admin-md text-[12px] font-semibold border transition-colors active:scale-[0.98] transform-gpu admin-focus-ring"
              style={{
                backgroundColor: 'var(--admin-surface)',
                borderColor: 'var(--admin-border)',
                color: 'var(--admin-text-primary)',
                transitionDuration: 'var(--admin-duration-micro)',
              }}
            >
              <Plus className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />
              <span>Add Product</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-admin-content mx-auto w-full">
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
