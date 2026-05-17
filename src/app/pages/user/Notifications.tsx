import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Bell, AlertTriangle, CheckCircle, Clock, ShoppingCart, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

const ITEMS_PER_PAGE = 10;

export function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

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
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      // Ajustar página si queda vacía
      const newTotal = Math.ceil(updated.length / ITEMS_PER_PAGE);
      if (currentPage > newTotal && newTotal > 0) setCurrentPage(newTotal);
      return updated;
    });
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user!.id);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const paginated = notifications.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'danger':  return <AlertTriangle className="w-5 h-5 text-[#D32F2F]" />;
      case 'warning': return <Clock className="w-5 h-5 text-[#E8A020]" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-[#388E3C]" />;
      case 'info':    return <ShoppingCart className="w-5 h-5 text-[#1A3A5C]" />;
      default:        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBg = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50 border-gray-200';
    switch (type) {
      case 'danger':  return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'success': return 'bg-green-50 border-green-200';
      default:        return 'bg-blue-50 border-blue-200';
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
        <>
          <div className="space-y-3">
            {paginated.map((n) => (
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-6">
              <button onClick={() => goToPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-[#1A3A5C]">
                <ChevronLeft className="w-5 h-5" />
              </button>
              {getPageNumbers().map((page, i) => (
                page === '...'
                  ? <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
                  : <button key={page} onClick={() => goToPage(page as number)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-[#1A3A5C] text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                      {page}
                    </button>
              ))}
              <button onClick={() => goToPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-[#1A3A5C]">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
          {totalPages > 1 && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Página {currentPage} de {totalPages} · {notifications.length} notificaciones en total
            </p>
          )}
        </>
      )}
    </div>
  );
}