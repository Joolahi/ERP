import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api/orders';
import type {
  OrderCreate,
  OrderUpdate,
  SearchParams,
  OrderStatus,
} from '../types';
import { toast } from 'sonner';

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params?: SearchParams & {
    status?: OrderStatus;
    department_id?: number;
    product_id?: number;
    priority?: string;
    overdue?: boolean;
  }) => [...orderKeys.lists(), params] as const,
  active: () => [...orderKeys.all, 'active'] as const,
  overdue: () => [...orderKeys.all, 'overdue'] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
  detailWithRelations: (id: number) => [...orderKeys.detail(id), 'with-details'] as const,
  stats: () => [...orderKeys.all, 'stats'] as const,
};

// ============================================================================
// Queries
// ============================================================================

// Get all orders with filters
export const useOrders = (
  params?: SearchParams & {
    status?: OrderStatus;
    department_id?: number;
    product_id?: number;
    priority?: string;
    overdue?: boolean;
  }
) => {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderApi.getAll(params),
  });
};

// Get active orders
export const useActiveOrders = (limit: number = 100) => {
  return useQuery({
    queryKey: [...orderKeys.active(), limit],
    queryFn: () => orderApi.getActive(limit),
  });
};

// Get overdue orders
export const useOverdueOrders = () => {
  return useQuery({
    queryKey: orderKeys.overdue(),
    queryFn: () => orderApi.getOverdue(),
  });
};

// Get single order
export const useOrder = (id: number) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
  });
};

// Get order with full details
export const useOrderWithDetails = (id: number) => {
  return useQuery({
    queryKey: orderKeys.detailWithRelations(id),
    queryFn: () => orderApi.getByIdWithDetails(id),
    enabled: !!id,
  });
};

// Get order statistics
export const useOrderStats = () => {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: () => orderApi.getStats(),
  });
};

// ============================================================================
// Mutations
// ============================================================================

// Create new order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrderCreate) => orderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.active() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
      toast.success('Tilaus luotu onnistuneesti!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Tilauksen luominen epäonnistui'
      );
    },
  });
};

// Update order
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: OrderUpdate }) =>
      orderApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.active() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
      toast.success('Tilaus päivitetty onnistuneesti!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Tilauksen päivittäminen epäonnistui'
      );
    },
  });
};

// Delete order
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => orderApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.active() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
      toast.success('Tilaus poistettu onnistuneesti!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Tilauksen poistaminen epäonnistui'
      );
    },
  });
};

// Start order
export const useStartOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => orderApi.start(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.active() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
      toast.success('Tilaus aloitettu!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Tilauksen aloittaminen epäonnistui'
      );
    },
  });
};

// Complete order
export const useCompleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => orderApi.complete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.active() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
      toast.success('Tilaus valmistunut!', {
        description: data.efficiency_percentage 
          ? `Tehokkuus: ${data.efficiency_percentage.toFixed(1)}%`
          : undefined,
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Tilauksen valmistuminen epäonnistui'
      );
    },
  });
};

// Cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      orderApi.cancel(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.active() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
      toast.success('Tilaus peruttu');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Tilauksen peruminen epäonnistui'
      );
    },
  });
};

// Reopen order
export const useReopenOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => orderApi.reopen(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.active() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
      toast.success('Tilaus avattu uudelleen');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Tilauksen avaaminen epäonnistui'
      );
    },
  });
};

// Bulk update status
export const useBulkUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderIds, status }: { orderIds: number[]; status: OrderStatus }) =>
      orderApi.bulkUpdateStatus(orderIds, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.active() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
      toast.success(`${variables.orderIds.length} tilausta päivitetty`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Joukkomuokkaus epäonnistui'
      );
    },
  });
};

// Bulk delete
export const useBulkDeleteOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderIds: number[]) => orderApi.bulkDelete(orderIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.active() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
      toast.success(`${variables.length} tilausta poistettu`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Joukkopoisto epäonnistui'
      );
    },
  });
};