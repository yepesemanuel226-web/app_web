import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

export function Reservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, book:books(title, author)')
      .eq('user_id', user!.id)
      .in('status', ['waiting', 'available'])
      .order('reserved_date', { ascending: false });

    if (error) toast.error('Error al cargar reservas');
    setReservations(data || []);
    setLoading(false);
  };

  const handleCancel = async (id: string, title: string) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      toast.error('Error al cancelar la reserva');
      return;
    }

    toast.success(`Reserva de "${title}" cancelada exitosamente`);
    setReservations(reservations.filter(r => r.id !== id));
  };

  const getStatusInfo = (r: any) => {
    if (r.status === 'available') {
      return {
        icon: <CheckCircle className="w-5 h-5 text-[#388E3C]" />,
        badge: <Badge variant="success">Disponible</Badge>,
        message: `Recoge antes del ${r.available_until || '—'}`
      };
    }
    return {
      icon: <Clock className="w-5 h-5 text-[#E8A020]" />,
      badge: <Badge variant="warning">En espera</Badge>,
      message: `#${r.queue_position || '—'} en cola`
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Mis reservas</h1>
        <p className="text-gray-600">Administra tus reservas activas y verifica su estado</p>
      </div>

      {reservations.some(r => r.status === 'available') && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#388E3C] mt-0.5" />
            <div>
              <h3 className="font-bold text-[#388E3C] mb-1">¡Tienes libros disponibles para recoger!</h3>
              <p className="text-sm text-green-800">Recuerda recoger tus libros reservados antes de la fecha límite.</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando reservas...</p>
      ) : reservations.length === 0 ? (
        <Card className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No tienes reservas activas</h3>
          <p className="text-gray-500">Busca un libro en el catálogo y resérvalo</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reservations.map((reservation) => {
            const statusInfo = getStatusInfo(reservation);
            return (
              <Card key={reservation.id} className={reservation.status === 'available' ? 'border-2 border-[#388E3C]' : ''}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-20 h-28 bg-gradient-to-br from-[#1A3A5C] to-[#0D5C63] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-2xl opacity-30">📖</span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">{statusInfo.badge}</div>
                      <h3 className="text-lg font-bold text-[#1A3A5C] mb-1">{reservation.book?.title}</h3>
                      <p className="text-gray-600 mb-3">{reservation.book?.author}</p>
                      <div className="flex items-center gap-2 mb-2">
                        {statusInfo.icon}
                        <span className="text-sm font-medium text-gray-700">{statusInfo.message}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Reservado el {new Date(reservation.reserved_date).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancel(reservation.id, reservation.book?.title)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}