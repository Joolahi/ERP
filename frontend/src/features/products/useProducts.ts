import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../../api';
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  SearchParams,
} from '../../types';
import { toast } from 'sonner';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: SearchParams & { category_code?: string; is_active?: boolean }) =>
    [...productKeys.lists(), params] as const,
  active: () => [...productKeys.all, 'active'] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  stats: () => [...productKeys.all, 'stats'] as const,
  search: (query: string) => [...productKeys.all, 'search', query] as const,
};

// ============================================================================
// Queries
// ============================================================================

// Hae kaikki tuotteet
export const useProducts = (
  params?: SearchParams & { category_code?: string; is_active?: boolean }
) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productApi.getAll(params),
  });
};

// Hae aktiiviset tuotteet
export const useActiveProducts = (limit: number = 100) => {
  return useQuery({
    queryKey: [...productKeys.active(), limit],
    queryFn: () => productApi.getActive(limit),
  });
};

// Hae yksittäinen tuote
export const useProduct = (id: number) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
};

// Hae tuotetilastot
export const useProductStats = () => {
  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: () => productApi.getStats(),
  });
};

// Pikahaku (autocomplete)
export const useProductSearch = (query: string, limit: number = 10) => {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => productApi.search(query, limit),
    enabled: query.length > 0,
  });
};

// ============================================================================
// Mutations
// ============================================================================

// Luo uusi tuote
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductCreate) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.active() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
      toast.success('Tuote luotu onnistuneesti!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Tuotteen luominen epäonnistui'
      );
    },
  });
};

// Päivitä tuote
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductUpdate }) =>
      productApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.active() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
      toast.success('Tuote päivitetty onnistuneesti!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Tuotteen päivittäminen epäonnistui'
      );
    },
  });
};

// Poista tuote
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.active() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
      toast.success('Tuote poistettu onnistuneesti!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Tuotteen poistaminen epäonnistui'
      );
    },
  });
};

// Deaktivoi tuote
export const useDeactivateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.active() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
      toast.success('Tuote deaktivoitu onnistuneesti!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Tuotteen deaktivointi epäonnistui'
      );
    },
  });
};

// Aktivoi tuote
export const useActivateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.active() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
      toast.success('Tuote aktivoitu onnistuneesti!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Tuotteen aktivointi epäonnistui'
      );
    },
  });
};