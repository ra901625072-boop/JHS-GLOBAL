import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  FileText,
  RotateCw,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import {
  fetchAdminCompanyFacts,
  createAdminCompanyFact,
  updateAdminCompanyFact,
  deleteAdminCompanyFact,
} from '../api';
import AdminStatusBadge from '../components/AdminStatusBadge';

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'identity', label: 'Company Identity' },
  { id: 'certifications', label: 'Certifications & Tax' },
  { id: 'operations', label: 'Export Operations & Ports' },
  { id: 'policy', label: 'Policies & Terms' },
  { id: 'quality', label: 'Quality & Testing' },
  { id: 'contact', label: 'Contact Details' },
];

export const CompanyKnowledgeBase = () => {
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterVerified, setFilterVerified] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFact, setEditingFact] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState('');

  // Form State
  const [formCategory, setFormCategory] = useState('identity');
  const [formKey, setFormKey] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formSource, setFormSource] = useState('client_document');
  const [formSourceDoc, setFormSourceDoc] = useState('');
  const [formVerified, setFormVerified] = useState(false);
  const [formPublic, setFormPublic] = useState(true);
  const [formNotes, setFormNotes] = useState('');

  const loadFacts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (filterVerified === 'verified') params.isVerified = 'true';
      if (filterVerified === 'unverified') params.isVerified = 'false';
      if (search.trim()) params.search = search.trim();

      const res = await fetchAdminCompanyFacts(params);
      setFacts(res.facts || []);
    } catch (err) {
      console.error('Failed to load company facts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacts();
  }, [selectedCategory, filterVerified]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadFacts();
  };

  const openCreateModal = () => {
    setEditingFact(null);
    setFormCategory('identity');
    setFormKey('');
    setFormLabel('');
    setFormValue('');
    setFormSource('client_document');
    setFormSourceDoc('');
    setFormVerified(false);
    setFormPublic(true);
    setFormNotes('');
    setModalOpen(true);
  };

  const openEditModal = (fact) => {
    setEditingFact(fact);
    setFormCategory(fact.category);
    setFormKey(fact.factKey);
    setFormLabel(fact.label);
    setFormValue(fact.factValue);
    setFormSource(fact.source || 'admin_portal');
    setFormSourceDoc(fact.sourceDocument || '');
    setFormVerified(Boolean(fact.isVerified));
    setFormPublic(Boolean(fact.isPublic));
    setFormNotes(fact.notes || '');
    setModalOpen(true);
  };

  const handleSaveFact = async (e) => {
    e.preventDefault();
    if (!formKey.trim() || !formLabel.trim() || !formValue.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        category: formCategory,
        factKey: formKey.trim().toLowerCase(),
        label: formLabel.trim(),
        factValue: formValue.trim(),
        source: formSource,
        sourceDocument: formSourceDoc.trim(),
        isVerified: formVerified,
        isPublic: formPublic,
        notes: formNotes.trim(),
      };

      if (editingFact) {
        await updateAdminCompanyFact(editingFact.id, payload);
        setNotification('Fact updated and re-indexed into AI knowledge base.');
      } else {
        await createAdminCompanyFact(payload);
        setNotification('New company fact created and indexed into AI vector store.');
      }

      setModalOpen(false);
      await loadFacts();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert(`Save error: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, key) => {
    if (!window.confirm(`Are you sure you want to delete fact '${key}'?`)) return;
    try {
      await deleteAdminCompanyFact(id);
      setNotification(`Fact '${key}' removed from knowledge base and vector index.`);
      await loadFacts();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const totalFacts = facts.length;
  const verifiedCount = facts.filter((f) => f.isVerified).length;
  const unverifiedCount = facts.filter((f) => !f.isVerified).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary-800" />
            Company Knowledge Base ("About Us")
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            Structured, versioned source of truth for verified company facts. Used strictly by the visitor AI assistant with zero hallucinations.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openCreateModal}
            className="px-3.5 py-2 rounded-lg bg-primary-900 hover:bg-primary-950 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Company Fact</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-neutral-500 block">Total Knowledge Facts</span>
          <span className="text-2xl font-bold text-neutral-900 mt-1 block">{totalFacts}</span>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">Identity, certifications, ports, and trade policies</span>
        </div>

        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-2xs bg-emerald-50/20">
          <span className="text-xs font-medium text-emerald-700 block flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Facts (Client Documented)
          </span>
          <span className="text-2xl font-bold text-emerald-800 mt-1 block">{verifiedCount}</span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Approved for absolute AI statement & grounding</span>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-2xs bg-amber-50/20">
          <span className="text-xs font-medium text-amber-700 block flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Unverified / TODO(client)
          </span>
          <span className="text-2xl font-bold text-amber-800 mt-1 block">{unverifiedCount}</span>
          <span className="text-[11px] text-amber-600 mt-0.5 block">Treated as unknown by AI desk until verified</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Categories Tab Pill Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-primary-900 text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search & Verification Status Select */}
          <div className="flex items-center gap-2">
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-2 text-neutral-700 focus:outline-none focus:ring-1 focus:ring-primary-800"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search key or value..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg pl-8 pr-3 py-2 w-48 sm:w-60 focus:outline-none focus:ring-1 focus:ring-primary-800"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            </form>
          </div>
        </div>
      </div>

      {/* Facts Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            <RotateCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary-800" />
            Loading company knowledge facts...
          </div>
        ) : facts.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            No company facts match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Fact Key & Label</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Verified Fact Value</th>
                  <th className="py-3 px-4">Source Document</th>
                  <th className="py-3 px-4 text-center">Verification Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {facts.map((fact) => {
                  const isUnconfirmed = !fact.isVerified || fact.factValue.includes('UNKNOWN');
                  return (
                    <tr key={fact.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] font-bold text-primary-900 block">
                          {fact.factKey}
                        </span>
                        <span className="text-neutral-700 font-medium text-[11px] block mt-0.5">
                          {fact.label}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {fact.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-md">
                        <p
                          className={`line-clamp-2 text-[11px] ${
                            isUnconfirmed ? 'text-amber-800 font-medium italic' : 'text-neutral-800'
                          }`}
                        >
                          {fact.factValue}
                        </p>
                        {fact.notes && (
                          <span className="text-[10px] text-neutral-500 block mt-0.5 truncate">
                            Note: {fact.notes}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-neutral-600">
                        {fact.sourceDocument || fact.source}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {fact.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            TODO / Unverified
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(fact)}
                            className="p-1 rounded text-neutral-500 hover:text-primary-800 hover:bg-neutral-100"
                            title="Edit fact"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(fact.id, fact.factKey)}
                            className="p-1 rounded text-neutral-400 hover:text-red-700 hover:bg-red-50"
                            title="Delete fact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900">
                {editingFact ? `Edit Fact: ${editingFact.factKey}` : 'Create New Company Fact'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFact} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded p-2 focus:ring-1 focus:ring-primary-800"
                  >
                    <option value="identity">Identity</option>
                    <option value="certifications">Certifications</option>
                    <option value="operations">Operations</option>
                    <option value="policy">Policy</option>
                    <option value="quality">Quality</option>
                    <option value="contact">Contact</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Fact Key (unique snake_case)
                  </label>
                  <input
                    type="text"
                    required
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value)}
                    placeholder="e.g. cert_fssai"
                    disabled={Boolean(editingFact)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded p-2 font-mono disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Display Label</label>
                <input
                  type="text"
                  required
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="e.g. FSSAI Central License"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Fact Value (Grounding text for AI)
                </label>
                <textarea
                  required
                  rows={4}
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="Exact factual text, registration number, address, or policy details..."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded p-2 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Source Type</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded p-2"
                  >
                    <option value="client_document">Client Document</option>
                    <option value="admin_portal">Admin Portal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Source Document / File
                  </label>
                  <input
                    type="text"
                    value={formSourceDoc}
                    onChange={(e) => setFormSourceDoc(e.target.value)}
                    placeholder="e.g. GST Certificate.pdf"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Internal Notes</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Optional internal clarification or TODO(client) tag"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded p-2"
                />
              </div>

              {/* Verified & Public Checkboxes */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formVerified}
                    onChange={(e) => setFormVerified(e.target.checked)}
                    className="mt-0.5 rounded text-primary-900 focus:ring-primary-800"
                  />
                  <div>
                    <span className="font-bold text-neutral-900 block">Verified Fact</span>
                    <span className="text-[10px] text-neutral-500 block">
                      Check only if confirmed by primary client documents. If unchecked, the AI assistant will treat this as an estimate or unknown.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer pt-2 border-t border-neutral-200">
                  <input
                    type="checkbox"
                    checked={formPublic}
                    onChange={(e) => setFormPublic(e.target.checked)}
                    className="mt-0.5 rounded text-primary-900 focus:ring-primary-800"
                  />
                  <div>
                    <span className="font-bold text-neutral-900 block">Publicly Visible & Embedded</span>
                    <span className="text-[10px] text-neutral-500 block">
                      When checked, this fact is embedded into the pgvector catalogue for public buyer chat inquiries.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-primary-900 hover:bg-primary-950 text-white font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {submitting && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingFact ? 'Update Fact' : 'Create & Index Fact'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyKnowledgeBase;
