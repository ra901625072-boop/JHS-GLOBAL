import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Inbox,
  FlaskConical,
  Package,
  Layers,
  Award,
  Building,
  BookOpen,
  HelpCircle,
  UserCheck,
  Settings,
  Plus,
  Globe,
  X,
  ArrowRight,
  LogOut,
  Command,
} from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';

/**
 * AdminCommandPalette (⌘K / Ctrl+K) — Phase 2
 *
 * Keyboard-first navigation and quick action launcher.
 */
export const AdminCommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAdminAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navItems = [
    {
      id: 'nav-dashboard',
      category: 'Navigation',
      label: 'Operations Dashboard',
      sublabel: 'Executive metrics, recent leads & overview',
      icon: LayoutDashboard,
      action: () => navigate('/admin'),
    },
    {
      id: 'nav-inquiries',
      category: 'Navigation',
      label: 'Inquiries & RFQ Leads',
      sublabel: 'Inbound international buyer specifications & 48h sourcing',
      icon: Inbox,
      action: () => navigate('/admin/inquiries'),
    },
    {
      id: 'nav-samples',
      category: 'Navigation',
      label: 'Sample Dispatch Desk',
      sublabel: 'Courier tracking, AWB numbers & sample status',
      icon: FlaskConical,
      action: () => navigate('/admin/samples'),
    },
    {
      id: 'nav-products',
      category: 'Navigation',
      label: 'Products & Specifications',
      sublabel: 'Export commodities, specs, HS codes & packaging',
      icon: Package,
      action: () => navigate('/admin/products'),
    },
    {
      id: 'nav-categories',
      category: 'Navigation',
      label: 'Categories & Divisions',
      sublabel: 'Manage 3 main export divisions and taxonomy',
      icon: Layers,
      action: () => navigate('/admin/categories'),
    },
    {
      id: 'nav-certificates',
      category: 'Navigation',
      label: 'Statutory Certificates',
      sublabel: 'FSSAI, APEDA, Spice Board, DGFT & GST documents',
      icon: Award,
      action: () => navigate('/admin/certificates'),
    },
    {
      id: 'nav-knowledge',
      category: 'Navigation',
      label: 'Company Knowledge Base',
      sublabel: 'Company facts, facility specs & AI chatbot data',
      icon: Building,
      action: () => navigate('/admin/company-knowledge'),
    },
    {
      id: 'nav-blog',
      category: 'Navigation',
      label: 'Trade Intelligence & Blog',
      sublabel: 'Export articles, market trends & SEO posts',
      icon: BookOpen,
      action: () => navigate('/admin/blog'),
    },
    {
      id: 'nav-faqs',
      category: 'Navigation',
      label: 'Export FAQ Manager',
      sublabel: 'Frequently asked trade & shipping questions',
      icon: HelpCircle,
      action: () => navigate('/admin/faqs'),
    },
    {
      id: 'nav-users',
      category: 'Navigation',
      label: 'Team Users & Roles',
      sublabel: 'Admin staff accounts, credentials & permissions',
      icon: UserCheck,
      action: () => navigate('/admin/users'),
    },
    {
      id: 'nav-settings',
      category: 'Navigation',
      label: 'Company Profile & Settings',
      sublabel: 'Office address, WhatsApp/phone, system health',
      icon: Settings,
      action: () => navigate('/admin/settings'),
    },
  ];

  const quickActions = [
    {
      id: 'action-add-product',
      category: 'Quick Actions',
      label: 'Add New Product',
      sublabel: 'Register new export specification to catalog',
      icon: Plus,
      badge: 'Catalogue',
      action: () => navigate('/admin/products?new=true'),
    },
    {
      id: 'action-view-inquiries',
      category: 'Quick Actions',
      label: 'View New RFQ Leads',
      sublabel: 'Check incoming buyer inquiries awaiting reply',
      icon: Inbox,
      badge: 'Leads',
      action: () => navigate('/admin/inquiries?status=new'),
    },
    {
      id: 'action-open-store',
      category: 'Quick Actions',
      label: 'Open Public Buyer Website',
      sublabel: 'Launch visitor-facing export portal in new tab',
      icon: Globe,
      badge: 'External',
      action: () => window.open('/', '_blank'),
    },
    {
      id: 'action-logout',
      category: 'Account',
      label: 'Sign Out Session',
      sublabel: `Signed in as ${user?.email || 'Officer'}`,
      icon: LogOut,
      badge: 'Auth',
      action: async () => {
        await logout();
        navigate('/admin/login');
      },
    },
  ];

  const allItems = [...navItems, ...quickActions];

  const filteredItems = allItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      item.sublabel.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          selected.action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 overflow-hidden flex items-start justify-center pt-16 sm:pt-24 px-4"
      style={{ zIndex: 'var(--admin-z-overlay)' }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/50 transition-opacity"
        aria-hidden="true"
        style={{
          transitionDuration: 'var(--admin-duration-base)',
          transitionTimingFunction: 'var(--admin-ease-out)',
        }}
      />

      {/* Palette Container */}
      <div
        className="relative w-full max-w-xl bg-white rounded-admin-lg shadow-admin-overlay border border-[var(--admin-border)] overflow-hidden z-10 flex flex-col transform-gpu"
        style={{
          animation: 'paletteIn var(--admin-duration-base) var(--admin-ease-out) forwards',
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Search Header */}
        <div className="p-3.5 border-b border-[var(--admin-border)] flex items-center gap-3 bg-[var(--admin-surface-subtle)]">
          <Search className="w-4 h-4 text-[var(--admin-text-placeholder)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[var(--admin-text-placeholder)] hover:text-[var(--admin-text-primary)] rounded-admin-sm"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[var(--admin-border)] rounded-admin-sm text-[var(--admin-text-muted)]">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-1.5 admin-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-[var(--admin-text-muted)]">
              <p className="font-semibold text-[var(--admin-text-primary)] text-sm">No matching commands</p>
              <p className="mt-1">Try searching "Inquiries", "Products", or "Settings".</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-admin-md cursor-pointer transition-colors text-left ${
                      isSelected
                        ? 'bg-[var(--admin-brand)] text-white'
                        : 'hover:bg-[var(--admin-surface-subtle)] text-[var(--admin-text-primary)]'
                    }`}
                    style={{ transitionDuration: 'var(--admin-duration-micro)' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-admin-sm flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-white border-[var(--admin-border)] text-[var(--admin-text-muted)]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-xs font-semibold truncate ${
                              isSelected ? 'text-white' : 'text-[var(--admin-text-primary)]'
                            }`}
                          >
                            {item.label}
                          </p>
                          {item.badge && (
                            <span
                              className={`text-[9px] uppercase font-semibold px-1.5 py-0.2 rounded-admin-sm border ${
                                isSelected
                                  ? 'bg-white/15 text-white border-white/20'
                                  : 'bg-[var(--admin-surface-subtle)] text-[var(--admin-text-muted)] border-[var(--admin-border)]'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] truncate mt-0.2 ${
                            isSelected ? 'text-neutral-300' : 'text-[var(--admin-text-muted)]'
                          }`}
                        >
                          {item.sublabel}
                        </p>
                      </div>
                    </div>

                    <ArrowRight
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected
                          ? 'text-white opacity-100'
                          : 'text-[var(--admin-text-placeholder)] opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-3 py-2 bg-[var(--admin-surface-subtle)] border-t border-[var(--admin-border)] flex items-center justify-between text-[11px] text-[var(--admin-text-muted)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-white border border-[var(--admin-border)] rounded-admin-sm font-mono text-[10px]">
                ↑↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-white border border-[var(--admin-border)] rounded-admin-sm font-mono text-[10px]">
                ↵
              </kbd>
              <span>Select</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[var(--admin-text-muted)]">
            <Command className="w-3 h-3 text-[var(--admin-brand)]" />
            <span>Command Desk</span>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes paletteIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminCommandPalette;
