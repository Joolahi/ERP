// ============================================================================
// Department Types
// ============================================================================

export interface Department {
  id: number;
  code: string;
  name: string;
  display_order: number | null;
  color: string | null;
  is_active: boolean;
}

export interface DepartmentCreate {
  code: string;
  name: string;
  display_order?: number | null;
  color?: string | null;
  is_active?: boolean;
}

export interface DepartmentUpdate {
  code?: string;
  name?: string;
  display_order?: number | null;
  color?: string | null;
  is_active?: boolean;
}

export interface DepartmentWithStats extends Department {
  work_phase_count: number;
  active_orders_count: number;
}

export interface DepartmentListResponse {
  items: Department[];
  total: number;
  page: number;
  page_size: number;
}

// ============================================================================
// Product Types
// ============================================================================

export interface ProductCategory {
  id: number;
  code: string;
  name: string | null;
  efficiency_multiplier: string;
}

export interface Product {
  id: number;
  item_number: string;
  description: string | null;
  category_code: string | null;
  standard_time_minutes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category: ProductCategory | null;
}

export interface ProductCreate {
  item_number: string;
  description?: string | null;
  category_code?: string | null;
  standard_time_minutes?: string | null;
  is_active?: boolean;
}

export interface ProductUpdate {
  item_number?: string;
  description?: string | null;
  category_code?: string | null;
  standard_time_minutes?: string | null;
  is_active?: boolean;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
}

// ============================================================================
// Common Types
// ============================================================================

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
}

export interface ApiError {
  detail: string;
}