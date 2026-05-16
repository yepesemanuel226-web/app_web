// Tipos de la base de datos Supabase

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: string;
  city?: string;
  is_blocked: boolean;
  registration_date: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  description?: string;
  publisher?: string;
  publication_year?: number;
  pages?: number;
  language?: string;
  stock_loan: number;
  stock_sale: number;
  sale_price?: number;
  cover_image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  user_id: string;
  book_id: string;
  loan_type: 'express' | 'weekly' | 'monthly';
  start_date: string;
  due_date: string;
  return_date?: string;
  status: 'active' | 'overdue' | 'returned';
  days_overdue: number;
  mora_amount: number;
  mora_paid: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones
  user?: User;
  book?: Book;
}

export interface Reservation {
  id: string;
  user_id: string;
  book_id: string;
  status: 'waiting' | 'available' | 'completed' | 'cancelled';
  queue_position?: number;
  reserved_date: string;
  available_until?: string;
  completed_date?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  user?: User;
  book?: Book;
}

export interface Sale {
  id: string;
  user_id: string;
  book_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city: string;
  payment_method: 'efectivo' | 'transferencia' | 'tarjeta';
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  sale_date: string;
  delivery_date?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  user?: User;
  book?: Book;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface MoraConfig {
  id: string;
  daily_rate: number;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}
