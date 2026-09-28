import api from './api';

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
};

export const assetService = {
    getAll: (params) => api.get('/assets', { params }),
    getOne: (id) => api.get(`/assets/${id}`),
    create: (data) => api.post('/assets', data),
    update: (id, data) => api.put(`/assets/${id}`, data),
    delete: (id) => api.delete(`/assets/${id}`),
    changeStatus: (id, data) => api.post(`/assets/${id}/status`, data),
    retire: (id, data) => api.post(`/assets/${id}/retire`, data),
    getLifecycle: (id) => api.get(`/assets/${id}/lifecycle`),
};

export const locationService = {
    getAll: (params) => api.get('/locations', { params }),
    getOne: (id) => api.get(`/locations/${id}`),
    create: (data) => api.post('/locations', data),
    update: (id, data) => api.put(`/locations/${id}`, data),
};

export const departmentService = {
    getAll: () => api.get('/departments'),
    getOne: (id) => api.get(`/departments/${id}`),
    create: (data) => api.post('/departments', data),
    update: (id, data) => api.put(`/departments/${id}`, data),
};

export const maintenanceService = {
    getAll: (params) => api.get('/maintenance', { params }),
    getOne: (id) => api.get(`/maintenance/${id}`),
    create: (data) => api.post('/maintenance', data),
    update: (id, data) => api.put(`/maintenance/${id}`, data),
};

export const inspectionService = {
    getAll: (params) => api.get('/inspections', { params }),
    create: (data) => api.post('/inspections', data),
    update: (id, data) => api.put(`/inspections/${id}`, data),
};

export const transferService = {
    getAll: (params) => api.get('/transfers', { params }),
    create: (data) => api.post('/transfers', data),
    update: (id, data) => api.put(`/transfers/${id}`, data),
};

export const dashboardService = {
    getStats: () => api.get('/dashboard/stats'),
    getCharts: () => api.get('/dashboard/charts'),
    getActivity: () => api.get('/dashboard/activity'),
    getLocations: () => api.get('/dashboard/locations'),
};

export const alertService = {
    getAll: (params) => api.get('/alerts', { params }),
    getUnreadCount: () => api.get('/alerts/unread-count'),
    markRead: (id) => api.put(`/alerts/${id}/read`),
    markAllRead: () => api.put('/alerts/mark-all-read'),
};

export const userService = {
    getAll: () => api.get('/users'),
    getOne: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    getRoles: () => api.get('/users/roles'),
};

export const auditService = {
    getAll: (params) => api.get('/audit-logs', { params }),
};

export const reportService = {
    getReport: (params) => api.get('/reports', { params }),
};
