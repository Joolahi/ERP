import apiClient from './client';
import type {
  Department,
  DepartmentCreate,
  DepartmentUpdate,
  DepartmentListResponse,
  DepartmentWithStats,
  SearchParams,
} from '../types';

const DEPARTMENTS_ENDPOINT = '/departments';

export const departmentApi = {
  // Get every department with optional filters
  getAll: async (params?: SearchParams & { is_active?: boolean }) => {
    const response = await apiClient.get<DepartmentListResponse>(
      DEPARTMENTS_ENDPOINT,
      { params }
    );
    return response.data;
  },

  // Get all active departments
  getActive: async () => {
    const response = await apiClient.get<Department[]>(
      `${DEPARTMENTS_ENDPOINT}/active`
    );
    return response.data;
  },

  // get department by ID
  getById: async (id: number) => {
    const response = await apiClient.get<Department>(
      `${DEPARTMENTS_ENDPOINT}/${id}`
    );
    return response.data;
  },

  // get department by ID with stats
  getByIdWithStats: async (id: number) => {
    const response = await apiClient.get<DepartmentWithStats>(
      `${DEPARTMENTS_ENDPOINT}/${id}/with-stats`
    );
    return response.data;
  },

  // get department by code
  getByCode: async (code: string) => {
    const response = await apiClient.get<Department>(
      `${DEPARTMENTS_ENDPOINT}/by-code/${code}`
    );
    return response.data;
  },

  // get departments statistics
  getStats: async () => {
    const response = await apiClient.get<{
      total: number;
      active: number;
      inactive: number;
    }>(`${DEPARTMENTS_ENDPOINT}/stats`);
    return response.data;
  },

  // create a new department
  create: async (data: DepartmentCreate) => {
    const response = await apiClient.post<Department>(
      DEPARTMENTS_ENDPOINT,
      data
    );
    return response.data;
  },

  // update an existing department
  update: async (id: number, data: DepartmentUpdate) => {
    const response = await apiClient.put<Department>(
      `${DEPARTMENTS_ENDPOINT}/${id}`,
      data
    );
    return response.data;
  },

  // delete a department
  delete: async (id: number) => {
    await apiClient.delete(`${DEPARTMENTS_ENDPOINT}/${id}`);
  },

  // deactivate a department
  deactivate: async (id: number) => {
    const response = await apiClient.post<Department>(
      `${DEPARTMENTS_ENDPOINT}/${id}/deactivate`
    );
    return response.data;
  },

  // activate a department
  activate: async (id: number) => {
    const response = await apiClient.post<Department>(
      `${DEPARTMENTS_ENDPOINT}/${id}/activate`
    );
    return response.data;
  },

  // sort departments based on provided order mapping
  reorder: async (orderMapping: Record<number, number>) => {
    const response = await apiClient.post<Department[]>(
      `${DEPARTMENTS_ENDPOINT}/reorder`,
      orderMapping
    );
    return response.data;
  },
};