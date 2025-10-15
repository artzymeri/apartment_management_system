import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRegisterRequests,
  getRegisterRequestById,
  approveRegisterRequest,
  rejectRegisterRequest,
  deleteRegisterRequest,
  RegisterRequestFilters,
} from "@/lib/registerRequest-api";

// Query Keys
export const registerRequestKeys = {
  all: ["registerRequests"] as const,
  lists: () => [...registerRequestKeys.all, "list"] as const,
  list: (filters: RegisterRequestFilters) => [...registerRequestKeys.lists(), filters] as const,
};

// Get all register requests with filters
export function useRegisterRequests(filters?: RegisterRequestFilters) {
  return useQuery({
    queryKey: registerRequestKeys.list(filters || {}),
    queryFn: () => getRegisterRequests(filters),
  });
}

// Get a single register request by ID
export function useRegisterRequest(id: number) {
  return useQuery({
    queryKey: ["registerRequest", id],
    queryFn: () => getRegisterRequestById(id),
    enabled: !!id,
  });
}

// Approve register request mutation
export function useApproveRegisterRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { role?: string; property_ids?: number[] } }) =>
      approveRegisterRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registerRequests"] });
    },
  });
}

// Reject register request mutation
export function useRejectRegisterRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rejectRegisterRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registerRequests"] });
    },
  });
}

// Delete register request mutation
export function useDeleteRegisterRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRegisterRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registerRequests"] });
    },
  });
}
