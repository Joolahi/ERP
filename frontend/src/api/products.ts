import apiClient from './client';
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductListResponse,
  SearchParams,
} from '../types';

const PRODUCTS_ENDPOINT = '/products';

export const productApi = {
  // get all products with optional filters
  getAll: async (
    params?: SearchParams & {
      category_code?: string;
      is_active?: boolean;
    }
  ) => {
    const response = await apiClient.get<ProductListResponse>(
      PRODUCTS_ENDPOINT,
      { params }
    );
    return response.data;
  },

  // get all active products with optional limit
  getActive: async (limit: number = 100) => {
    const response = await apiClient.get<Product[]>(
      `${PRODUCTS_ENDPOINT}/active`,
      { params: { limit } }
    );
    return response.data;
  },

  // query products by search term
  search: async (query: string, limit: number = 10) => {
    const response = await apiClient.get<Product[]>(
      `${PRODUCTS_ENDPOINT}/search`,
      { params: { q: query, limit } }
    );
    return response.data;
  },

  // get products statistics
  getStats: async () => {
    const response = await apiClient.get<{
      total: number;
      active: number;
      inactive: number;
    }>(`${PRODUCTS_ENDPOINT}/stats`);
    return response.data;
  },

  // get product by ID
  getById: async (id: number) => {
    const response = await apiClient.get<Product>(
      `${PRODUCTS_ENDPOINT}/${id}`
    );
    return response.data;
  },

  // get product by item number
  getByNumber: async (itemNumber: string) => {
    const response = await apiClient.get<Product>(
      `${PRODUCTS_ENDPOINT}/by-number/${itemNumber}`
    );
    return response.data;
  },

  // create a new product
  create: async (data: ProductCreate) => {
    const response = await apiClient.post<Product>(PRODUCTS_ENDPOINT, data);
    return response.data;
  },

  // update an existing product
  update: async (id: number, data: ProductUpdate) => {
    const response = await apiClient.put<Product>(
      `${PRODUCTS_ENDPOINT}/${id}`,
      data
    );
    return response.data;
  },

  // delete a product
  delete: async (id: number) => {
    await apiClient.delete(`${PRODUCTS_ENDPOINT}/${id}`);
  },

  // deactivate a product
  deactivate: async (id: number) => {
    const response = await apiClient.post<Product>(
      `${PRODUCTS_ENDPOINT}/${id}/deactivate`
    );
    return response.data;
  },

  // activate a product
  activate: async (id: number) => {
    const response = await apiClient.post<Product>(
      `${PRODUCTS_ENDPOINT}/${id}/activate`
    );
    return response.data;
  },
};