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

// Product Catalogue Management
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
