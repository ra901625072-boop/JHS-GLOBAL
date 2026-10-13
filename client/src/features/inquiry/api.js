import apiClient from '../../services/apiClient';

export const submitRfq = async (data) => {
  const response = await apiClient.post('/inquiries', data);
  return response.data;
};

export const submitSample = async (data) => {
  const response = await apiClient.post('/samples', data);
  return response.data;
};
