export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  };
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Province {
  id: string;
  name: string;
  farm_count: number;
  created_at: string;
}

export interface Farm {
  id: string;
  name: string;
  province: string;
  province_name: string;
  location: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
}

export interface Employee {
  id: string;
  full_name: string;
  role: "farmer" | "worker" | "manager";
  status: "active" | "inactive";
  farm: string;
  farm_name: string;
  salary: number;
  hire_date: string;
  created_at: string;
}

export interface ChickenBatch {
  id: string;
  farm: string;
  farm_name: string;
  quantity: number;
  entry_date: string;
  source: string;
  cost_per_unit: number;
  status: "active" | "inactive";
  created_at: string;
}

export interface ChickenMovement {
  id: string;
  farm: string;
  farm_name: string;
  batch_id: string;
  type: "IN" | "OUT";
  quantity: number;
  movement_date: string;
  reason: string;
  created_at: string;
}

export interface FeedTransaction {
  id: string;
  farm: string;
  farm_name: string;
  type: "IN" | "OUT";
  quantity: number;
  unit: "bag" | "kg";
  transaction_date: string;
  note: string;
  created_at: string;
}

export interface Expense {
  id: string;
  farm: string;
  farm_name: string;
  category: string;
  amount: number;
  expense_date: string;
  is_approved: boolean;
  created_at: string;
}

export interface Income {
  id: string;
  farm: string;
  farm_name: string;
  source: string;
  amount: number;
  income_date: string;
  is_approved: boolean;
  created_at: string;
}

export interface GlobalDashboard {
  total_provinces: number;
  total_farms: number;
  total_employees: number;
  total_chickens: number;
  total_feed_remaining: number;
  total_expenses: number;
  total_income: number;
  total_capital: number;
  net_profit: number;
}
