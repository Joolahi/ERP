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
  efficiency_multiplier: number; // Changed from string
}

export interface Product {
  id: number;
  item_number: string;
  description: string | null;
  category_code: string | null;
  standard_time_minutes: number | null; // Changed from string
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category: ProductCategory | null;
}

export interface ProductCreate {
  item_number: string;
  description?: string | null;
  category_code?: string | null;
  standard_time_minutes?: number | null;
  is_active?: boolean;
}

export interface ProductUpdate {
  item_number?: string;
  description?: string | null;
  category_code?: string | null;
  standard_time_minutes?: number | null;
  is_active?: boolean;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
}

// ============================================================================
// Order Types
// ============================================================================

export type OrderStatus = 
  | 'pending'       // Odottaa aloitusta
  | 'in_progress'   // Työn alla
  | 'completed'     // Valmis
  | 'cancelled';    // Peruttu

export type OrderPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent';

export interface Order {
  id: number;
  order_number: string;
  product_id: number;
  department_id: number;
  quantity: number;
  status: OrderStatus;
  priority: OrderPriority;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  due_date: string | null;
  
  // Calculated fields
  estimated_duration_minutes: number | null;
  actual_duration_minutes: number | null;
  efficiency_percentage: number | null;
  
  // Notes
  notes: string | null;
  
  // Relations (optional - loaded with expand)
  product?: Product;
  department?: Department;
}

export interface OrderCreate {
  order_number: string;
  product_id: number;
  department_id: number;
  quantity: number;
  priority?: OrderPriority;
  due_date?: string | null;
  notes?: string | null;
}

export interface OrderUpdate {
  order_number?: string;
  product_id?: number;
  department_id?: number;
  quantity?: number;
  status?: OrderStatus;
  priority?: OrderPriority;
  due_date?: string | null;
  notes?: string | null;
}

export interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  page_size: number;
}

export interface OrderStats {
  total: number;
  by_status: {
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  by_priority: {
    low: number;
    normal: number;
    high: number;
    urgent: number;
  };
  overdue_count: number;
  avg_efficiency: number | null;
}

export interface OrderWithDetails extends Order {
  product: Product;
  department: Department;
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