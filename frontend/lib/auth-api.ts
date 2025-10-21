import { apiFetch } from './api-client';

class AuthAPI {
  // Register new user
  async register(data: {
    name: string;
    surname: string;
    email: string;
    password: string;
    number?: string;
  }) {
    const response = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // Login user
  async login(identifier: string, password: string, method: 'email' | 'phone' = 'email') {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier,
        password,
        loginMethod: method
      }),
    });
    return response.json();
  }

  // Logout user
  async logout() {
    const response = await apiFetch('/api/auth/logout', {
      method: 'POST',
    });
    this.removeToken();
    return response.json();
  }

  // Get current user
  async getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    const response = await apiFetch('/api/auth/me', {
      method: 'GET',
    });

    if (!response.ok) {
      this.removeToken();
      return null;
    }

    return response.json();
  }

  // Verify token
  async verifyToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await apiFetch('/api/auth/me', {
        method: 'GET',
      });

      if (!response.ok) {
        this.removeToken();
        return false;
      }

      return true;
    } catch (error) {
      this.removeToken();
      return false;
    }
  }

  // Store token
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  // Get token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  // Remove token
  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authAPI = new AuthAPI();
