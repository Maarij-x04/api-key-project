import request from './apiClient';

export const auditService = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/audit-logs${query ? `?${query}` : ''}`);
  },
  getOne: (id) => request(`/audit-logs/${id}`),
};