import { authAPI } from './auth-api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Global handler for API responses
async function handleApiResponse(response: Response) {
  // If unauthorized, clear auth and redirect to login
  if (response.status === 401) {
    authAPI.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please login again.');
  }

  return response;
}

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  number: string | null;
  role: 'admin' | 'property_manager' | 'tenant';
  property_ids: number[];
  floor_assigned?: number | null;
  expiry_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

class UserAPI {
  private getAuthHeaders() {
    const token = authAPI.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAllUsers(filters?: UserFilters) {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.role) queryParams.append('role', filters.role);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/api/users?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      }
    );
    await handleApiResponse(response);
    return response.json();
  }

  async getUserById(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    await handleApiResponse(response);
    return response.json();
  }

  async updateUser(id: number, data: {
    name?: string;
    surname?: string;
    email?: string;
    password?: string;
    number?: string | null;
    role?: 'admin' | 'property_manager' | 'tenant';
    property_ids?: number[];
    floor_assigned?: number | null;
    expiry_date?: string | null;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    await handleApiResponse(response);
    return response.json();
  }

  async deleteUser(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    await handleApiResponse(response);
    return response.json();
  }

  async updateOwnProfile(data: {
    name?: string;
    surname?: string;
    email?: string;
    password?: string;
    currentPassword?: string;
    number?: string | null;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/users/profile/me`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    await handleApiResponse(response);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    return response.json();
  }

  async createUser(data: {
    name: string;
    surname: string;
    email: string;
    password: string;
    number?: string | null;
    role?: 'admin' | 'property_manager' | 'tenant';
    property_ids?: number[];
    floor_assigned?: number | null;
    expiry_date?: string | null;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    await handleApiResponse(response);
    return response.json();
  }

  async getTenantsForPropertyManager(filters?: Omit<UserFilters, 'role'>) {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/api/users/tenants?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      }
    );
    await handleApiResponse(response);
    return response.json();
  }

  async getTenantById(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/users/tenants/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    await handleApiResponse(response);
    return response.json();
  }

  async updateTenant(id: number, data: {
    name?: string;
    surname?: string;
    email?: string;
    password?: string;
    number?: string | null;
    property_ids?: number[];
    floor_assigned?: number | null;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/users/tenants/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    await handleApiResponse(response);
    return response.json();
  }
}

export const userAPI = new UserAPI();
