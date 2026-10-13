import apiClient from '../../services/apiClient';

export const fetchCategories = async () => {
  const response = await apiClient.get('/categories');
  return response.data;
};

export const fetchCategoryBySlug = async (slug) => {
  const response = await apiClient.get(`/categories/${slug}`);
  return response.data;
};

export const fetchProducts = async (params = {}) => {
  const response = await apiClient.get('/products', { params });
  return {
    items: response.data,
    meta: response.meta,
  };
};

export const fetchFeaturedProducts = async () => {
  const response = await apiClient.get('/products/featured');
  return response.data;
};

export const fetchProductBySlug = async (slug) => {
  const response = await apiClient.get(`/products/${slug}`);
  return response.data;
};

export const fetchRelatedProducts = async (slug) => {
  const response = await apiClient.get(`/products/${slug}/related`);
  return response.data;
};

export const fetchSearchSuggestions = async (q) => {
  if (!q || !q.trim()) return [];
  const response = await apiClient.get('/search/suggest', { params: { q } });
  return response.data;
};
