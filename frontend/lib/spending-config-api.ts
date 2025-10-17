const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface SpendingConfig {
  id: number;
  title: string;
  description: string | null;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
  properties?: Array<{
    id: number;
    name: string;
    address: string;
  }>;
}

export const spendingConfigAPI = {
  // Get all spending configs created by the current user
  async getMySpendingConfigs(): Promise<SpendingConfig[]> {
    const response = await fetch(`${API_BASE_URL}/api/spending-configs`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch spending configs');
    }

    return response.json();
  },

  // Create a new spending config
  async createSpendingConfig(data: { title: string; description?: string }): Promise<SpendingConfig> {
    const response = await fetch(`${API_BASE_URL}/api/spending-configs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create spending config');
    }

    return response.json();
  },

  // Update a spending config
  async updateSpendingConfig(
    id: number,
    data: { title: string; description?: string }
  ): Promise<SpendingConfig> {
    const response = await fetch(`${API_BASE_URL}/api/spending-configs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update spending config');
    }

    return response.json();
  },

  // Delete a spending config
  async deleteSpendingConfig(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/spending-configs/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete spending config');
    }
  },

  // Get spending configs for a specific property
  async getPropertySpendingConfigs(propertyId: number): Promise<SpendingConfig[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/spending-configs/property/${propertyId}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch property spending configs');
    }

    return response.json();
  },

  // Assign spending configs to a property
  async assignSpendingConfigsToProperty(
    propertyId: number,
    data: { spendingConfigIds: number[] }
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/spending-configs/property/${propertyId}/assign`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to assign spending configs');
    }
  },
};

