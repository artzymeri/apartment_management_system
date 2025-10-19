import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI, UserFilters } from "@/lib/user-api";

// Query Keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  tenants: () => [...userKeys.all, "tenants"] as const,
  tenantsList: (filters: Omit<UserFilters, 'role'>) => [...userKeys.tenants(), filters] as const,
};

// Type for creating a user
export type CreateUserData = {
  name: string;
  surname: string;
  email: string;
  password: string;
  number?: string | null;
  role?: 'admin' | 'property_manager' | 'tenant';
  property_ids?: number[];
  floor_assigned?: number | null;
  expiry_date?: string | null;
  monthly_rate?: number | null;
};

// Type for updating a user
export type UpdateUserData = {
  name?: string;
  surname?: string;
  email?: string;
  password?: string;
  number?: string | null;
  role?: 'admin' | 'property_manager' | 'tenant';
  property_ids?: number[];
  floor_assigned?: number | null;
  expiry_date?: string | null;
  monthly_rate?: number | null;
};

// Get all users with filters (admin only)
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters || {}),
    queryFn: () => userAPI.getAllUsers(filters),
  });
}

// Get tenants for property manager (filtered by managed properties)
export function useTenants(filters?: Omit<UserFilters, 'role'>) {
  return useQuery({
    queryKey: userKeys.tenantsList(filters || {}),
    queryFn: () => userAPI.getTenantsForPropertyManager(filters),
  });
}

// Get single tenant by ID (for property managers)
export function useTenant(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userAPI.getTenantById(id),
    enabled: !!id,
  });
}

// Get single user by ID (admin only)
export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userAPI.getUserById(id),
    enabled: !!id,
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) => userAPI.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.tenants() });
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateUserData;
    }) => userAPI.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
  });
}

// Update tenant mutation (for property managers)
export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        name?: string;
        surname?: string;
        email?: string;
        password?: string;
        number?: string | null;
        property_ids?: number[];
        floor_assigned?: number | null;
        monthly_rate?: number | null;
      };
    }) => userAPI.updateTenant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.tenants() });
    },
  });
}

// Delete tenant mutation (for property managers)
export function useDeleteTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userAPI.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Update own profile mutation
export function useUpdateOwnProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name?: string;
      surname?: string;
      email?: string;
      password?: string;
      currentPassword?: string;
      number?: string | null;
    }) => userAPI.updateOwnProfile(data),
    onSuccess: () => {
      // Invalidate auth-related queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}
