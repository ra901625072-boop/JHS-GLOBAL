import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
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
  RotateCw,
  Search,
  Lock,
  Copy,
  Check,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  toggleAdminUserActive,
  resetAdminUserPassword,
} from '../api';
import { useAdminAuth } from '../context/AuthContext';
import Button from '../../components/ui/Button';
import {
  AdminPageHeader,
  AdminStatCard,
  DataTable,
  FilterBar,
  AdminStatusBadge,
  AdminDrawer,
  AdminSkeleton,
} from '../components';

const ROLE_CONFIG = {
  admin: {
    label: 'Global Administrator',
    shortLabel: 'Admin',
    variant: 'accent',
    desc: 'Full administrative governance, staff provisioning, system settings, and audit ledger access.',
  },
  sales: {
    label: 'International Sales Desk',
    shortLabel: 'Sales',
    variant: 'info',
    desc: 'Manage inquiries, RFQ triage, sample dispatch, quotations, and commercial buyer relations.',
  },
  editor: {
    label: 'Catalogue & Content Editor',
    shortLabel: 'Editor',
    variant: 'warning',
    desc: 'Manage commodity specifications, categories, certificates, trade blogs, and knowledge facts.',
  },
  viewer: {
    label: 'Read-Only Viewer',
    shortLabel: 'Viewer',
    variant: 'neutral',
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
    const total = pagination.total || users.length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const sales = users.filter((u) => u.role === 'sales').length;
    const editors = users.filter((u) => u.role === 'editor').length;
    const activeCount = users.filter((u) => u.isActive).length;
    return { total, admins, sales, editors, activeCount };
  }, [users, pagination.total]);

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

  // FilterBar configuration
  const filterConfig = useMemo(
    () => [
      {
        key: 'search',
        type: 'text',
        placeholder: 'Search staff by name or email...',
        value: search,
      },
      {
        key: 'role',
        type: 'select',
        placeholder: 'All Roles',
        value: roleFilter,
        options: [
          { label: 'All Roles', value: 'all' },
          { label: 'Global Administrators', value: 'admin' },
          { label: 'International Sales Officers', value: 'sales' },
          { label: 'Content Editors', value: 'editor' },
          { label: 'Read-Only Viewers', value: 'viewer' },
        ],
      },
      {
        key: 'status',
        type: 'select',
        placeholder: 'All Statuses',
        value: statusFilter,
        options: [
          { label: 'All Statuses', value: 'all' },
          { label: 'Active', value: 'active' },
          { label: 'Disabled', value: 'inactive' },
        ],
      },
    ],
    [search, roleFilter, statusFilter]
  );

  const handleFilterChange = (key, val) => {
    if (key === 'search') setSearch(val);
    if (key === 'role') setRoleFilter(val || 'all');
    if (key === 'status') setStatusFilter(val || 'all');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterReset = () => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Table Columns
  const columns = [
    {
      key: 'name',
      title: 'Staff Member',
      render: (_, row) => {
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
            <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-900 font-semibold text-xs flex items-center justify-center border border-primary-200 shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-neutral-900 text-sm truncate flex items-center gap-2">
                {row.name}
                {row.id === currentAdmin?.id && (
                  <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-mono border border-neutral-200">
                    You
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-500 font-mono truncate flex items-center gap-1">
                <Mail className="w-3 h-3 shrink-0 text-neutral-400" />
                {row.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      title: 'Assigned Role',
      width: '160px',
      render: (val, row) => {
        const conf = ROLE_CONFIG[row.role] || ROLE_CONFIG.viewer;
        return (
          <AdminStatusBadge
            status={conf.shortLabel.toUpperCase()}
            variant={conf.variant}
            dot
          />
        );
      },
    },
    {
      key: 'isActive',
      title: 'Status',
      width: '120px',
      render: (val, row) => (
        <button
          onClick={() => handleToggleActive(row)}
          disabled={actionLoading}
          className="focus:outline-none focus:ring-2 focus:ring-primary-700 rounded-full"
          title="Click to toggle status"
        >
          <AdminStatusBadge
            status={row.isActive ? 'ACTIVE' : 'DISABLED'}
            variant={row.isActive ? 'success' : 'neutral'}
            dot
          />
        </button>
      ),
    },
    {
      key: 'lastLoginAt',
      title: 'Last Authenticated',
      width: '180px',
      render: (val, row) => {
        if (!row.lastLoginAt) {
          return <span className="text-xs text-neutral-400 italic">Never authenticated</span>;
        }
        const d = new Date(row.lastLoginAt);
        return (
          <div className="text-xs text-neutral-600 flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span className="tabular-nums">{d.toLocaleDateString('en-GB')}</span>
            <span className="text-neutral-400 tabular-nums">
              {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '90px',
      render: (_, row) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-neutral-500 hover:text-primary-800 hover:bg-neutral-100 rounded-md transition-colors"
            title="Edit User"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenPasswordReset(row)}
            className="p-1.5 text-neutral-400 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
            title="Reset Password"
          >
            <KeyRound className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <Helmet>
        <title>Team Governance & Users | JHS GLOBAL Admin</title>
      </Helmet>

      {/* Symmetrical Page Header */}
      <AdminPageHeader
        breadcrumb={[
          { label: 'JHS GLOBAL Desk', to: '/admin' },
          { label: 'Staff & Roles', to: '/admin/users' },
        ]}
        title="Team Governance & Staff RBAC"
        badge="RBAC ENFORCED"
        description="Provision staff accounts with server-enforced role permissions for Global Administrators, International Sales Officers, and Content Editors."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              className="flex items-center space-x-1.5 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              <RotateCw className={`w-3.5 h-3.5 text-neutral-600 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="flex items-center space-x-1.5 bg-accent-600 hover:bg-accent-700 text-neutral-950 font-medium"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Staff Member</span>
            </Button>
          </div>
        }
      />

      {/* Notification Toast */}
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
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{notification.msg}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Symmetrical 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Total Staff"
          value={metrics.total}
          sublabel="Active users in organization"
          icon={UserCheck}
          badge={{ text: `${metrics.activeCount} active`, variant: 'success' }}
        />
        <AdminStatCard
          label="Administrators"
          value={metrics.admins}
          sublabel="Full system & API governance"
          icon={Shield}
          badge={{ text: 'Root Level', variant: 'accent' }}
        />
        <AdminStatCard
          label="Sales Officers"
          value={metrics.sales}
          sublabel="Inquiries, quotes, dispatch"
          icon={User}
          badge={{ text: 'Commercial Desk', variant: 'info' }}
        />
        <AdminStatCard
          label="Content Editors"
          value={metrics.editors}
          sublabel="Catalogue & knowledge CMS"
          icon={Edit2}
          badge={{ text: 'CMS Desk', variant: 'neutral' }}
        />
      </div>

      {/* Unified Filter Bar */}
      <FilterBar
        filters={filterConfig}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* Main Table */}
      {loading ? (
        <AdminSkeleton type="table" rows={5} />
      ) : error ? (
        <div className="elevation-flat bg-white rounded-admin-lg border border-red-200 p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="text-base font-semibold text-neutral-900">Failed to load staff users</h3>
          <p className="text-sm text-neutral-500">{error}</p>
          <Button variant="outline" size="sm" onClick={loadUsers}>
            Try reloading users
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          pagination={{
            page: pagination.page,
            pages: pagination.pages,
            total: pagination.total,
            limit: pagination.limit,
          }}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />
      )}

      {/* Provision / Edit User Drawer */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerMode === 'create' ? 'Invite Staff Member' : 'Edit Staff User'}
        subtitle={
          drawerMode === 'create'
            ? 'Set full name, institutional email, initial credentials, and RBAC role.'
            : `Updating profile for ${selectedUser?.name || 'Staff User'}`
        }
        size="md"
      >
        <form id="user-form" onSubmit={handleSubmitForm} className="flex flex-col h-full justify-between">
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Full Legal / Professional Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Work Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="officer@exportb2b.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900"
                />
              </div>
            </div>

            {drawerMode === 'create' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Initial Temporary Password <span className="text-red-500">*</span>
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
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Must be at least 8 characters. The staff member can update it after initial sign-in.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Assigned Role (RBAC) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(ROLE_CONFIG).map(([roleKey, conf]) => (
                  <label
                    key={roleKey}
                    className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.role === roleKey
                        ? 'border-primary-900 bg-neutral-50 '
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
                        className="text-primary-900 focus:ring-primary-900"
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
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-900"></div>
              </label>
            </div>
          </div>

          {/* Drawer Actions Footer */}
          <div className="border-t border-neutral-200 pt-4 mt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={actionLoading}
              className="bg-accent-600 hover:bg-accent-700 text-neutral-950 font-medium"
            >
              {actionLoading ? 'Saving...' : drawerMode === 'create' ? 'Create Account' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </AdminDrawer>

      {/* Password Reset Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="elevation-overlay bg-white rounded-admin-lg max-w-md w-full p-6 border border-neutral-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-700">
              <div className="p-2.5 rounded-full bg-amber-50 border border-amber-200">
                <KeyRound className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Reset Credentials</h3>
                <span className="text-xs text-neutral-500 font-mono">{resetModalUser.email}</span>
              </div>
            </div>

            <p className="text-sm text-neutral-600 leading-relaxed">
              Enter a new temporary password for <strong className="text-neutral-900">{resetModalUser.name}</strong>. Their active
              sessions will be immediately invalidated upon saving.
            </p>

            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full font-mono text-sm px-3 py-2 pr-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 bg-neutral-50"
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
                <span className="text-xs text-emerald-600 font-medium block">
                  Password copied to clipboard!
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResetModalUser(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleExecutePasswordReset}
                disabled={actionLoading || !newPassword || newPassword.length < 8}
                className="bg-accent-600 hover:bg-accent-700 text-neutral-950 font-medium"
              >
                {actionLoading ? 'Updating...' : 'Set New Password'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
