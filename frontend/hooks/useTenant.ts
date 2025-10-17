import { useQuery } from '@tanstack/react-query';
import { getTenantComplaints, getTenantSuggestions, getTenantDashboardData } from '@/lib/tenant-api';
import { getTenantPayments } from '@/lib/tenant-payment-api';

// Hook to get all tenant dashboard data in one call
export function useTenantDashboard(params?: { year?: number; month?: number }) {
  return useQuery({
    queryKey: ['tenant-dashboard', params],
    queryFn: () => getTenantDashboardData(params),
  });
}

// Hook to get tenant complaints
export function useTenantComplaints() {
  return useQuery({
    queryKey: ['tenant-complaints'],
    queryFn: () => getTenantComplaints(),
  });
}

// Hook to get tenant suggestions
export function useTenantSuggestions() {
  return useQuery({
    queryKey: ['tenant-suggestions'],
    queryFn: () => getTenantSuggestions(),
  });
}

// Hook to get tenant payments
export function useTenantPayments(tenantId: number, filters?: {
  property_id?: number;
  status?: string;
  year?: number;
  month?: number;
}) {
  return useQuery({
    queryKey: ['tenant-payments', tenantId, filters],
    queryFn: () => getTenantPayments(tenantId, filters),
    enabled: !!tenantId,
  });
}

// Hook to get tenant reports (problems)
export function useTenantReports() {
  return useQuery({
    queryKey: ['tenant-reports'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reports/my-reports`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch reports');
      }

      const data = await response.json();
      return data.reports;
    },
  });
}
