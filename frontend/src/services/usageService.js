import request from './apiClient';

export const usageService = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/usage${query ? `?${query}` : ''}`);
  },
  listForApplication: (applicationId) => request(`/applications/${applicationId}/usage`),
};