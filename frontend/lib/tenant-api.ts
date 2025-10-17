const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Complaint {
  id: number;
  tenant_user_id: number;
  property_id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  response: string | null;
  created_at: string;
  updated_at: string;
  property?: {
    id: number;
    name: string;
    address: string;
  };
}

export interface Suggestion {
  id: number;
  tenant_user_id: number;
  property_id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  response: string | null;
  created_at: string;
  updated_at: string;
  property?: {
    id: number;
    name: string;
    address: string;
  };
}

// Get tenant's complaints
export async function getTenantComplaints(): Promise<Complaint[]> {
  const response = await fetch(`${API_BASE_URL}/api/complaints/tenant`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch complaints');
  }

  const data = await response.json();
  return data.complaints;
}

// Get tenant's suggestions
export async function getTenantSuggestions(): Promise<Suggestion[]> {
  const response = await fetch(`${API_BASE_URL}/api/suggestions/tenant`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch suggestions');
  }

  const data = await response.json();
  return data.suggestions;
}

