import request from './apiClient';

export const adminService = {
  listUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users${query ? `?${query}` : ''}`);
  },
  getUser: (id) => request(`/admin/users/${id}`),
  updateUser: (id, payload) => request(`/admin/users/${id}`, { method: 'PATCH', body: payload }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  listApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/applications${query ? `?${query}` : ''}`);
  },
  listAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },
};