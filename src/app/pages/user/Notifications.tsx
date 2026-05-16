import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Bell, AlertTriangle, CheckCircle, Clock, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

export function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Suscripción en tiempo real
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => fetchNotifications())
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [user]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    setNotifications(data || []);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user!.id);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'danger': return <AlertTriangle className="w-5 h-5 text-[#D32F2F]" />;
      case 'warning': return <Clock className="w-5 h-5 text-[#E8A020]" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-[#388E3C]" />;
      case 'info': return <ShoppingCart className="w-5 h-5 text-[#1A3A5C]" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBg = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50 border-gray-200';
    switch (type) {
      case 'danger': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="danger" className="ml-3">{unreadCount} nueva{unreadCount !== 1 ? 's' : ''}</Badge>
            )}
          </h1>
          <p className="text-gray-600">Mantente al día con tus préstamos y reservas</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" onClick={markAllAsRead}>Marcar todas como leídas</Button>
        )}
      </div>

      {loading ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">Cargando notificaciones...</p>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No tienes notificaciones</h3>
          <p className="text-gray-500">Te notificaremos cuando haya novedades</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`border-2 rounded-lg p-4 transition-all ${getBg(n.type, n.is_read)}`}>
              <div className="flex items-start gap-4">
                <div className="mt-1">{getIcon(n.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-bold text-[#1A3A5C]">
                      {n.title}
                      {!n.is_read && <span className="ml-2 inline-block w-2 h-2 bg-[#E8A020] rounded-full"></span>}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(n.created_at).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{n.message}</p>
                  <div className="flex gap-2">
                    {!n.is_read && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)}>
                        Marcar como leída
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => deleteNotification(n.id)} className="text-[#D32F2F] hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}