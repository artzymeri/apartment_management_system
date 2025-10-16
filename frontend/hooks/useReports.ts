import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPropertyManagerReports, updateReportStatus, GetPropertyManagerReportsParams, UpdateReportStatusData } from '@/lib/report-api';
import { toast } from 'sonner';

// Hook to get property manager reports
export const usePropertyManagerReports = (params?: GetPropertyManagerReportsParams) => {
  return useQuery({
    queryKey: ['propertyManagerReports', params],
    queryFn: () => getPropertyManagerReports(params),
  });
};

// Hook to update report status
export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateReportStatusData }) =>
      updateReportStatus(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['propertyManagerReports'] });
      toast.success(response.message || 'Report status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update report status');
    },
  });
};

