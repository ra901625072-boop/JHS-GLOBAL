import apiClient from '../../services/apiClient';

/**
 * Send buyer query to server-side AI Export Assistant
 * @param {{ message: string, history?: Array<{ role: 'user' | 'assistant', content: string }> }} data
 * @returns {Promise<{ reply: string, sources: Array<{ name: string, slug: string, hsCode: string, moq: string }> }>}
 */
export const sendAiChatMessage = async (data) => {
  const response = await apiClient.post('/ai/chat', data);
  return response.data;
};

/**
 * Natural language catalogue smart search parser
 * @param {string} query
 */
export const runSmartSearch = async (query) => {
  const response = await apiClient.post('/ai/smart-search', { query });
  return response.data;
};

/**
 * Free-text RFQ quick-fill parser
 * @param {string} text
 */
export const parseRfqText = async (text) => {
  const response = await apiClient.post('/ai/parse-rfq', { text });
  return response.data;
};

/**
 * Submit thumbs-up / thumbs-down feedback for an AI assistant response
 * @param {{ logId: number, rating: 'helpful' | 'unhelpful', comment?: string }} data
 */
export const submitAiChatFeedback = async (data) => {
  const response = await apiClient.post('/ai/chat/feedback', data);
  return response.data;
};
