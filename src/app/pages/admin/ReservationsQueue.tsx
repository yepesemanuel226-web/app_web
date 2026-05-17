import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Bell, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

export function ReservationsQueue() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    const { data } = await supabase
      .from('reservations')
      .select('*, user:users(name, email), book:books(title, author, stock_loan)')
      .in('status', ['waiting', 'available'])
      .order('reserved_date');
    setReservations(data || []);
    setLoading(false);
  };

  const filtered = reservations.filter(r =>
    !search ||
    r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.book?.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Agrupar por libro
  const grouped = filtered.reduce((acc: any, r) => {
    const key = r.book_id;
    if (!acc[key]) acc[key] = { book: r.book, items: [] };
    acc[key].items.push(r);
    return acc;
  }, {});

  const handleNotify = async (reservation: any) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'available', available_until: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] })
      .eq('id', reservation.id);

    if (error) { toast.error('Error: ' + error.message); return; }

    await supabase.from('notifications').insert([{
      user_id: reservation.user_id,
      type: 'success',
      title: '¡Tu libro está disponible!',
      message: `"${reservation.book?.title}" ya está disponible para recoger. Tienes 7 días para pasar a buscarlo.`,
      is_read: false
    }]);

    toast.success(`Notificación enviada a ${reservation.user?.name}`);
    fetchReservations();
  };

  const handleCancel = async (reservation: any) => {
    await supabase.from('reservations').update({ status: 'cancelled' }).eq('id', reservation.id);
    toast.success('Reserva cancelada');
    fetchReservations();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Cola de reservas</h1>
        <p className="text-gray-600">Administra las reservas pendientes por libro</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Buscar por usuario o libro..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <p className="text-gray-500">Cargando...</p> :
       Object.keys(grouped).length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">No hay reservas pendientes</p>
        </Card>
      ) : (
        Object.values(grouped).map((group: any) => (
          <Card key={group.book?.title}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#1A3A5C]">{group.book?.title}</h3>
                <p className="text-gray-600 text-sm">{group.book?.author}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{group.items.length} en cola</span>
                <Badge variant={group.book?.stock_loan > 0 ? 'success' : 'danger'}>
                  Stock: {group.book?.stock_loan}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              {group.items.sort((a: any, b: any) => a.queue_position - b.queue_position).map((r: any) => (
                <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg border ${r.status === 'available' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-[#1A3A5C] text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {r.queue_position || '?'}
                    </span>
                    <div>
                      <p className="font-medium text-[#1A3A5C]">{r.user?.name}</p>
                      <p className="text-xs text-gray-500">{r.user?.email} · Reservado: {new Date(r.reserved_date).toLocaleDateString('es-CO')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.status === 'available' ? 'success' : 'warning'}>
                      {r.status === 'available' ? 'Disponible' : 'En espera'}
                    </Badge>
                    {r.status === 'waiting' && group.book?.stock_loan > 0 && (
                      <button onClick={() => handleNotify(r)} className="flex items-center gap-1 text-xs bg-[#388E3C] text-white px-2 py-1 rounded-lg hover:bg-green-700">
                        <Bell className="w-3 h-3" />Notificar
                      </button>
                    )}
                    <button onClick={() => handleCancel(r)} className="text-[#D32F2F] hover:text-red-700">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
