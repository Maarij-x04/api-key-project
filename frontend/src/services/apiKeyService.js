import request from './apiClient';

export const apiKeyService = {
  listForApplication: (applicationId) => request(`/applications/${applicationId}/api-keys`),
  create: (applicationId, payload) =>
    request(`/applications/${applicationId}/api-keys`, { method: 'POST', body: payload }),
  update: (id, payload) => request(`/api-keys/${id}`, { method: 'PATCH', body: payload }),
  rotate: (id) => request(`/api-keys/${id}/rotate`, { method: 'POST' }),
  revoke: (id) => request(`/api-keys/${id}/revoke`, { method: 'PATCH' }),
  restore: (id) => request(`/api-keys/${id}/restore`, { method: 'PATCH' }),
  remove: (id) => request(`/api-keys/${id}`, { method: 'DELETE' }),
};