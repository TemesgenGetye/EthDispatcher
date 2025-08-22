import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database types
export interface Supplier {
  id: string;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  status: "active" | "inactive" | "pending";
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  role: "driver" | "admin" | "supplier";
  full_name: string;
  email: string;
  phone: string;
  password_hash?: string;
  vehicle_info?: Record<string, unknown>;
  status: "active" | "inactive" | "break";
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  serial_number: string;
  supplier_id: string;
  driver_id?: string;
  customer_name: string;
  customer_phone: string;
  pickup_address: string;
  delivery_address: string;
  price: number;
  items_count: number;
  weight_kg?: number;
  distance_km?: string;
  order_date: string;
  delivery_date?: string;
  estimated_time?: string;
  actual_delivery_time?: string;
  status:
    | "pending"
    | "assigned"
    | "out_for_delivery"
    | "delivered"
    | "returned"
    | "cancelled";
  priority: "high" | "medium" | "low";
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  supplier?: Supplier;
  driver?: User;
}

export interface FinancialRecord {
  id: string;
  order_id: string;
  driver_id: string;
  transaction_type: "payment" | "expense";
  amount: number;
  description: string;
  transaction_date: string;
  created_at: string;
  // Joined data
  order?: Order;
  driver?: User;
}

export interface Return {
  id: string;
  order_id: string;
  driver_id: string;
  return_to: "supplier" | "warehouse";
  reason: string;
  image_url?: string;
  return_date: string;
  created_at: string;
  // Joined data
  order?: Order;
  driver?: User;
}
