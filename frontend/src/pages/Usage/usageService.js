import request from './apiClient';

export const usageService = {
  listForApplication: (applicationId) => request(`/applications/${applicationId}/usage`),
};