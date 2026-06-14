import axios from 'axios';

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Service modules
export const authService = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const userService = {
  getAll: (p) => api.get('/users', { params: p }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (d) => api.post('/users', d),
  update: (id, d) => api.put(`/users/${id}`, d),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
  resetPassword: (id, d) => api.put(`/users/${id}/reset-password`, d),
};

export const studentService = {
  getAll: (p) => api.get('/students', { params: p }),
  getOne: (id) => api.get(`/students/${id}`),
  getMe: () => api.get('/students/me'),
  create: (d) => api.post('/students', d),
  update: (id, d) => api.put(`/students/${id}`, d),
  delete: (id) => api.delete(`/students/${id}`),
};

export const teacherService = {
  getAll: (p) => api.get('/teachers', { params: p }),
  getOne: (id) => api.get(`/teachers/${id}`),
  getMe: () => api.get('/teachers/me'),
  create: (d) => api.post('/teachers', d),
  update: (id, d) => api.put(`/teachers/${id}`, d),
  delete: (id) => api.delete(`/teachers/${id}`),
};

export const classService = {
  getAll: () => api.get('/classes'),
  getOne: (id) => api.get(`/classes/${id}`),
  create: (d) => api.post('/classes', d),
  update: (id, d) => api.put(`/classes/${id}`, d),
  delete: (id) => api.delete(`/classes/${id}`),
};

export const subjectService = {
  getAll: (p) => api.get('/subjects', { params: p }),
  getOne: (id) => api.get(`/subjects/${id}`),
  create: (d) => api.post('/subjects', d),
  update: (id, d) => api.put(`/subjects/${id}`, d),
  delete: (id) => api.delete(`/subjects/${id}`),
};

export const resultService = {
  getAll: (p) => api.get('/results', { params: p }),
  getMy: (p) => api.get('/results/my', { params: p }),
  upsert: (d) => api.post('/results', d),
  bulk: (d) => api.post('/results/bulk', d),
  delete: (id) => api.delete(`/results/${id}`),
  reportCard: (studentId, p) => api.get(`/results/report-card/${studentId}`, { params: p }),
};

export const attendanceService = {
  mark: (d) => api.post('/attendance', d),
  getAll: (p) => api.get('/attendance', { params: p }),
  getMy: () => api.get('/attendance/my'),
  getSummary: (studentId) => api.get(`/attendance/summary/${studentId}`),
  delete: (id) => api.delete(`/attendance/${id}`),
};

export const announcementService = {
  getAll: (p) => api.get('/announcements', { params: p }),
  getOne: (id) => api.get(`/announcements/${id}`),
  create: (d) => api.post('/announcements', d),
  update: (id, d) => api.put(`/announcements/${id}`, d),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const dashboardService = {
  stats: () => api.get('/dashboard/stats'),
};
