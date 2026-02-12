import apiClient from './client';
import type {
  Order,
  OrderCreate,
  OrderUpdate,
  OrderListResponse,
  OrderStats,
  OrderWithDetails,
  OrderStatus,
  SearchParams,
} from '../types';

const ORDERS_ENDPOINT = '/orders';

export const orderApi = {
  // Get all orders with optional filters
  getAll: async (
    params?: SearchParams & {
      status?: OrderStatus;
      department_id?: number;
      product_id?: number;
      priority?: string;
      overdue?: boolean;
    }
  ) => {
    const response = await apiClient.get<OrderListResponse>(
      ORDERS_ENDPOINT,
      { params }
    );
    return response.data;
  },

  // Get order by ID
  getById: async (id: number) => {
    const response = await apiClient.get<Order>(
      `${ORDERS_ENDPOINT}/${id}`
    );
    return response.data;
  },

  // Get order by ID with full details (product & department)
  getByIdWithDetails: async (id: number) => {
    const response = await apiClient.get<OrderWithDetails>(
      `${ORDERS_ENDPOINT}/${id}/with-details`
    );
    return response.data;
  },

  // Get order by order number
  getByNumber: async (orderNumber: string) => {
    const response = await apiClient.get<Order>(
      `${ORDERS_ENDPOINT}/by-number/${orderNumber}`
    );
    return response.data;
  },

  // Get orders statistics
  getStats: async () => {
    const response = await apiClient.get<OrderStats>(
      `${ORDERS_ENDPOINT}/stats`
    );
    return response.data;
  },

  // Get active orders (pending + in_progress)
  getActive: async (limit: number = 100) => {
    const response = await apiClient.get<Order[]>(
      `${ORDERS_ENDPOINT}/active`,
      { params: { limit } }
    );
    return response.data;
  },

  // Get overdue orders
  getOverdue: async () => {
    const response = await apiClient.get<Order[]>(
      `${ORDERS_ENDPOINT}/overdue`
    );
    return response.data;
  },

  // Create a new order
  create: async (data: OrderCreate) => {
    const response = await apiClient.post<Order>(ORDERS_ENDPOINT, data);
    return response.data;
  },

  // Update an existing order
  update: async (id: number, data: OrderUpdate) => {
    const response = await apiClient.put<Order>(
      `${ORDERS_ENDPOINT}/${id}`,
      data
    );
    return response.data;
  },

  // Delete an order
  delete: async (id: number) => {
    await apiClient.delete(`${ORDERS_ENDPOINT}/${id}`);
  },

  // Start an order (change status to in_progress)
  start: async (id: number) => {
    const response = await apiClient.post<Order>(
      `${ORDERS_ENDPOINT}/${id}/start`
    );
    return response.data;
  },

  // Complete an order
  complete: async (id: number) => {
    const response = await apiClient.post<Order>(
      `${ORDERS_ENDPOINT}/${id}/complete`
    );
    return response.data;
  },

  // Cancel an order
  cancel: async (id: number, reason?: string) => {
    const response = await apiClient.post<Order>(
      `${ORDERS_ENDPOINT}/${id}/cancel`,
      { reason }
    );
    return response.data;
  },

  // Reopen a cancelled order
  reopen: async (id: number) => {
    const response = await apiClient.post<Order>(
      `${ORDERS_ENDPOINT}/${id}/reopen`
    );
    return response.data;
  },

  // Bulk operations
  bulkUpdateStatus: async (orderIds: number[], status: OrderStatus) => {
    const response = await apiClient.post<Order[]>(
      `${ORDERS_ENDPOINT}/bulk/update-status`,
      { order_ids: orderIds, status }
    );
    return response.data;
  },

  bulkDelete: async (orderIds: number[]) => {
    await apiClient.post(
      `${ORDERS_ENDPOINT}/bulk/delete`,
      { order_ids: orderIds }
    );
  },
};