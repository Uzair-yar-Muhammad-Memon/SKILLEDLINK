const API_BASE = 'http://localhost:5000/api';

async function apiFetch(path, options = {}) {
  const { method = 'GET', body, auth } = options;
  const headers = { 'Content-Type': 'application/json' };
  
  if (auth) {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const AuthAPI = {
  async registerUser(name, email, password, phone, city) {
    const response = await apiFetch('/auth/user/signup', {
      method: 'POST',
      body: { name, email, password, phone, city },
    });
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
        headers['Authorization'] = `Bearer ${access}`;
        
        // Retry original request
        response = await fetch(`${API_BASE}${path}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
      }
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const AuthAPI = {
  async register(name, email, password, role, city) {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: { name, email, password, role, city },
    });
  },
  
  async login(email, password) {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },
  
  async logout() {
    const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
    if (tokens.refresh) {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: { refresh: tokens.refresh },
      });
    }
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
  },
};

export const WorkerAPI = {
  async createProfile(profileData) {
    return apiFetch('/workers/profile', {
      method: 'POST',
      body: profileData,
      auth: true,
    });
  },
  
  async search(filters = {}) {
    const params = new URLSearchParams();
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.city) params.append('city', filters.city);
    if (filters.lat) params.append('lat', filters.lat);
    if (filters.lng) params.append('lng', filters.lng);
    if (filters.radiusKm) params.append('radiusKm', filters.radiusKm);
    
    return apiFetch(`/workers/search?${params.toString()}`);
  },
  
  async getById(id) {
    return apiFetch(`/workers/${id}`);
  },
};

export const JobAPI = {
  async create(jobData) {
    return apiFetch('/jobs', {
      method: 'POST',
      body: jobData,
      auth: true,
    });
  },
  
  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.city) params.append('city', filters.city);
    if (filters.status) params.append('status', filters.status);
    
    return apiFetch(`/jobs?${params.toString()}`, { auth: true });
  },
};