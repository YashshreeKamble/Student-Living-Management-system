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

  // Admin
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

  sendNotice: (title, message, audience = 'All residents') =>
    request('/api/admin/notices', {
      method: 'POST',
      body: { title, message, audience }
    })
};

export default api;
