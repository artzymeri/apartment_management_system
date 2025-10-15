import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cityApi } from '@/lib/city-api';

export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: cityApi.getAllCities,
  });
};

export const useCreateCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => cityApi.createCity(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
};

export const useDeleteCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cityApi.deleteCity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
};

export const useUpdateCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => cityApi.updateCity(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
};
