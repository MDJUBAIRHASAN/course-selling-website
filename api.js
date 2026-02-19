/**
 * api.js — Shared API helper for SkillForge frontend
 * Provides reusable fetch wrappers & token management
 */

const API_BASE = '/api';

function getToken() { return localStorage.getItem('sf_token'); }
function setToken(token) { localStorage.setItem('sf_token', token); }
function removeToken() { localStorage.removeItem('sf_token'); }

async function apiFetch(path, opts = {}) {
    const token = getToken();
    const headers = { ...(opts.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
}

const api = {
    // Auth
    login: (email, password) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (name, email, password) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
    getProfile: () => apiFetch('/auth/me'),
    updateProfile: (data) => apiFetch('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),

    // Courses
    getCourses: (query = '') => apiFetch(`/courses${query ? '?' + query : ''}`),
    getCourse: (id) => apiFetch(`/courses/${id}`),
    createCourse: (data) => apiFetch('/courses', { method: 'POST', body: JSON.stringify(data) }),
    updateCourse: (id, data) => apiFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCourse: (id) => apiFetch(`/courses/${id}`, { method: 'DELETE' }),

    // Users
    getUsers: (query = '') => apiFetch(`/users${query ? '?' + query : ''}`),
    getUser: (id) => apiFetch(`/users/${id}`),
    createUser: (data) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
    updateUser: (id, data) => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteUser: (id) => apiFetch(`/users/${id}`, { method: 'DELETE' }),

    // Orders
    getOrders: (query = '') => apiFetch(`/orders${query ? '?' + query : ''}`),
    purchase: (courseId, payment, paymentPhone, transactionId) => apiFetch('/orders', { method: 'POST', body: JSON.stringify({ courseId, payment, paymentPhone, transactionId }) }),
    updateOrderStatus: (id, status) => apiFetch(`/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
    getMyOrders: () => apiFetch('/orders/my/purchases'),

    // Content
    getContent: (courseId) => apiFetch(`/content/${courseId}`),
    addModule: (courseId, data) => apiFetch(`/content/${courseId}/modules`, { method: 'POST', body: JSON.stringify(data) }),
    updateModule: (courseId, mi, data) => apiFetch(`/content/${courseId}/modules/${mi}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteModule: (courseId, mi) => apiFetch(`/content/${courseId}/modules/${mi}`, { method: 'DELETE' }),
    addLesson: (courseId, mi, data) => apiFetch(`/content/${courseId}/modules/${mi}/lessons`, { method: 'POST', body: JSON.stringify(data) }),
    updateLesson: (courseId, mi, li, data) => apiFetch(`/content/${courseId}/modules/${mi}/lessons/${li}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteLesson: (courseId, mi, li) => apiFetch(`/content/${courseId}/modules/${mi}/lessons/${li}`, { method: 'DELETE' }),
    addResource: (courseId, data) => apiFetch(`/content/${courseId}/resources`, { method: 'POST', body: JSON.stringify(data) }),
    updateResource: (courseId, ri, data) => apiFetch(`/content/${courseId}/resources/${ri}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteResource: (courseId, ri) => apiFetch(`/content/${courseId}/resources/${ri}`, { method: 'DELETE' }),

    // Settings
    getSettings: () => apiFetch('/settings'),
    updateSettings: (data) => apiFetch('/settings', { method: 'PUT', body: JSON.stringify(data) }),

    // Site Config (CMS)
    getSiteConfig: () => apiFetch('/config'),
    updateSiteConfig: (data) => apiFetch('/config', { method: 'PUT', body: JSON.stringify(data) }),
};
