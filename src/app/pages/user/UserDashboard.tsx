import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { BookOpen, Clock, AlertCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeLoans: 0, pendingReservations: 0, overdueLoans: 0 });
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [availableBooks, setAvailableBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Préstamos activos del usuario
      const { data: loans } = await supabase
        .from('loans')
        .select('*, book:books(title, author)')
        .eq('user_id', user.id)
        .in('status', ['active', 'overdue'])
        .order('due_date');

      // Reservas pendientes
      const { data: reservations } = await supabase
        .from('reservations')
        .select('id')
        .eq('user_id', user.id)
        .in('status', ['waiting', 'available']);

      // Libros disponibles
      const { data: books } = await supabase
        .from('books')
        .select('id, title, author, category')
        .eq('is_active', true)
        .gt('stock_loan', 0)
        .limit(3);

      const overdue = (loans || []).filter(l => l.status === 'overdue').length;

      setStats({
        activeLoans: (loans || []).filter(l => l.status === 'active').length,
        pendingReservations: (reservations || []).length,
        overdueLoans: overdue,
      });
      setActiveLoans((loans || []).slice(0, 2));
      setAvailableBooks(books || []);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const statCards = [
    { label: 'Préstamos activos', value: stats.activeLoans, icon: BookOpen, color: 'bg-[#1A3A5C]' },
    { label: 'Reservas pendientes', value: stats.pendingReservations, icon: Clock, color: 'bg-[#E8A020]' },
    { label: 'Alertas de mora', value: stats.overdueLoans, icon: AlertCircle, color: 'bg-[#D32F2F]' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#1A3A5C] to-[#0D5C63] rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">¡Bienvenido, {user?.name}!</h1>
        <p className="text-blue-100">Explora nuestro catálogo y gestiona tus préstamos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-[#1A3A5C] mt-1">
                  {loading ? '...' : stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en el catálogo..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
          />
          <Link to="/user/catalog">
            <Button>Buscar</Button>
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Mis préstamos activos</h2>
          {loading ? (
            <p className="text-gray-500 text-sm">Cargando...</p>
          ) : activeLoans.length === 0 ? (
            <p className="text-gray-500 text-sm">No tienes préstamos activos.</p>
          ) : (
            <div className="space-y-3">
              {activeLoans.map((loan) => (
                <div key={loan.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-[#1A3A5C]">{loan.book?.title}</h3>
                      <p className="text-sm text-gray-600">{loan.book?.author}</p>
                    </div>
                    <Badge variant={loan.status === 'overdue' ? 'danger' : 'info'}>
                      {loan.loan_type === 'express' ? 'Express' : loan.loan_type === 'weekly' ? 'Semanal' : 'Mensual'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">Vence: {loan.due_date}</p>
                </div>
              ))}
            </div>
          )}
          <Link to="/user/loans">
            <Button variant="ghost" className="w-full mt-4">Ver todos los préstamos</Button>
          </Link>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Libros disponibles</h2>
          {loading ? (
            <p className="text-gray-500 text-sm">Cargando...</p>
          ) : availableBooks.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay libros disponibles.</p>
          ) : (
            <div className="space-y-3">
              {availableBooks.map((book) => (
                <div key={book.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-[#1A3A5C]">{book.title}</h3>
                      <p className="text-sm text-gray-600">{book.author}</p>
                      <p className="text-xs text-gray-500 mt-1">{book.category}</p>
                    </div>
                    <Badge variant="success">Disponible</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link to="/user/catalog">
            <Button variant="ghost" className="w-full mt-4">Ver catálogo completo</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
