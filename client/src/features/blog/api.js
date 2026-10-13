import apiClient from '../../services/apiClient';

export const fetchBlogPosts = async (params = {}) => {
  const response = await apiClient.get('/blog', { params });
  return {
    posts: response.data || [],
    meta: response.meta || { total: 0, page: 1, limit: 10, pages: 1 },
  };
};

export const fetchBlogPostBySlug = async (slug) => {
  const response = await apiClient.get(`/blog/${slug}`);
  return response.data; // { post, related }
};
