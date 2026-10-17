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

// Quotations Management
export const fetchAdminQuotations = async (params = {}) => {
  const response = await apiClient.get('/quotations', { params });
  return {
    quotations: response.data || [],
    meta: response.meta || { total: 0, page: 1, limit: 20, pages: 1 },
  };
};

export const fetchAdminQuotationById = async (id) => {
  const response = await apiClient.get(`/quotations/${id}`);
  return response.data;
};

export const createAdminQuotation = async (data) => {
  const response = await apiClient.post('/quotations', data);
  return response.data;
};

export const updateAdminQuotationStatus = async (id, data) => {
  const response = await apiClient.patch(`/quotations/${id}/status`, data);
  return response.data;
};

export const getQuotationPdfDownloadUrl = (id) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  return `${baseURL}/quotations/${id}/pdf`;
};

// Customer / Buyer CRM Management
export const fetchAdminCustomers = async (params = {}) => {
  const response = await apiClient.get('/customers', { params });
  return {
    customers: response.data || [],
    meta: response.meta || { total: 0, page: 1, limit: 20, pages: 1 },
  };
};

export const fetchAdminCustomerById = async (id) => {
  const response = await apiClient.get(`/customers/${id}`);
  return response.data;
};

export const createAdminCustomer = async (data) => {
  const response = await apiClient.post('/customers', data);
  return response.data;
};

export const updateAdminCustomer = async (id, data) => {
  const response = await apiClient.put(`/customers/${id}`, data);
  return response.data;
};

export const addAdminCustomerNote = async (id, note) => {
  const response = await apiClient.post(`/customers/${id}/notes`, { note });
  return response.data;
};

// Orders & Shipments Management
export const fetchAdminOrders = async (params = {}) => {
  const response = await apiClient.get('/orders', { params });
  return {
    orders: response.data || [],
    meta: response.meta || { total: 0, page: 1, limit: 20, pages: 1 },
  };
};

export const fetchAdminOrderById = async (id) => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
};

export const createAdminOrder = async (data) => {
  const response = await apiClient.post('/orders', data);
  return response.data;
};

export const updateAdminOrderStatus = async (id, data) => {
  const response = await apiClient.patch(`/orders/${id}/status`, data);
  return response.data;
};

export const updateAdminShipmentDetails = async (id, data) => {
  const response = await apiClient.patch(`/orders/${id}/shipment`, data);
  return response.data;
};

export const addAdminOrderDocument = async (id, data) => {
  const response = await apiClient.post(`/orders/${id}/documents`, data);
  return response.data;
};

export const removeAdminOrderDocument = async (id, docId) => {
  const response = await apiClient.delete(`/orders/${id}/documents/${docId}`);
  return response.data;
};

// Tasks & Follow-ups Queue
export const fetchAdminTasks = async (params = {}) => {
  const response = await apiClient.get('/tasks', { params });
  return {
    tasks: response.data || [],
    meta: response.meta || { total: 0, page: 1, limit: 20, pages: 1 },
  };
};

export const fetchAdminTodayTasks = async () => {
  const response = await apiClient.get('/tasks/today');
  return response.data || [];
};

export const createAdminTask = async (data) => {
  const response = await apiClient.post('/tasks', data);
  return response.data;
};

export const updateAdminTaskStatus = async (id, data) => {
  const response = await apiClient.patch(`/tasks/${id}/status`, data);
  return response.data;
};

export const deleteAdminTask = async (id) => {
  const response = await apiClient.delete(`/tasks/${id}`);
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

export const generateAiFollowUpDraft = async (params) => {
  const response = await apiClient.post('/ai/admin/follow-up-draft', params);
  return response.data;
};

export const generateAiProductContent = async (params) => {
  const response = await apiClient.post('/ai/admin/product-content', params);
  return response.data;
};

export const checkAiDuplicates = async (params) => {
  const response = await apiClient.get('/ai/admin/duplicates', { params });
  return response.data;
};

export const fetchAiSalesInsights = async (question) => {
  const response = await apiClient.post('/ai/admin/sales-insights', { question });
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

export const fetchPublicCompanyFacts = async () => {
  const response = await apiClient.get('/company-facts');
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

// AI Chat Audit Logs & Knowledge Gap Review
export const fetchAiChatAuditLogs = async (params = {}) => {
  const response = await apiClient.get('/ai/admin/audit-logs', { params });
  return response.data;
};

export const fetchRepeatedUnknowns = async () => {
  const response = await apiClient.get('/ai/admin/repeated-unknowns');
  return response.data;
};

export const resolveAiChatAuditLog = async (id, data = {}) => {
  const response = await apiClient.patch(`/ai/admin/audit-logs/${id}/resolve`, data);
  return response.data;
};
