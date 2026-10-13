import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Building,
  Mail,
  Phone,
  Globe,
  Plus,
  Search,
  CheckCircle2,
  X,
  MessageSquare,
  DollarSign,
  FileText,
  Clock,
  ChevronRight,
  Anchor,
  ShieldCheck,
} from 'lucide-react';
import {
  fetchAdminCustomers,
  fetchAdminCustomerById,
  createAdminCustomer,
  updateAdminCustomer,
  addAdminCustomerNote,
} from '../api';
import Button from '../../components/ui/Button';
import AdminStatusBadge from '../components/AdminStatusBadge';
import AdminTableShell from '../components/AdminTableShell';
import AdminDrawer from '../components/AdminDrawer';
import Reveal from '../../components/ui/Reveal';

export const Customers = () => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [feedback, setFeedback] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    country: '',
    city: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    businessType: 'importer',
    interestedProducts: '',
    preferredPort: '',
    preferredIncoterm: 'CIF',
    paymentTerms: '30% Advance TT',
    note: '',
  });

  const { data: customerData, isLoading } = useQuery({
    queryKey: ['admin-customers', searchQuery],
    queryFn: () => fetchAdminCustomers({ q: searchQuery.trim() || undefined, limit: 50 }),
  });

  const { data: activeCustomer, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-customer-detail', selectedCustomerId],
    queryFn: () => fetchAdminCustomerById(selectedCustomerId),
    enabled: !!selectedCustomerId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createAdminCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-customers']);
      setCreateModalOpen(false);
      setFeedback('Customer profile registered successfully');
      setTimeout(() => setFeedback(''), 4000);
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ id, note }) => addAdminCustomerNote(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-customer-detail', selectedCustomerId]);
      setNoteText('');
      setFeedback('Note logged to customer timeline');
      setTimeout(() => setFeedback(''), 4000);
    },
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      interestedProducts: formData.interestedProducts
        ? formData.interestedProducts.split(',').map((s) => s.trim())
        : [],
    });
  };

  const customers = customerData?.customers || [];

  return (
    <>
      <Helmet>
        <title>Buyer CRM & Customer Directory — Admin Suite</title>
      </Helmet>

      {/* Header */}
      <Reveal direction="up" distance={16} duration={0.5}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold mb-2">
              <Users className="w-3.5 h-3.5 text-neutral-900" />
              <span>GLOBAL BUYER ACCOUNTS & CRM REPOSITORY</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Overseas Buyers & Corporate Accounts
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
              Directory of international food processors, distributors, spice importers, port preferences, and contract histories.
            </p>
          </div>

          <Button
            variant="cta"
            size="md"
            onClick={() => setCreateModalOpen(true)}
            className="text-xs font-bold flex items-center gap-1.5 shadow-subtle shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Register Buyer Account</span>
          </Button>
        </div>
      </Reveal>

      {feedback && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{feedback}</span>
        </div>
      )}

      {/* Customers High-Density Table */}
      <Reveal direction="up" distance={20} duration={0.5} delay={0.08}>
        <AdminTableShell
          title="Verified Importer Directory"
        description="Comprehensive list of accredited international buyers and their commercial preferences"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by Company, Contact Person, Country, or Commodity..."
        totalCount={customers.length}
        loading={isLoading}
        empty={customers.length === 0}
        emptyMessage="No buyer accounts match the search query."
      >
        <table className="min-w-full divide-y divide-neutral-200 text-left text-xs">
          <thead className="bg-neutral-50/90 text-neutral-600 font-semibold border-b border-neutral-200">
            <tr>
              <th className="px-5 py-3">Company Name</th>
              <th className="px-5 py-3">Contact Officer</th>
              <th className="px-5 py-3">Country & Port</th>
              <th className="px-5 py-3">Business Profile</th>
              <th className="px-5 py-3">Interested Commodities</th>
              <th className="px-5 py-3">Lifetime Order Value</th>
              <th className="px-5 py-3">Last Touchpoint</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-700 bg-white">
            {customers.map((c) => (
              <tr
                key={c._id}
                onClick={() => setSelectedCustomerId(c._id)}
                className={`transition-colors cursor-pointer ${
                  selectedCustomerId === c._id
                    ? 'bg-primary-50/80 font-medium border-l-4 border-l-primary-800'
                    : 'hover:bg-neutral-50/80'
                }`}
              >
                <td className="px-5 py-4">
                  <div className="font-bold text-neutral-900 text-sm">{c.companyName}</div>
                  <div className="text-neutral-500 text-[11px] mt-0.5">{c.email}</div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap font-medium text-neutral-800">
                  {c.contactPerson}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="font-semibold text-neutral-900">{c.country}</div>
                  {c.preferredPort && (
                    <div className="text-[11px] text-neutral-500 font-mono">Port: {c.preferredPort}</div>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="capitalize px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 text-[10px] font-semibold tracking-wide">
                    {c.businessType}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="max-w-xs truncate text-[11px] text-neutral-700">
                    {c.interestedProducts?.join(', ') || 'General Commodities'}
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-primary-900 text-sm">
                  ${Number(c.totalOrderValue || 0).toLocaleString()}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-neutral-500 text-[11px] font-mono">
                  {new Date(c.lastContactDate || c.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedCustomerId(c._id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary-800 bg-primary-50 hover:bg-primary-100 rounded-md border border-primary-200/80 transition-colors"
                  >
                    <span>Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>
      </Reveal>

      {/* Buyer Account Slide-over Drawer using AdminDrawer */}
      <AdminDrawer
        isOpen={!!selectedCustomerId && !!activeCustomer}
        onClose={() => setSelectedCustomerId(null)}
        title={activeCustomer?.companyName || 'Buyer Account Dossier'}
        subtitle={`Verified Commercial Account • ${activeCustomer ? activeCustomer.country : ''}`}
        badge={
          activeCustomer && (
            <span className="capitalize px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-800 border border-primary-200 text-[10px] font-bold">
              {activeCustomer.businessType}
            </span>
          )
        }
        maxWidth="max-w-2xl"
      >
        {activeCustomer && (
          <div className="space-y-6 text-xs">
            {/* Lifetime Commercial Value Card */}
            <div className="bg-gradient-to-br from-[#06180E] via-[#0A2619] to-[#04120A] text-white p-5 rounded-xl border border-primary-800 shadow-card flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-300 tracking-wider block">
                  Lifetime Commercial Volume
                </span>
                <div className="font-serif text-2xl font-bold text-white mt-1">
                  ${Number(activeCustomer.totalOrderValue || 0).toLocaleString()} <span className="text-xs text-neutral-300 font-normal">USD</span>
                </div>
                <span className="text-[11px] text-neutral-300 mt-0.5 block">
                  Preferred Payment: <strong>{activeCustomer.paymentTerms || '30% Advance TT'}</strong>
                </span>
              </div>

              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* Corporate Profile Card */}
            <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-3">
              <h3 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-primary-800" />
                <span>Consignee Details & Commercial Terms</span>
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Primary Contact Officer</span>
                  <strong className="text-neutral-900 text-sm">{activeCustomer.contactPerson}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Corporate Email</span>
                  <a href={`mailto:${activeCustomer.email}`} className="text-primary-800 font-semibold hover:underline">
                    {activeCustomer.email}
                  </a>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Phone / WhatsApp</span>
                  <span className="font-medium text-neutral-900">{activeCustomer.phone || activeCustomer.whatsapp || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Preferred Discharge Port</span>
                  <span className="font-medium text-neutral-900">{activeCustomer.preferredPort || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Default Incoterm</span>
                  <span className="font-mono font-bold text-neutral-900">{activeCustomer.preferredIncoterm || 'CIF'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Website</span>
                  <span className="text-neutral-800 font-mono text-[11px]">{activeCustomer.website || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Previous Inquiries / Linked Dossiers */}
            <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-bold text-neutral-900">
                  Linked Inquiries & Negotiations
                </h3>
                <span className="text-xs text-neutral-500 font-mono">
                  {activeCustomer.previousInquiries?.length || 0} RFQs
                </span>
              </div>

              {activeCustomer.previousInquiries?.length > 0 ? (
                <div className="space-y-2">
                  {activeCustomer.previousInquiries.map((inq) => (
                    <div
                      key={inq._id}
                      className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-neutral-900 font-mono">{inq.referenceNo}</strong>
                        <span className="text-neutral-500 block text-[11px] mt-0.5">
                          {new Date(inq.createdAt).toLocaleDateString()} • {inq.incoterm}
                        </span>
                      </div>
                      <AdminStatusBadge status={inq.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-400 italic text-xs py-2">No linked inquiry dossiers recorded yet.</p>
              )}
            </div>

            {/* Interactive Timeline Notes */}
            <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs space-y-3">
              <h3 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary-800" />
                <span>Customer Relationship Timeline</span>
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!noteText.trim()) return;
                  addNoteMutation.mutate({ id: activeCustomer._id, note: noteText.trim() });
                }}
                className="space-y-2.5"
              >
                <textarea
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Log contract discussion, sample feedback, or shipping requirement..."
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:ring-2 focus:ring-primary-800 focus:bg-white"
                />
                <div className="flex justify-end">
                  <Button variant="primary" size="sm" type="submit" loading={addNoteMutation.isPending}>
                    Save Timeline Note
                  </Button>
                </div>
              </form>

              <div className="space-y-2 pt-2 border-t border-neutral-100 max-h-56 overflow-y-auto">
                {activeCustomer.notes?.length > 0 ? (
                  activeCustomer.notes.map((n, i) => (
                    <div key={i} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 text-xs">
                      <div className="flex items-center justify-between text-neutral-400 text-[10px] mb-1">
                        <strong className="text-neutral-800">{n.by}</strong>
                        <span className="font-mono">{new Date(n.at).toLocaleString()}</span>
                      </div>
                      <p className="text-neutral-700">{n.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-400 italic text-xs">No customer relationship notes logged yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminDrawer>

      {/* Register Customer Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-neutral-200 max-h-[90vh] flex flex-col transform-gpu animate-in zoom-in-95 duration-200 [transition-timing-function:var(--ease-enter)]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
              <h3 className="font-serif text-base font-bold text-neutral-900">
                Register International Buyer Profile
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Al-Nour Spices WLL"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Contact Officer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Salim Al-Harbi"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. trade@alnour.com"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. Saudi Arabia"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Business Profile</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  >
                    <option value="importer">Direct Importer</option>
                    <option value="distributor">National Distributor</option>
                    <option value="food_manufacturer">Food Manufacturer / Processor</option>
                    <option value="brand_owner">Private Label Brand Owner</option>
                    <option value="supermarket_chain">Supermarket Retail Chain</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Preferred Discharge Port</label>
                  <input
                    type="text"
                    value={formData.preferredPort}
                    onChange={(e) => setFormData({ ...formData, preferredPort: e.target.value })}
                    placeholder="e.g. Jeddah Islamic Port"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Interested Commodities (comma-separated)</label>
                <input
                  type="text"
                  value={formData.interestedProducts}
                  onChange={(e) => setFormData({ ...formData, interestedProducts: e.target.value })}
                  placeholder="e.g. Cumin Seeds, Dehydrated Onion, Sesame Seeds"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="cta"
                  size="sm"
                  loading={createMutation.isPending}
                >
                  Save Buyer Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Customers;
