import { authAPI } from './auth-api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  number: string | null;
  role: 'admin' | 'privileged' | 'tenant';
  property_ids: number[];
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
    return response.json();
  }

  async getUserById(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    return response.json();
  }

  async updateUser(id: number, data: {
    name?: string;
    surname?: string;
    email?: string;
    password?: string;
    number?: string | null;
    role?: 'admin' | 'privileged' | 'tenant';
    property_ids?: number[];
  }) {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteUser(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    return response.json();
  }
}

export const userAPI = new UserAPI();
