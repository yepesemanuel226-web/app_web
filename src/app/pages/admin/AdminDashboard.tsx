import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { BookOpen, AlertTriangle, ShoppingCart, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

export function AdminDashboard() {
  const [stats, setStats] = useState({ activeLoans: 0, overdueLoans: 0, totalBooks: 0, salesThisMonth: 0, pendingReservations: 0, totalUsers: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    const [loans, books, sales, reservations, users] = await Promise.all([
      supabase.from('loans').select('status'),
      supabase.from('books').select('id').eq('is_active', true),
      supabase.from('sales').select('id').gte('sale_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
      supabase.from('reservations').select('id').in('status', ['waiting', 'available']),
      supabase.from('users').select('id').eq('role', 'user'),
    ]);

    const allLoans = loans.data || [];
    setStats({
      activeLoans: allLoans.filter(l => l.status === 'active').length,
      overdueLoans: allLoans.filter(l => l.status === 'overdue').length,
      totalBooks: books.data?.length || 0,
      salesThisMonth: sales.data?.length || 0,
      pendingReservations: reservations.data?.length || 0,
      totalUsers: users.data?.length || 0,
    });
    setLoading(false);
  };

  const fetchRecentActivity = async () => {
    const [loans, sales, reservations] = await Promise.all([
      supabase.from('loans').select('id, status, created_at, user:users(name), book:books(title)').order('created_at', { ascending: false }).limit(3),
      supabase.from('sales').select('id, created_at, user:users(name), book:books(title)').order('created_at', { ascending: false }).limit(2),
      supabase.from('reservations').select('id, created_at, user:users(name), book:books(title)').order('created_at', { ascending: false }).limit(2),
    ]);

    // Supabase puede devolver el join como objeto o array según la relación.
    // Esta función normaliza ambos casos.
    const getName = (rel: any): string => {
      if (!rel) return 'Usuario desconocido';
      if (Array.isArray(rel)) return rel[0]?.name ?? 'Usuario desconocido';
      return rel.name ?? 'Usuario desconocido';
    };

    const getTitle = (rel: any): string => {
      if (!rel) return 'Libro desconocido';
      if (Array.isArray(rel)) return rel[0]?.title ?? 'Libro desconocido';
      return rel.title ?? 'Libro desconocido';
    };

    const activity = [
      ...(loans.data || []).map(l => ({
        type: l.status === 'overdue' ? 'overdue' : 'loan',
        user: getName(l.user),
        item: getTitle(l.book),
        time: l.created_at ?? new Date().toISOString(),
      })),
      ...(sales.data || []).map(s => ({
        type: 'purchase',
        user: getName(s.user),
        item: getTitle(s.book),
        time: s.created_at ?? new Date().toISOString(),
      })),
      ...(reservations.data || []).map(r => ({
        type: 'reservation',
        user: getName(r.user),
        item: getTitle(r.book),
        time: r.created_at ?? new Date().toISOString(),
      })),
    ]
      .filter(a => a.time)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6);

    setRecentActivity(activity);
  };

  const kpis = [
    { label: 'Préstamos activos', value: stats.activeLoans, icon: BookOpen, color: 'bg-[#1A3A5C]', link: '/admin/loans' },
    { label: 'Préstamos vencidos', value: stats.overdueLoans, icon: AlertTriangle, color: 'bg-[#D32F2F]', link: '/admin/returns' },
    { label: 'Libros en catálogo', value: stats.totalBooks, icon: BookOpen, color: 'bg-[#0D5C63]', link: '/admin/catalog' },
    { label: 'Ventas este mes', value: stats.salesThisMonth, icon: ShoppingCart, color: 'bg-[#E8A020]', link: '/admin/sales' },
    { label: 'Reservas pendientes', value: stats.pendingReservations, icon: Clock, color: 'bg-[#388E3C]', link: '/admin/reservations' },
    { label: 'Usuarios registrados', value: stats.totalUsers, icon: Users, color: 'bg-[#1A3A5C]', link: '/admin/users' },
  ];

  const activityIcon: Record<string, string> = { loan: '📖', overdue: '⚠️', purchase: '🛒', reservation: '🔖', return: '✅' };
  const activityText: Record<string, string> = { loan: 'solicitó préstamo de', overdue: 'tiene mora en', purchase: 'compró', reservation: 'reservó', return: 'devolvió' };

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 1) return 'Justo ahora';
    if (diff < 60) return `Hace ${diff} min`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)} h`;
    return `Hace ${Math.floor(diff / 1440)} días`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Panel de administración</h1>
        <p className="text-gray-600">Resumen general del sistema bibliotecario</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <Link key={i} to={kpi.link}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{kpi.label}</p>
                  <p className="text-4xl font-bold text-[#1A3A5C]">{loading ? '...' : kpi.value}</p>
                </div>
                <div className={`${kpi.color} p-3 rounded-lg`}>
                  <kpi.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Actividad reciente</h2>
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay actividad reciente.</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="text-xl">{activityIcon[item.type] || '📌'}</span>
                <div className="flex-1">
                  <span className="font-medium text-[#1A3A5C]">{item.user}</span>
                  <span className="text-gray-600"> {activityText[item.type]} </span>
                  <span className="font-medium text-gray-800">"{item.item}"</span>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(item.time)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}