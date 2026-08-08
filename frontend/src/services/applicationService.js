import request from './apiClient';

export const applicationService = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/applications${query ? `?${query}` : ''}`);
  },
  getOne: (id) => request(`/applications/${id}`),
  create: (payload) => request('/applications', { method: 'POST', body: payload }),
  update: (id, payload) => request(`/applications/${id}`, { method: 'PATCH', body: payload }),
  remove: (id) => request(`/applications/${id}`, { method: 'DELETE' }),
};