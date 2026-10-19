import axios from 'axios';

// When hosted on a public domain (like Netlify), never default to localhost:5000 to avoid Chrome's PNA popup
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

const API_BASE = import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.startsWith('http') && !import.meta.env.VITE_API_BASE_URL.includes('localhost')
  ? import.meta.env.VITE_API_BASE_URL
  : (isLocalhost ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api') : '/api');

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Firebase or demo token to each request
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('codesense_token') || 'dev-token-codesense-admin';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const apiService = {
  // Health
  getHealth: () => api.get('/health'),

  // Analyses
  createAnalysis: (payload) => api.post('/analyses', payload),
  listAnalyses: () => api.get('/analyses'),
  getAnalysis: (id) => api.get(`/analyses/${id}`),
  deleteAnalysis: (id) => api.delete(`/analyses/${id}`),
  validateCode: (id, target = 'corrected') => api.post(`/analyses/${id}/validate`, { target }),

  // Reports
  createReport: (id, language = 'en') => api.post(`/analyses/${id}/reports`, { language }),
  listReports: () => api.get('/reports'),
  downloadReportUrl: (reportId) => `${API_BASE}/reports/${reportId}/download`,

  // Download PDF as blob (includes auth header automatically via interceptor)
  downloadReport: async (reportId, fileName) => {
    const response = await api.get(`/reports/${reportId}/download`, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || `CodeSense-Report-${reportId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return response;
  },

  // Database Explorer
  getDatabaseTables: () => api.get('/database/tables'),
  getTableData: (table) => api.get(`/database/table/${table}`)
};

export default api;
