import request from './apiClient';

export const dashboardService = {
  summary: () => request('/dashboard'),
  requestChart: () => request('/dashboard/request-chart'),
  statusChart: () => request('/dashboard/status-chart'),
  topApplications: () => request('/dashboard/top-applications'),
  topEndpoints: () => request('/dashboard/top-endpoints'),
};