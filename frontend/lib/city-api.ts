const API_URL = 'http://localhost:5000/api';

export interface City {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export const cityApi = {
  // Get all cities
  getAllCities: async (): Promise<{ success: boolean; data: City[] }> => {
    const response = await fetch(`${API_URL}/cities`, {
      credentials: 'include',
    });
    return response.json();
  },

  // Create a new city (admin only)
  createCity: async (name: string): Promise<{ success: boolean; message: string; data?: City }> => {
    const response = await fetch(`${API_URL}/cities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name }),
    });
    return response.json();
  },

  // Delete a city (admin only)
  deleteCity: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/cities/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return response.json();
  },

  // Update a city (admin only)
  updateCity: async (id: number, name: string): Promise<{ success: boolean; message: string; data?: City }> => {
    const response = await fetch(`${API_URL}/cities/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name }),
    });
    return response.json();
  },
};
