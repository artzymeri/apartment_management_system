import { authAPI } from './auth-api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Property {
  id: number;
  name: string;
  address: string;
  city_id: number;
  cityDetails?: {
    id: number;
    name: string;
  };
  latitude: number | null;
  longitude: number | null;
  privileged_user_id: number | null;
  manager?: {
    id: number;
    name: string;
    surname: string;
    email: string;
  };
  managers?: Array<{
    id: number;
    name: string;
    surname: string;
    email: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface PropertyFilters {
  search?: string;
  city?: string;
  managerId?: number;
  myProperties?: boolean;
  page?: number;
  limit?: number;
}

class PropertyAPI {
  private getAuthHeaders() {
    const token = authAPI.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAllProperties(filters?: PropertyFilters) {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.city) queryParams.append('city', filters.city);
    if (filters?.managerId) queryParams.append('managerId', filters.managerId.toString());
    if (filters?.myProperties) queryParams.append('myProperties', 'true');
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/api/properties?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      }
    );
    return response.json();
  }

  async getPropertyById(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    return response.json();
  }

  async createProperty(data: {
    name: string;
    address: string;
    city_id: number;
    latitude?: number | null;
    longitude?: number | null;
    manager_ids?: number[];
  }) {
    const response = await fetch(`${API_BASE_URL}/api/properties`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateProperty(id: number, data: {
    name?: string;
    address?: string;
    city_id?: number;
    latitude?: number | null;
    longitude?: number | null;
    manager_ids?: number[];
  }) {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteProperty(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    return response.json();
  }

  async getManagers() {
    const response = await fetch(`${API_BASE_URL}/api/properties/managers/list`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    return response.json();
  }
}

export const propertyAPI = new PropertyAPI();
