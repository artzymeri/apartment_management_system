import { authAPI } from './auth-api';
import { apiFetch } from './api-client';

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

export interface City {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export const cityApi = {
  // Get all cities
  getAllCities: async (): Promise<{ success: boolean; data: City[] }> => {
    const response = await apiFetch('/api/cities');
    await handleApiResponse(response);
    return response.json();
  },

  // Create a new city (admin only)
  createCity: async (name: string): Promise<{ success: boolean; message: string; data?: City }> => {
    const response = await apiFetch('/api/cities', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    await handleApiResponse(response);
    return response.json();
  },

  // Delete a city (admin only)
  deleteCity: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiFetch(`/api/cities/${id}`, {
      method: 'DELETE',
    });
    await handleApiResponse(response);
    return response.json();
  },

  // Update a city (admin only)
  updateCity: async (id: number, name: string): Promise<{ success: boolean; message: string; data?: City }> => {
    const response = await apiFetch(`/api/cities/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
    await handleApiResponse(response);
    return response.json();
  },
};
