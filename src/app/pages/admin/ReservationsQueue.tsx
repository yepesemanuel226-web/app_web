import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Bell, XCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

const ITEMS_PER_PAGE = 5;

export function ReservationsQueue() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { fetchReservations(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search]);

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

  const grouped = filtered.reduce((acc: any, r) => {
    const key = r.book_id;
    if (!acc[key]) acc[key] = { book: r.book, items: [] };
    acc[key].items.push(r);
    return acc;
  }, {});

  const groupList = Object.values(grouped) as any[];
  const totalPages = Math.ceil(groupList.length / ITEMS_PER_PAGE);
  const paginatedGroups = groupList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };

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

  const handleNotify = async (reservation: any) => {
    const { error } = await supabase
      .from('reservations')
      .delete()
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
       groupList.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">No hay reservas pendientes</p>
        </Card>
      ) : (
        <>
          {paginatedGroups.map((group: any) => (
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
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-200">
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
                      <Badge variant="warning">En espera</Badge>
                      {group.book?.stock_loan > 0 && (
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
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-2">
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
              Página {currentPage} de {totalPages} · {groupList.length} libros en cola
            </p>
          )}
        </>
      )}
    </div>
  );
}