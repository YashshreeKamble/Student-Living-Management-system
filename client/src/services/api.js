const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include'
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${path}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (identifier, password, role) =>
    request('/api/auth/login', {
      method: 'POST',
      body: { identifier, password, role }
    }),

  register: (name, email, password) =>
    request('/api/auth/register', {
      method: 'POST',
      body: { name, email, password }
    }),

  getMe: () => request('/api/auth/me'),

  logout: () =>
    request('/api/auth/logout', {
      method: 'POST'
    }),

  // Admin original overview
  getAdminDashboard: () => request('/api/admin/dashboard'),

  approveStudent: (id, room, bed) =>
    request(`/api/admin/students/${id}/approve`, {
      method: 'PATCH',
      body: { room, bed }
    }),

  updateAdminAccount: (name, email, password) =>
    request('/api/admin/account', {
      method: 'PATCH',
      body: { name, email, password }
    }),

  sendNoticeLegacy: (title, message, audience = 'All residents') =>
    request('/api/admin/notices', {
      method: 'POST',
      body: { title, message, audience }
    }),

  // ============================================
  // TRADITIONAL REGISTERS
  // ============================================

  // 1. Admission Register
  getAdmissions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/registers/admissions${query ? `?${query}` : ''}`);
  },

  updateAdmission: (id, data) =>
    request(`/api/registers/admissions/${id}`, {
      method: 'PATCH',
      body: data
    }),

  admitResident: (data) =>
    request('/api/registers/admissions', {
      method: 'POST',
      body: data
    }),

  // 2. Rent & Payment Ledger
  getLedger: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/registers/ledger${query ? `?${query}` : ''}`);
  },

  recordPayment: (data) =>
    request('/api/registers/ledger', {
      method: 'POST',
      body: data
    }),

  getReceipt: (id) => request(`/api/registers/ledger/${id}/receipt`),

  // 3. Visitor & Outpass Register
  getVisitors: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/registers/visitors${query ? `?${query}` : ''}`);
  },

  logVisitor: (data) =>
    request('/api/registers/visitors', {
      method: 'POST',
      body: data
    }),

  markVisitorExit: (id) =>
    request(`/api/registers/visitors/${id}/exit`, {
      method: 'PATCH'
    }),

  getOutpasses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/registers/outpasses${query ? `?${query}` : ''}`);
  },

  createOutpass: (data) =>
    request('/api/registers/outpasses', {
      method: 'POST',
      body: data
    }),

  updateOutpassStatus: (id, action, remarks = '') =>
    request(`/api/registers/outpasses/${id}/status`, {
      method: 'PATCH',
      body: { action, remarks }
    }),

  // 4. Mess & Meal Register
  getMessMenu: () => request('/api/registers/mess/menu'),

  updateMessMenu: (dayOfWeek, data) =>
    request(`/api/registers/mess/menu/${dayOfWeek}`, {
      method: 'PUT',
      body: data
    }),

  getMessAttendance: (date) =>
    request(`/api/registers/mess/attendance${date ? `?date=${date}` : ''}`),

  markMessAttendance: (studentId, date, meal, present) =>
    request('/api/registers/mess/attendance', {
      method: 'POST',
      body: { studentId, date, meal, present }
    }),

  // 5. Complaint Register
  getComplaints: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/registers/complaints${query ? `?${query}` : ''}`);
  },

  createComplaint: (data) =>
    request('/api/registers/complaints', {
      method: 'POST',
      body: data
    }),

  updateComplaint: (id, data) =>
    request(`/api/registers/complaints/${id}`, {
      method: 'PATCH',
      body: data
    }),

  // 6. Digital Notice Board
  getNotices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/registers/notices${query ? `?${query}` : ''}`);
  },

  createNotice: (data) =>
    request('/api/registers/notices', {
      method: 'POST',
      body: data
    }),

  toggleArchiveNotice: (id) =>
    request(`/api/registers/notices/${id}/archive`, {
      method: 'PATCH'
    })
};

export default api;
