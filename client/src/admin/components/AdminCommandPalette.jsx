import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  TrendingUp,
  Inbox,
  FileText,
  Users,
  Ship,
  Package,
  Plus,
  Globe,
  ExternalLink,
  Sparkles,
  X,
  ArrowRight,
  LogOut,
  Command,
} from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';

/**
 * AdminCommandPalette (⌘K / Ctrl+K)
 *
 * Keyboard-first navigation and quick action launcher for export officers:
 * - Instant route navigation
 * - One-click commercial operations
 * - Keyboard navigation (Arrows, Enter, Escape)
 * - Deep Forest Green and Champagne Gold accents
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
      label: 'Operations Command Center',
      sublabel: 'Executive trade metrics, port velocity & KPIs',
      icon: LayoutDashboard,
      action: () => navigate('/admin'),
    },
    {
      id: 'nav-sales-desk',
      category: 'Navigation',
      label: 'Sales Desk & Kanban Pipeline',
      sublabel: 'Daily follow-up queue & deal stages',
      icon: TrendingUp,
      action: () => navigate('/admin/sales-desk'),
    },
    {
      id: 'nav-inquiries',
      category: 'Navigation',
      label: 'Inquiries & RFQ Leads Desk',
      sublabel: 'Inbound international buyer specifications',
      icon: Inbox,
      action: () => navigate('/admin/inquiries'),
    },
    {
      id: 'nav-quotations',
      category: 'Navigation',
      label: 'Quotations & Proforma Invoices',
      sublabel: 'Issue CIF/FOB proformas and generate PDFs',
      icon: FileText,
      action: () => navigate('/admin/quotations'),
    },
    {
      id: 'nav-customers',
      category: 'Navigation',
      label: 'Buyer Accounts (CRM)',
      sublabel: 'Overseas buyer dossiers & trade terms',
      icon: Users,
      action: () => navigate('/admin/customers'),
    },
    {
      id: 'nav-orders',
      category: 'Navigation',
      label: 'Orders & Ocean Shipments',
      sublabel: 'Container tracking, B/L vault & milestones',
      icon: Ship,
      action: () => navigate('/admin/orders'),
    },
    {
      id: 'nav-products',
      category: 'Navigation',
      label: 'Commodity Catalogue & HS Codes',
      sublabel: 'Export commodities, specs & packaging',
      icon: Package,
      action: () => navigate('/admin/products'),
    },
  ];

  const quickActions = [
    {
      id: 'action-new-quote',
      category: 'Quick Actions',
      label: 'Issue New Proforma Quotation',
      sublabel: 'Build a multi-commodity CIF/FOB quote',
      icon: Plus,
      badge: 'Sales',
      action: () => navigate('/admin/quotations?new=true'),
    },
    {
      id: 'action-schedule-task',
      category: 'Quick Actions',
      label: 'Schedule Commercial Follow-up',
      sublabel: 'Set WhatsApp / Call reminder for buyer',
      icon: TrendingUp,
      badge: 'CRM',
      action: () => navigate('/admin/sales-desk?new_task=true'),
    },
    {
      id: 'action-add-product',
      category: 'Quick Actions',
      label: 'Add Commodity to Catalogue',
      sublabel: 'Register new agri/spice specification',
      icon: Package,
      badge: 'Products',
      action: () => navigate('/admin/products?new=true'),
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
    <div className="fixed inset-0 z-50 overflow-hidden flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Dimmed Blurred Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Palette Container */}
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden z-10 flex flex-col animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Search Header */}
        <div className="p-4 border-b border-neutral-100 flex items-center gap-3 bg-neutral-50/70">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands, pages, or quick actions..."
            className="w-full bg-transparent text-sm sm:text-base text-neutral-900 placeholder-neutral-400 focus:outline-none font-sans"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono bg-white border border-neutral-200 rounded text-neutral-400 shadow-2xs">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 admin-scrollbar divide-y divide-neutral-100/60">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              <p className="font-semibold text-neutral-700 text-sm">No matching commands found</p>
              <p className="mt-1">Try searching "Inquiries", "Quotation", "Products", or "Sales".</p>
            </div>
          ) : (
            <div className="space-y-1">
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
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all text-left ${
                      isSelected
                        ? 'bg-primary-900 text-white shadow-xs'
                        : 'hover:bg-neutral-50 text-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                          isSelected
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-neutral-100 border-neutral-200/80 text-neutral-600 group-hover:text-primary-900 group-hover:border-neutral-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              isSelected ? 'text-white' : 'text-neutral-900'
                            }`}
                          >
                            {item.label}
                          </p>
                          {item.badge && (
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                                isSelected
                                  ? 'bg-white/10 text-white border-white/20'
                                  : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? 'text-neutral-300' : 'text-neutral-400'
                          }`}
                        >
                          {item.sublabel}
                        </p>
                      </div>
                    </div>

                    <ArrowRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected
                          ? 'text-white translate-x-0.5 opacity-100'
                          : 'text-neutral-300 opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded font-mono text-[10px] shadow-2xs">
                ↑↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded font-mono text-[10px] shadow-2xs">
                ↵
              </kbd>
              <span>Select</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-neutral-500">
            <Command className="w-3.5 h-3.5 text-neutral-700" />
            <span>Commercial Command Desk</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommandPalette;
