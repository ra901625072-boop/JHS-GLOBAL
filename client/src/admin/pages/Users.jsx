import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserCheck,
  UserPlus,
  Shield,
  KeyRound,
  Mail,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Edit2,
  RefreshCw,
  Search,
  Lock,
  Copy,
  Check,
} from 'lucide-react';
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  toggleAdminUserActive,
  resetAdminUserPassword,
} from '../api';
import { useAdminAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import AdminDrawer from '../components/AdminDrawer';
import { TableSkeleton } from '../components/AdminSkeleton';

const ROLE_CONFIG = {
  admin: {
    label: 'Global Administrator',
    shortLabel: 'Admin',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
    dotClass: 'bg-purple-500',
    desc: 'Full administrative governance, staff provisioning, system settings, and audit ledger access.',
  },
  sales: {
    label: 'International Sales Desk',
    shortLabel: 'Sales',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dotClass: 'bg-blue-500',
    desc: 'Manage inquiries, RFQ triage, sample dispatch, quotations, and commercial buyer relations.',
  },
  editor: {
    label: 'Catalogue & Content Editor',
    shortLabel: 'Editor',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dotClass: 'bg-amber-500',
    desc: 'Manage commodity specifications, categories, certificates, trade blogs, and knowledge facts.',
  },
  viewer: {
    label: 'Read-Only Viewer',
    shortLabel: 'Viewer',
    badgeClass: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    dotClass: 'bg-neutral-400',
    desc: 'Read-only access to commercial catalogue, specifications, and published content.',
  },
};

export const Users = () => {
  const { user: currentAdmin } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('create'); // 'create' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);

  // Password Reset Modal State
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor',
    isActive: true,
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
      };
      const res = await fetchAdminUsers(params);
      setUsers(res.users || []);
      if (res.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: res.pagination.total,
          pages: res.pagination.pages,
        }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load team users');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const sales = users.filter((u) => u.role === 'sales').length;
    const editors = users.filter((u) => u.role === 'editor').length;
    const activeCount = users.filter((u) => u.isActive).length;
    return { total, admins, sales, editors, activeCount };
  }, [users]);

  // Handle open create drawer
  const handleOpenCreate = () => {
    setDrawerMode('create');
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'editor',
      isActive: true,
    });
    setIsDrawerOpen(true);
  };

  // Handle open edit drawer
  const handleOpenEdit = (user) => {
    setDrawerMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive,
    });
    setIsDrawerOpen(true);
  };

  // Handle submit create or edit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (drawerMode === 'create') {
        await createAdminUser(formData);
        showNotification(`Staff user ${formData.name} successfully created`);
      } else {
        await updateAdminUser(selectedUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        });
        showNotification(`Staff user ${formData.name} updated successfully`);
      }
      setIsDrawerOpen(false);
      loadUsers();
    } catch (err) {
      showNotification(
        err?.response?.data?.message || err.message || 'Failed to save staff user',
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle toggle active
  const handleToggleActive = async (user) => {
    if (user.id === currentAdmin?.id && user.isActive) {
      showNotification('You cannot deactivate your own active Administrator account', 'error');
      return;
    }
    try {
      setActionLoading(true);
      const res = await toggleAdminUserActive(user.id);
      showNotification(
        `User ${user.name} is now ${res.isActive ? 'Active' : 'Deactivated'}`
      );
      loadUsers();
    } catch (err) {
      showNotification(
        err?.response?.data?.message || err.message || 'Failed to update user status',
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Password Reset
  const handleOpenPasswordReset = (user) => {
    setResetModalUser(user);
    const generated =
      'Jhs@' + Math.random().toString(36).slice(-6) + '!' + Math.floor(10 + Math.random() * 90);
    setNewPassword(generated);
    setCopiedPassword(false);
  };

  const handleExecutePasswordReset = async () => {
    if (!resetModalUser || !newPassword) return;
    try {
      setActionLoading(true);
      await resetAdminUserPassword(resetModalUser.id, { newPassword });
      showNotification(`Password for ${resetModalUser.name} has been reset`);
      setResetModalUser(null);
    } catch (err) {
      showNotification(
        err?.response?.data?.message || err.message || 'Failed to reset password',
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // Table Columns
  const columns = [
    {
      header: 'Staff Member',
      accessor: 'name',
      cell: (row) => {
        const initials = row.name
          ? row.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          : 'U';
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-neutral-900 truncate flex items-center gap-2">
                {row.name}
                {row.id === currentAdmin?.id && (
                  <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-mono">
                    You
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-500 truncate flex items-center gap-1">
                <Mail className="w-3 h-3 shrink-0 text-neutral-400" />
                {row.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Assigned Role',
      accessor: 'role',
      cell: (row) => {
        const conf = ROLE_CONFIG[row.role] || ROLE_CONFIG.viewer;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${conf.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${conf.dotClass}`} />
            {conf.shortLabel}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'isActive',
      cell: (row) => (
        <button
          onClick={() => handleToggleActive(row)}
          disabled={actionLoading}
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
            row.isActive
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 border border-neutral-200'
          }`}
          title="Click to toggle status"
        >
          {row.isActive ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Active
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-neutral-400" />
              Disabled
            </>
          )}
        </button>
      ),
    },
    {
      header: 'Last Authenticated',
      accessor: 'lastLoginAt',
      cell: (row) => {
        if (!row.lastLoginAt) {
          return <span className="text-xs text-neutral-400">Never logged in</span>;
        }
        const d = new Date(row.lastLoginAt);
        return (
          <div className="text-xs text-neutral-600 flex items-center gap-1">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span>{d.toLocaleDateString('en-GB')}</span>
            <span className="text-neutral-400 font-mono">
              {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
            title="Edit User"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenPasswordReset(row)}
            className="p-1.5 text-neutral-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
            title="Reset Password"
          >
            <KeyRound className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 border ${
            notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold text-neutral-900 tracking-tight">
              Team Governance & User Roles
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
              <Shield className="w-3 h-3 text-purple-600" />
              RBAC Enforced
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1 max-w-2xl">
            Provision staff accounts with server-enforced role permissions for Global Administrators,
            International Sales Officers, and Content Editors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadUsers}
            className="p-2.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 font-medium text-sm transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            Invite Staff Member
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Total Staff
          </span>
          <p className="text-2xl font-serif font-bold text-neutral-900 mt-1">{metrics.total}</p>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">
            {metrics.activeCount} active in system
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Administrators
          </span>
          <p className="text-2xl font-serif font-bold text-purple-900 mt-1">{metrics.admins}</p>
          <span className="text-[11px] text-neutral-400 mt-0.5 block">Full system access</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Sales Officers
          </span>
          <p className="text-2xl font-serif font-bold text-blue-900 mt-1">{metrics.sales}</p>
          <span className="text-[11px] text-neutral-400 mt-0.5 block">Inquiries, samples, quotes</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Content Editors
          </span>
          <p className="text-2xl font-serif font-bold text-amber-900 mt-1">{metrics.editors}</p>
          <span className="text-[11px] text-neutral-400 mt-0.5 block">Catalogue & content CMS</span>
        </div>
      </div>

      {/* FilterBar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="sales">Sales Officers</option>
            <option value="editor">Content Editors</option>
            <option value="viewer">Viewers</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Disabled Only</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-xl border border-neutral-200">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-neutral-900 font-medium">{error}</p>
          <button
            onClick={loadUsers}
            className="mt-3 text-sm text-neutral-600 underline hover:text-neutral-900"
          >
            Try reloading users
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          pagination={{
            page: pagination.page,
            totalPages: pagination.pages,
            totalItems: pagination.total,
            onPageChange: (p) => setPagination((prev) => ({ ...prev, page: p })),
          }}
          emptyMessage="No staff users match your current filter parameters."
        />
      )}

      {/* Provision / Edit User Drawer */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerMode === 'create' ? 'Invite Staff Member' : 'Edit Staff User'}
        subtitle={
          drawerMode === 'create'
            ? 'Set name, institutional email, initial credentials, and RBAC role.'
            : `Updating profile for ${selectedUser?.name || 'Staff User'}`
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="user-form"
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : drawerMode === 'create' ? 'Create Account' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmitForm} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Full Legal / Professional Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Work Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="officer@exportb2b.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
              />
            </div>
          </div>

          {drawerMode === 'create' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Initial Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Password must be at least 8 characters. The user can change it upon initial login.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Assigned Role (RBAC) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(ROLE_CONFIG).map(([roleKey, conf]) => (
                <label
                  key={roleKey}
                  className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.role === roleKey
                      ? 'border-neutral-900 bg-neutral-50/70 shadow-2xs'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-neutral-900">{conf.label}</span>
                    <input
                      type="radio"
                      name="role"
                      value={roleKey}
                      checked={formData.role === roleKey}
                      onChange={() => setFormData({ ...formData, role: roleKey })}
                      className="text-neutral-900 focus:ring-neutral-900"
                    />
                  </div>
                  <span className="text-[11px] text-neutral-500 leading-tight">{conf.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-neutral-900 block">Account Status</span>
              <span className="text-xs text-neutral-500">
                Disabled accounts cannot authenticate or access API endpoints.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </form>
      </AdminDrawer>

      {/* Password Reset Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-900">Reset Credentials</h3>
                <span className="text-xs text-neutral-500">{resetModalUser.email}</span>
              </div>
            </div>

            <p className="text-sm text-neutral-600 mb-4">
              Enter a new temporary password for <strong>{resetModalUser.name}</strong>. Their active
              sessions will be immediately invalidated upon saving.
            </p>

            <div className="space-y-3 mb-5">
              <div className="relative">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full font-mono text-sm px-3 py-2 pr-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 bg-neutral-50"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(newPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-900 rounded"
                  title="Copy password"
                >
                  {copiedPassword ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              {copiedPassword && (
                <span className="text-xs text-emerald-600 block">
                  Password copied to clipboard!
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecutePasswordReset}
                disabled={actionLoading || !newPassword || newPassword.length < 8}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : 'Set New Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
