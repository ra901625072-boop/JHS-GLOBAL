import apiClient from '../services/apiClient';

export const loginAdmin = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const fetchAdminMe = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const logoutAdmin = async () => {
  const response = await apiClient.post('/auth/logout');
  return response;
};

// Dashboard Operations Metrics
export const fetchAdminDashboard = async () => {
  const response = await apiClient.get('/admin/dashboard');
  return response.data;
};

// Inquiries / Leads
export const fetchAdminInquiries = async (params = {}) => {
  const response = await apiClient.get('/admin/inquiries', { params });
  return {
    inquiries: response.data || [],
    meta: response.meta || { total: 0, page: 1, limit: 20, pages: 1 },
  };
};

export const fetchAdminInquiryById = async (id) => {
  const response = await apiClient.get(`/admin/inquiries/${id}`);
  return response.data;
};

export const updateAdminInquiryStatus = async (id, data) => {
  const response = await apiClient.patch(`/admin/inquiries/${id}/status`, data);
  return response.data;
};

export const sendAdminInquiryReply = async (id, data) => {
  const response = await apiClient.post(`/admin/inquiries/${id}/reply`, data);
  return response.data;
};

export const flagAdminInquirySpam = async (id, reason = '') => {
  const response = await apiClient.post(`/admin/inquiries/${id}/spam`, { reason });
  return response.data;
};

export const unspamAdminInquiry = async (id) => {
  const response = await apiClient.post(`/admin/inquiries/${id}/unspam`);
  return response.data;
};

// Sample Dispatch Desk Management
export const fetchAdminSamples = async (params = {}) => {
  const response = await apiClient.get('/samples', { params });
  return {
    samples: response.data || [],
    meta: response.meta || { total: 0, page: 1, limit: 20, pages: 1 },
  };
};

export const fetchAdminSampleById = async (id) => {
  const response = await apiClient.get(`/samples/${id}`);
  return response.data;
};

export const updateAdminSample = async (id, data) => {
  const response = await apiClient.patch(`/samples/${id}`, data);
  return response.data;
};

export const dispatchAdminSample = async (id, data) => {
  const response = await apiClient.post(`/samples/${id}/dispatch`, data);
  return response.data;
};

export const attachAdminSampleDocument = async (id, data) => {
  const response = await apiClient.post(`/samples/${id}/documents`, data);
  return response.data;
};

// Product Catalogue Management
export const fetchAdminProducts = async (params = {}) => {
  const response = await apiClient.get('/admin/products', { params });
  return {
    products: response.data || [],
    meta: response.meta || { total: 0, page: 1, limit: 20, pages: 1 },
  };
};

export const fetchAdminProductById = async (id) => {
  const response = await apiClient.get(`/admin/products/${id}`);
  return response.data;
};

export const createAdminProduct = async (data) => {
  const response = await apiClient.post('/admin/products', data);
  return response.data;
};

export const updateAdminProduct = async (id, data) => {
  const response = await apiClient.put(`/admin/products/${id}`, data);
  return response.data;
};

export const deleteAdminProduct = async (id) => {
  const response = await apiClient.delete(`/admin/products/${id}`);
  return response.data;
};

export const toggleAdminProductActive = async (id) => {
  const response = await apiClient.patch(`/admin/products/${id}/toggle-active`);
  return response.data;
};

export const toggleAdminProductFeatured = async (id) => {
  const response = await apiClient.patch(`/admin/products/${id}/toggle-featured`);
  return response.data;
};

export const verifyAdminProductSpec = async (id, data) => {
  const response = await apiClient.patch(`/admin/products/${id}/verify-spec`, data);
  return response.data;
};

export const attachAdminProductDocument = async (id, data) => {
  const response = await apiClient.post(`/admin/products/${id}/documents`, data);
  return response.data;
};

export const removeAdminProductDocument = async (id, docId) => {
  const response = await apiClient.delete(`/admin/products/${id}/documents/${docId}`);
  return response.data;
};

// Categories & Divisions Governance
export const fetchAdminCategories = async (params = {}) => {
  const response = await apiClient.get('/admin/categories', { params });
  return response.data || [];
};

export const fetchAdminCategoryById = async (id) => {
  const response = await apiClient.get(`/admin/categories/${id}`);
  return response.data;
};

export const createAdminCategory = async (data) => {
  const response = await apiClient.post('/admin/categories', data);
  return response.data;
};

export const updateAdminCategory = async (id, data) => {
  const response = await apiClient.put(`/admin/categories/${id}`, data);
  return response.data;
};

export const deleteAdminCategory = async (id) => {
  const response = await apiClient.delete(`/admin/categories/${id}`);
  return response.data;
};

export const toggleAdminCategoryActive = async (id) => {
  const response = await apiClient.patch(`/admin/categories/${id}/toggle-active`);
  return response.data;
};

export const reorderAdminCategories = async (items) => {
  const response = await apiClient.patch('/admin/categories/reorder', { items });
  return response.data;
};

// Certificates & Statutory Compliance Management
export const fetchAdminCertificates = async (params = {}) => {
  const response = await apiClient.get('/admin/certificates', { params });
  return response.data || [];
};

export const fetchAdminCertificateById = async (id) => {
  const response = await apiClient.get(`/admin/certificates/${id}`);
  return response.data;
};

export const createAdminCertificate = async (data) => {
  const response = await apiClient.post('/admin/certificates', data);
  return response.data;
};

export const updateAdminCertificate = async (id, data) => {
  const response = await apiClient.put(`/admin/certificates/${id}`, data);
  return response.data;
};

export const deleteAdminCertificate = async (id) => {
  const response = await apiClient.delete(`/admin/certificates/${id}`);
  return response.data;
};

export const toggleAdminCertificatePublic = async (id) => {
  const response = await apiClient.patch(`/admin/certificates/${id}/toggle-public`);
  return response.data;
};

export const reorderAdminCertificates = async (items) => {
  const response = await apiClient.patch('/admin/certificates/reorder', { items });
  return response.data;
};

// Blog & Trade Intelligence CMS Management
export const fetchAdminBlogPosts = async (params = {}) => {
  const response = await apiClient.get('/admin/blog', { params });
  return {
    posts: response.data || [],
    meta: response.meta || { total: 0, page: 1, limit: 20, pages: 1 },
  };
};

export const fetchAdminBlogPostById = async (id) => {
  const response = await apiClient.get(`/admin/blog/${id}`);
  return response.data;
};

export const createAdminBlogPost = async (data) => {
  const response = await apiClient.post('/admin/blog', data);
  return response.data;
};

export const updateAdminBlogPost = async (id, data) => {
  const response = await apiClient.put(`/admin/blog/${id}`, data);
  return response.data;
};

export const deleteAdminBlogPost = async (id) => {
  const response = await apiClient.delete(`/admin/blog/${id}`);
  return response.data;
};

export const updateAdminBlogPostStatus = async (id, data) => {
  const response = await apiClient.patch(`/admin/blog/${id}/status`, data);
  return response.data;
};

// FAQ Manager Desk
export const fetchAdminFaqs = async (params = {}) => {
  const response = await apiClient.get('/admin/faqs', { params });
  return {
    faqs: response.data?.faqs || [],
    groups: response.data?.groups || [],
    metrics: response.data?.metrics || { total: 0, active: 0, inactive: 0, homepageFeatured: 0, groupCount: 0 },
    meta: response.data?.pagination || response.meta || { total: 0, page: 1, limit: 50, pages: 1 },
  };
};

export const fetchAdminFaqById = async (id) => {
  const response = await apiClient.get(`/admin/faqs/${id}`);
  return response.data;
};

export const createAdminFaq = async (data) => {
  const response = await apiClient.post('/admin/faqs', data);
  return response.data;
};

export const updateAdminFaq = async (id, data) => {
  const response = await apiClient.put(`/admin/faqs/${id}`, data);
  return response.data;
};

export const deleteAdminFaq = async (id) => {
  const response = await apiClient.delete(`/admin/faqs/${id}`);
  return response.data;
};

export const toggleAdminFaqHome = async (id) => {
  const response = await apiClient.patch(`/admin/faqs/${id}/toggle-home`);
  return response.data;
};

export const toggleAdminFaqActive = async (id) => {
  const response = await apiClient.patch(`/admin/faqs/${id}/toggle-active`);
  return response.data;
};

export const reorderAdminFaqs = async (items) => {
  const response = await apiClient.patch('/admin/faqs/reorder', { items });
  return response.data;
};


// AI Intelligence Tools
export const runInquiryAiSummarize = async (id) => {
  const response = await apiClient.post(`/ai/admin/inquiries/${id}/summarize`);
  return response.data;
};

export const generateInquiryAiReplyDraft = async (id, options = {}) => {
  const response = await apiClient.post(`/ai/admin/inquiries/${id}/reply-draft`, options);
  return response.data;
};

export const generateAiProductContent = async (params) => {
  const response = await apiClient.post('/ai/admin/product-content', params);
  return response.data;
};

export const fetchAiCatalogueAudit = async () => {
  const response = await apiClient.get('/ai/admin/catalogue-audit');
  return response.data;
};

// Company Knowledge Base Management
export const fetchAdminCompanyFacts = async (params = {}) => {
  const response = await apiClient.get('/company-facts/admin', { params });
  return response.data;
};

export const createAdminCompanyFact = async (data) => {
  const response = await apiClient.post('/company-facts/admin', data);
  return response.data;
};

export const updateAdminCompanyFact = async (id, data) => {
  const response = await apiClient.put(`/company-facts/admin/${id}`, data);
  return response.data;
};

export const deleteAdminCompanyFact = async (id) => {
  const response = await apiClient.delete(`/company-facts/admin/${id}`);
  return response.data;
};

// AI Desk & RAG Knowledge Repository Summary
export const fetchAiDeskSummary = async () => {
  const response = await apiClient.get('/admin/ai-desk/summary');
  return response.data;
};

export const triggerAdminReindex = async () => {
  const response = await apiClient.post('/admin/ai-desk/reindex');
  return response.data;
};

// ─── Team Users Governance & RBAC ───────────────────────────
export const fetchAdminUsers = async (params = {}) => {
  const response = await apiClient.get('/admin/users', { params });
  return {
    users: response.data || [],
    pagination: response.meta || { total: 0, page: 1, limit: 20, pages: 1 },
  };
};

export const fetchAdminUserById = async (id) => {
  const response = await apiClient.get(`/admin/users/${id}`);
  return response.data;
};

export const createAdminUser = async (data) => {
  const response = await apiClient.post('/admin/users', data);
  return response.data;
};

export const updateAdminUser = async (id, data) => {
  const response = await apiClient.put(`/admin/users/${id}`, data);
  return response.data;
};

export const toggleAdminUserActive = async (id) => {
  const response = await apiClient.patch(`/admin/users/${id}/toggle-active`);
  return response.data;
};

export const resetAdminUserPassword = async (id, data) => {
  const response = await apiClient.post(`/admin/users/${id}/reset-password`, data);
  return response.data;
};

// ─── Company Profile, Founders & System Settings ────────────
export const fetchCompanyProfileSettings = async () => {
  const response = await apiClient.get('/admin/settings/company-profile');
  return response.data;
};

export const updateCompanyProfileSettings = async (data) => {
  const response = await apiClient.put('/admin/settings/company-profile', data);
  return response.data;
};

export const fetchSystemHealth = async () => {
  const response = await apiClient.get('/admin/settings/system-health');
  return response.data;
};

export const flushServerCache = async () => {
  const response = await apiClient.post('/admin/settings/cache-flush');
  return response.data;
};
