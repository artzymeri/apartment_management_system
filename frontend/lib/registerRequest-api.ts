import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

export interface RegisterRequest {
  id: number;
  name: string;
  surname: string;
  email: string;
  number?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface RegisterRequestsResponse {
  success: boolean;
  data: RegisterRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RegisterRequestFilters {
  search?: string;
  status?: 'pending' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
}

export const getRegisterRequests = async (filters?: RegisterRequestFilters): Promise<RegisterRequestsResponse> => {
  const response = await api.get('/register-requests', { params: filters });
  return response.data;
};

export const getRegisterRequestById = async (id: number): Promise<{ success: boolean; data: RegisterRequest }> => {
  const response = await api.get(`/register-requests/${id}`);
  return response.data;
};

export const approveRegisterRequest = async (id: number, data: { role?: string; property_ids?: number[] }): Promise<{ success: boolean; message: string; data: any }> => {
  const response = await api.post(`/register-requests/${id}/approve`, data);
  return response.data;
};

export const rejectRegisterRequest = async (id: number): Promise<{ success: boolean; message: string; data: RegisterRequest }> => {
  const response = await api.post(`/register-requests/${id}/reject`);
  return response.data;
};

export const deleteRegisterRequest = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/register-requests/${id}`);
  return response.data;
};
