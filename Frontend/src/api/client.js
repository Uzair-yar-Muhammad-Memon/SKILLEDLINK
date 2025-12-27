const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function apiFetch(path, options = {}) {
  const { method = 'GET', body, auth } = options;
  const headers = { 'Content-Type': 'application/json' };
  
  if (auth) {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const AuthAPI = {
  async registerUser(name, email, password, phone, city) {
    const response = await apiFetch('/auth/user/signup', {
      method: 'POST',
      body: { name, email, password, phone, city },
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  async registerWorker(name, email, password, phone, city, skillCategory, bio) {
    const response = await apiFetch('/auth/worker/signup', {
      method: 'POST',
      body: { name, email, password, phone, city, skillCategory, bio },
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.worker));
    }
    return response;
  },

  async loginUser(email, password) {
    const response = await apiFetch('/auth/user/login', {
      method: 'POST',
      body: { email, password },
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  async loginWorker(email, password) {
    const response = await apiFetch('/auth/worker/login', {
      method: 'POST',
      body: { email, password },
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.worker));
    }
    return response;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const WorkerAPI = {
  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('skillCategory', filters.category);
    if (filters.city) params.append('city', filters.city);
    return apiFetch(`/workers?${params.toString()}`);
  },

  async getById(id) {
    return apiFetch(`/workers/${id}`);
  },

  async getMyProfile() {
    return apiFetch('/workers/me', { auth: true });
  },

  async updateProfile(profileData) {
    return apiFetch('/workers/update-profile', {
      method: 'PUT',
      body: profileData,
      auth: true,
    });
  },

  async addService(serviceData) {
    return apiFetch('/workers/me/services', {
      method: 'POST',
      body: serviceData,
      auth: true,
    });
  },

  async getMyServices() {
    return apiFetch('/workers/me/services', { auth: true });
  },

  async getWorkerServices(workerId) {
    return apiFetch(`/workers/${workerId}/services`);
  },

  async addSkill(skillData) {
    return apiFetch('/workers/skills', {
      method: 'POST',
      body: skillData,
      auth: true,
    });
  },

  async removeSkill(skillId) {
    return apiFetch(`/workers/skills/${skillId}`, {
      method: 'DELETE',
      auth: true,
    });
  },
};

export const ServiceAPI = {
  async create(serviceData) {
    return apiFetch('/services', {
      method: 'POST',
      body: serviceData,
      auth: true,
    });
  },

  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.city) params.append('city', filters.city);
    return apiFetch(`/services?${params.toString()}`);
  },

  async getById(id) {
    return apiFetch(`/services/${id}`);
  },

  async getMyRequests() {
    return apiFetch('/services/my-requests', { auth: true });
  },

  async getAvailableJobs() {
    return apiFetch('/services/available', { auth: true });
  },

  async getMyJobs() {
    return apiFetch('/services/my-jobs', { auth: true });
  },

  async acceptJob(id) {
    return apiFetch(`/services/${id}/accept`, {
      method: 'PUT',
      auth: true,
    });
  },

  async completeJob(id) {
    return apiFetch(`/services/${id}/complete`, {
      method: 'PUT',
      auth: true,
    });
  },

  async cancelJob(id) {
    return apiFetch(`/services/${id}/cancel`, {
      method: 'PUT',
      auth: true,
    });
  },
};

export const ReviewAPI = {
  async add(workerId, rating, comment) {
    return apiFetch('/reviews/add', {
      method: 'POST',
      body: { workerId, rating, comment },
      auth: true,
    });
  },

  async getWorkerReviews(workerId) {
    return apiFetch(`/reviews/worker/${workerId}`);
  },
};

export const MapAPI = {
  async getWorkerLocations(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.city) params.append('city', filters.city);
    return apiFetch(`/map/worker-locations?${params.toString()}`);
  },
};

export const NotificationAPI = {
  async list() {
    return apiFetch('/notifications', { auth: true });
  },
  async markAsRead(id) {
    return apiFetch(`/notifications/${id}/read`, {
      method: 'PUT',
      auth: true
    });
  },
  async markAllAsRead() {
    return apiFetch('/notifications/mark-all-read', {
      method: 'PUT',
      auth: true
    });
  }
};

export const RequestAPI = {
  async create(requestData) {
    return apiFetch('/requests', {
      method: 'POST',
      body: requestData,
      auth: true
    });
  },

  async getUserRequests(status = null) {
    const params = status ? `?status=${status}` : '';
    return apiFetch(`/requests/user${params}`, { auth: true });
  },

  async getWorkerRequests(status = null) {
    const params = status ? `?status=${status}` : '';
    return apiFetch(`/requests/worker/all${params}`, { auth: true });
  },

  async getById(id) {
    return apiFetch(`/requests/${id}`, { auth: true });
  },

  async accept(id, workerNotes = '') {
    return apiFetch(`/requests/${id}/accept`, {
      method: 'PUT',
      body: { workerNotes },
      auth: true
    });
  },

  async reject(id, workerNotes = '') {
    return apiFetch(`/requests/${id}/reject`, {
      method: 'PUT',
      body: { workerNotes },
      auth: true
    });
  },

  async complete(id) {
    return apiFetch(`/requests/${id}/complete`, {
      method: 'PUT',
      auth: true
    });
  },

  async cancel(id) {
    return apiFetch(`/requests/${id}/cancel`, {
      method: 'PUT',
      auth: true
    });
  },

  async updateStatus(id, status) {
    return apiFetch(`/requests/${id}/status`, {
      method: 'PUT',
      body: { status },
      auth: true
    });
  }
};

export const MessageAPI = {
  async send(messageData) {
    return apiFetch('/messages', {
      method: 'POST',
      body: messageData,
      auth: true
    });
  },

  async getMessages(serviceRequestId) {
    return apiFetch(`/messages/request/${serviceRequestId}`, { auth: true });
  },

  async markAsRead(serviceRequestId) {
    return apiFetch(`/messages/request/${serviceRequestId}/read`, {
      method: 'PUT',
      auth: true
    });
  },

  async getConversations() {
    return apiFetch('/messages/conversations', { auth: true });
  },

  async getUnreadCount() {
    return apiFetch('/messages/unread-count', { auth: true });
  }
};

