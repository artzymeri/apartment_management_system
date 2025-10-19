import { useQuery } from "@tanstack/react-query";
import { getSidebarCounts } from "@/lib/property-manager-dashboard-api";
import { useAuth } from "@/contexts/AuthContext";

export interface SidebarCounts {
  pendingReports: number;
  pendingComplaints: number;
  pendingSuggestions: number;
}

// Query Keys
export const sidebarCountsKeys = {
  all: ["pmSidebarCounts"] as const,
};

// Get sidebar badge counts
export function usePropertyManagerSidebarCounts() {
  const { user } = useAuth();

  return useQuery<SidebarCounts>({
    queryKey: sidebarCountsKeys.all,
    queryFn: getSidebarCounts,
    enabled: !!user && user.role === 'property_manager', // Only fetch if user is logged in as property manager
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    retry: 2,
  });
}
