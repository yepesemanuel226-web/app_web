import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Search, Settings, DollarSign, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

const ITEMS_PER_PAGE = 10;

export function ReturnsMora() {
  const [search, setSearch] = useState('');
  const [overdueLoans, setOverdueLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moraTariff, setMoraTariff] = useState(2000);
  const [editingTariff, setEditingTariff] = useState(false);
  const [newTariff, setNewTariff] = useState(2000);
  const [returnModal, setReturnModal] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { fetchOverdueLoans(); fetchMoraTariff(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search]);

  const fetchMoraTariff = async () => {
    const { data } = await supabase.from('mora_config').select('daily_rate').single();
    if (data) { setMoraTariff(data.daily_rate); setNewTariff(data.daily_rate); }
  };

  const fetchOverdueLoans = async () => {
    const { data } = await supabase
      .from('loans')
      .select('*, user:users(name, email), book:books(title)')
      .eq('status', 'overdue')
      .order('due_date');
    setOverdueLoans(data || []);
    setLoading(false);
  };

  const handleSaveTariff = async () => {
    const { error } = await supabase.from('mora_config').update({ daily_rate: newTariff }).neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) { await supabase.from('mora_config').insert([{ daily_rate: newTariff }]); }
    setMoraTariff(newTariff);
    setEditingTariff(false);
    toast.success('Tarifa actualizada exitosamente');
  };

  const handleReturn = async () => {
    if (!returnModal) return;
    const { error } = await supabase.rpc('process_book_return', { p_loan_id: returnModal.id });
    if (error) { toast.error('Error: ' + error.message); return; }

    await supabase.from('notifications').insert([{
      user_id: returnModal.user_id,
      type: 'success',
      title: 'Devolución registrada',
      message: `Tu devolución de "${returnModal.book?.title}" fue registrada.${returnModal.mora_amount > 0 ? ` Mora pendiente: $${returnModal.mora_amount.toLocaleString('es-CO')}` : ''}`,
      is_read: false
    }]);

    toast.success('Devolución procesada exitosamente');
    setReturnModal(null);
    fetchOverdueLoans();
  };

  const daysOverdue = (dueDate: string) => Math.max(0, Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000));

  const filtered = overdueLoans.filter(l =>
    !search ||
    l.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.book?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalMora = overdueLoans.reduce((sum, l) => sum + (l.mora_amount || 0), 0);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Devoluciones y moras</h1>
        <p className="text-gray-600">Procesa devoluciones y gestiona las tarifas de mora</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Préstamos vencidos</p>
          <p className="text-3xl font-bold text-[#D32F2F]">{overdueLoans.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 mb-1">Mora total acumulada</p>
          <p className="text-3xl font-bold text-[#E8A020]">${totalMora.toLocaleString('es-CO')}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Tarifa diaria de mora</p>
            <button onClick={() => setEditingTariff(!editingTariff)} className="text-[#1A3A5C] hover:text-[#E8A020]">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          {editingTariff ? (
            <div className="flex gap-2 items-center">
              <input type="number" value={newTariff} onChange={e => setNewTariff(Number(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020]" />
              <button onClick={handleSaveTariff} className="bg-[#388E3C] text-white px-2 py-1 rounded-lg text-sm">✓</button>
              <button onClick={() => setEditingTariff(false)} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-sm">✕</button>
            </div>
          ) : (
            <p className="text-3xl font-bold text-[#1A3A5C]">${moraTariff.toLocaleString('es-CO')}</p>
          )}
        </Card>
      </div>

      <Card>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Buscar por usuario o libro..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? <p className="text-gray-500">Cargando...</p> : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay préstamos vencidos 🎉</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Usuario</th>
                    <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Libro</th>
                    <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Vencimiento</th>
                    <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Días vencido</th>
                    <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Mora</th>
                    <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(loan => (
                    <tr key={loan.id} className="border-b border-gray-100 bg-red-50 hover:bg-red-100">
                      <td className="py-3 px-4">
                        <p className="font-medium text-[#1A3A5C]">{loan.user?.name}</p>
                        <p className="text-xs text-gray-500">{loan.user?.email}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{loan.book?.title}</td>
                      <td className="py-3 px-4 text-[#D32F2F] font-semibold">{loan.due_date}</td>
                      <td className="py-3 px-4">
                        <Badge variant="danger">{daysOverdue(loan.due_date)} días</Badge>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#D32F2F]">${(loan.mora_amount || 0).toLocaleString('es-CO')}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => setReturnModal(loan)}
                          className="text-sm bg-[#1A3A5C] text-white px-3 py-1 rounded-lg hover:bg-[#2a4a6c]">
                          Procesar devolución
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                Página {currentPage} de {totalPages} · {filtered.length} préstamos vencidos en total
              </p>
            )}
          </>
        )}
      </Card>

      {returnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#1A3A5C]">Procesar devolución</h2>
              <button onClick={() => setReturnModal(null)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <p className="mb-2"><strong>Usuario:</strong> {returnModal.user?.name}</p>
            <p className="mb-2"><strong>Libro:</strong> {returnModal.book?.title}</p>
            <p className="mb-2"><strong>Vencimiento:</strong> {returnModal.due_date}</p>
            <p className="mb-4"><strong>Días vencido:</strong> {daysOverdue(returnModal.due_date)}</p>
            {returnModal.mora_amount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#D32F2F]" />
                  <p className="text-[#D32F2F] font-bold">Mora acumulada: ${returnModal.mora_amount.toLocaleString('es-CO')}</p>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setReturnModal(null)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleReturn} className="flex-1 bg-[#388E3C] text-white py-2 rounded-lg hover:bg-green-700">Confirmar devolución</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}