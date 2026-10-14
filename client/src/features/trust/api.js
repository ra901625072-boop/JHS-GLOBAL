import apiClient from '../../services/apiClient';

export const fetchCertificates = async () => {
  const response = await apiClient.get('/certificates');
  return response.data;
};

export const fetchTestimonials = async () => {
  const response = await apiClient.get('/testimonials');
  return response.data;
};

export const fetchMarketRegions = async () => {
  const response = await apiClient.get('/market-regions');
  return response.data;
};

export const fetchFaqs = async (group) => {
  const response = await apiClient.get('/faqs', {
    params: group ? { group } : {},
  });
  return response.data;
};

export const fetchFeaturedFaqs = async () => {
  const response = await apiClient.get('/faqs', {
    params: { featured: 'true' },
  });
  return response.data;
};
