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

export interface Report {
  id: number;
  tenant_user_id: number;
  property_id: number;
  problem_option_id: number;
  floor: number | null;
  description: string | null;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  created_at: string;
  updated_at: string;
  property?: {
    id: number;
    name: string;
    address: string;
    city_id: number;
  };
  problemOption?: {
    id: number;
    name: string;
    description: string | null;
  };
  tenant?: {
    id: number;
    name: string;
    surname: string;
    email: string;
    number: string | null;
  };
}

export interface GetPropertyManagerReportsParams {
  property_id?: number;
  status?: 'pending' | 'in_progress' | 'resolved' | 'rejected';
}

export interface UpdateReportStatusData {
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
}

// Get all reports for property manager
export const getPropertyManagerReports = async (params?: GetPropertyManagerReportsParams): Promise<{ reports: Report[] }> => {
  const queryParams = new URLSearchParams();

  if (params?.property_id) {
    queryParams.append('property_id', params.property_id.toString());
  }

  if (params?.status) {
    queryParams.append('status', params.status);
  }

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/api/reports/manager${queryString ? `?${queryString}` : ''}`;

  const token = authAPI.getToken();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });

  await handleApiResponse(response);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch reports');
  }

  return response.json();
};

// Update report status
export const updateReportStatus = async (id: number, data: UpdateReportStatusData): Promise<{ message: string; report: Report }> => {
  const token = authAPI.getToken();
  const response = await fetch(`${API_BASE_URL}/api/reports/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  await handleApiResponse(response);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update report status');
  }

  return response.json();
};
