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

export interface ProblemOption {
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

export interface CreateProblemOptionDto {
  title: string;
  description?: string;
}

export interface UpdateProblemOptionDto {
  title: string;
  description?: string;
}

export interface AssignProblemOptionsDto {
  problemOptionIds: number[];
}

export const problemOptionAPI = {
  // Get all problem options created by the property manager
  async getMyProblemOptions(): Promise<ProblemOption[]> {
    const response = await fetch(`${API_BASE_URL}/api/problem-options`, {
      credentials: 'include',
    });

    await handleApiResponse(response);

    if (!response.ok) {
      throw new Error('Failed to fetch problem options');
    }

    return response.json();
  },

  // Create a new problem option
  async createProblemOption(data: CreateProblemOptionDto): Promise<ProblemOption> {
    const response = await fetch(`${API_BASE_URL}/api/problem-options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    await handleApiResponse(response);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create problem option');
    }

    return response.json();
  },

  // Update a problem option
  async updateProblemOption(id: number, data: UpdateProblemOptionDto): Promise<ProblemOption> {
    const response = await fetch(`${API_BASE_URL}/api/problem-options/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    await handleApiResponse(response);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update problem option');
    }

    return response.json();
  },

  // Delete a problem option
  async deleteProblemOption(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/problem-options/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    await handleApiResponse(response);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete problem option');
    }
  },

  // Get problem options for a specific property
  async getPropertyProblemOptions(propertyId: number): Promise<ProblemOption[]> {
    const response = await fetch(`${API_BASE_URL}/api/problem-options/property/${propertyId}`, {
      credentials: 'include',
    });

    await handleApiResponse(response);

    if (!response.ok) {
      throw new Error('Failed to fetch property problem options');
    }

    return response.json();
  },

  // Assign problem options to a property
  async assignProblemOptionsToProperty(
    propertyId: number,
    data: AssignProblemOptionsDto
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/problem-options/property/${propertyId}/assign`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      }
    );

    await handleApiResponse(response);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to assign problem options');
    }
  },
};

