import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMonthlyReportPreview,
  generateMonthlyReport,
  getAllMyReports,
  getPropertyReports,
  getMonthlyReportDetail,
  deleteMonthlyReport,
  updateMonthlyReport,
  GenerateMonthlyReportData,
  getTenantPropertyReports,
} from '@/lib/monthly-report-api';
import { toast } from 'sonner';

// Get report preview
export function useMonthlyReportPreview(params: {
  propertyId: number;
  month: number;
  year: number;
}) {
  return useQuery({
    queryKey: ['monthly-report-preview', params.propertyId, params.month, params.year],
    queryFn: () => getMonthlyReportPreview(params),
    enabled: !!params.propertyId && !!params.month && !!params.year,
  });
}

// Generate monthly report
export function useGenerateMonthlyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateMonthlyReportData) => generateMonthlyReport(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['monthly-reports'] });
      queryClient.invalidateQueries({ queryKey: ['property-reports'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-report-preview'] });
      toast.success(data.message || 'Report generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate report');
    },
  });
}

// Get all my reports
export function useAllMyReports(params?: { year?: number }) {
  return useQuery({
    queryKey: ['monthly-reports', 'all', params],
    queryFn: () => getAllMyReports(params),
  });
}

// Get reports for a specific property
export function usePropertyReports(propertyId: number, params?: { year?: number }) {
  return useQuery({
    queryKey: ['property-reports', propertyId, params],
    queryFn: () => getPropertyReports(propertyId, params),
    enabled: !!propertyId,
  });
}

// Get monthly report detail
export function useMonthlyReportDetail(reportId: number) {
  return useQuery({
    queryKey: ['monthly-report', reportId],
    queryFn: () => getMonthlyReportDetail(reportId),
    enabled: !!reportId,
  });
}

// Update monthly report
export function useUpdateMonthlyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: number; data: { notes?: string; spendingAllocations?: any[] } }) =>
      updateMonthlyReport(reportId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['monthly-reports'] });
      queryClient.invalidateQueries({ queryKey: ['property-reports'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-report'] });
      toast.success(data.message || 'Report updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update report');
    },
  });
}

// Delete monthly report
export function useDeleteMonthlyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: number) => deleteMonthlyReport(reportId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['monthly-reports'] });
      queryClient.invalidateQueries({ queryKey: ['property-reports'] });
      toast.success(data.message || 'Report deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete report');
    },
  });
}

// Get tenant property monthly reports
export function useTenantPropertyReports(params?: { year?: number }) {
  return useQuery({
    queryKey: ['tenant-monthly-reports', params],
    queryFn: () => getTenantPropertyReports(params),
  });
}
