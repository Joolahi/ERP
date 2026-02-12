import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi } from '../../api';
import type {
  Department,
  DepartmentCreate,
  DepartmentUpdate,
  SearchParams,
} from '../../types';
import { toast } from 'sonner';

// Query keys
export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (params?: SearchParams & { is_active?: boolean }) =>
    [...departmentKeys.lists(), params] as const,
  active: () => [...departmentKeys.all, 'active'] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...departmentKeys.details(), id] as const,
  stats: () => [...departmentKeys.all, 'stats'] as const,
};

// ============================================================================
// Queries
// ============================================================================

// Get departments with optional filters
export const useDepartments = (
  params?: SearchParams & { is_active?: boolean }
) => {
  return useQuery({
    queryKey: departmentKeys.list(params),
    queryFn: () => departmentApi.getAll(params),
  });
};

// Get all active departments
export const useActiveDepartments = () => {
  return useQuery({
    queryKey: departmentKeys.active(),
    queryFn: () => departmentApi.getActive(),
  });
};

// Get department by ID
export const useDepartment = (id: number) => {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => departmentApi.getById(id),
    enabled: !!id,
  });
};

// Get department by ID with stats
export const useDepartmentWithStats = (id: number) => {
  return useQuery({
    queryKey: [...departmentKeys.detail(id), 'with-stats'],
    queryFn: () => departmentApi.getByIdWithStats(id),
    enabled: !!id,
  });
};

// Get departments statistics
export const useDepartmentStats = () => {
  return useQuery({
    queryKey: departmentKeys.stats(),
    queryFn: () => departmentApi.getStats(),
  });
};

// ============================================================================
// Mutations
// ============================================================================

// Create a new department
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DepartmentCreate) => departmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.active() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.stats() });
      toast.success('Osasto luotu onnistuneesti!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Osaston luominen epäonnistui'
      );
    },
  });
};

// Update an existing department
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DepartmentUpdate }) =>
      departmentApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.active() });
      queryClient.invalidateQueries({
        queryKey: departmentKeys.detail(variables.id),
      });
      toast.success('Osasto päivitetty onnistuneesti!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Osaston päivittäminen epäonnistui'
      );
    },
  });
};

// Delete a department
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => departmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.active() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.stats() });
      toast.success('Osasto poistettu onnistuneesti!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Osaston poistaminen epäonnistui'
      );
    },
  });
};

// Deactivate a department
export const useDeactivateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => departmentApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.active() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.stats() });
      toast.success('Osasto deaktivoitu onnistuneesti!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Osaston deaktivointi epäonnistui'
      );
    },
  });
};

//  Activate a department
export const useActivateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => departmentApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.active() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.stats() });
      toast.success('Osasto aktivoitu onnistuneesti!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Osaston aktivointi epäonnistui'
      );
    },
  });
};