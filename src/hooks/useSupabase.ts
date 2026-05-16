import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Book, Loan, Reservation, Sale, User, Notification } from '../types/database';

// Hook para verificar si Supabase está configurado
export function useSupabaseStatus() {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
  }, []);

  return { isConfigured, useMockData: !isConfigured };
}

// Hook para obtener libros
export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { useMockData } = useSupabaseStatus();

  useEffect(() => {
    const fetchBooks = async () => {
      if (useMockData) {
        // Datos mock si Supabase no está configurado
        setBooks([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('is_active', true)
          .order('title');

        if (error) throw error;
        setBooks(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [useMockData]);

  return { books, loading, error };
}

// Hook para obtener préstamos
export function useLoans(userId?: string) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { useMockData } = useSupabaseStatus();

  useEffect(() => {
    const fetchLoans = async () => {
      if (useMockData) {
        setLoans([]);
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('loans')
          .select(`
            *,
            user:users(*),
            book:books(*)
          `);

        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setLoans(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching loans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [userId, useMockData]);

  return { loans, loading, error };
}

// Hook para crear un préstamo
export function useCreateLoan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createLoan = async (loanData: {
    user_id: string;
    book_id: string;
    loan_type: 'express' | 'weekly' | 'monthly';
  }) => {
    setLoading(true);
    setError(null);

    try {
      // Calcular fecha de vencimiento
      const startDate = new Date();
      const dueDate = new Date(startDate);

      switch (loanData.loan_type) {
        case 'express':
          dueDate.setDate(dueDate.getDate() + 3);
          break;
        case 'weekly':
          dueDate.setDate(dueDate.getDate() + 7);
          break;
        case 'monthly':
          dueDate.setDate(dueDate.getDate() + 30);
          break;
      }

      const { data, error } = await supabase
        .from('loans')
        .insert([
          {
            ...loanData,
            start_date: startDate.toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            status: 'active',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Actualizar stock del libro
      await supabase.rpc('decrement_book_stock', { book_id: loanData.book_id });

      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createLoan, loading, error };
}

// Hook para crear una venta
export function useCreateSale() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSale = async (saleData: {
    user_id: string;
    book_id: string;
    quantity: number;
    unit_price: number;
    delivery_name: string;
    delivery_phone: string;
    delivery_address: string;
    delivery_city: string;
    payment_method: 'efectivo' | 'transferencia' | 'tarjeta';
  }) => {
    setLoading(true);
    setError(null);

    try {
      const total_amount = saleData.unit_price * saleData.quantity;

      const { data, error } = await supabase
        .from('sales')
        .insert([
          {
            ...saleData,
            total_amount,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Actualizar stock de venta
      await supabase.rpc('decrement_sale_stock', {
        book_id: saleData.book_id,
        quantity: saleData.quantity,
      });

      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createSale, loading, error };
}

// Hook para obtener notificaciones
export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { useMockData } = useSupabaseStatus();

  useEffect(() => {
    if (useMockData) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setNotifications(data || []);
      setLoading(false);
    };

    fetchNotifications();

    // Suscripción en tiempo real
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, useMockData]);

  return { notifications, loading };
}
