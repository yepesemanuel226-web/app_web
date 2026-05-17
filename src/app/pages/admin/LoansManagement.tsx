import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

export function LoansManagement() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [returnModal, setReturnModal] = useState<any | null>(null);

  useEffect(() => { fetchLoans(); }, []);

  const fetchLoans = async () => {
    const { data } = await supabase
      .from('loans')
      .select('*, user:users(name, email), book:books(title)')
      .order('created_at', { ascending: false });
    setLoans(data || []);
    setLoading(false);
  };

  const filtered = loans.filter(l => {
    const matchFilter = filter === 'all' || l.status === filter;
    const matchSearch = !search ||
      l.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.book?.title?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleReturn = async () => {
    if (!returnModal) return;
    const { error } = await supabase.rpc('process_book_return', { p_loan_id: returnModal.id });
    if (error) { toast.error('Error al procesar devolución: ' + error.message); return; }

    await supabase.from('notifications').insert([{
      user_id: returnModal.user_id,
      type: 'success',
      title: 'Devolución registrada',
      message: `Tu devolución de "${returnModal.book?.title}" fue registrada exitosamente.`,
      is_read: false
    }]);

    toast.success('Devolución registrada exitosamente');
    setReturnModal(null);
    fetchLoans();
  };

  const loanTypeLabel = (type: string) => ({ express: 'Express', weekly: 'Semanal', monthly: 'Mensual' }[type] || type);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Gestión de préstamos</h1>
        <p className="text-gray-600">Administra todos los préstamos del sistema</p>
      </div>

      <Card>
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Buscar por usuario o libro..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'overdue', 'returned'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-[#1A3A5C] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : f === 'overdue' ? 'Vencidos' : 'Devueltos'}
              </button>
            ))}
          </div>
        </div>

        {loading ? <p className="text-gray-500">Cargando...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Usuario</th>
                  <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Libro</th>
                  <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Tipo</th>
                  <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Vencimiento</th>
                  <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Estado</th>
                  <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Mora</th>
                  <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(loan => (
                  <tr key={loan.id} className={`border-b border-gray-100 hover:bg-gray-50 ${loan.status === 'overdue' ? 'bg-red-50' : ''}`}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#1A3A5C]">{loan.user?.name}</p>
                      <p className="text-xs text-gray-500">{loan.user?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{loan.book?.title}</td>
                    <td className="py-3 px-4 text-gray-700">{loanTypeLabel(loan.loan_type)}</td>
                    <td className="py-3 px-4 text-gray-700">{loan.due_date}</td>
                    <td className="py-3 px-4">
                      {loan.status === 'overdue' ? <Badge variant="danger">Vencido</Badge> :
                       loan.status === 'active' ? <Badge variant="success">Activo</Badge> :
                       <Badge variant="neutral">Devuelto</Badge>}
                    </td>
                    <td className="py-3 px-4">
                      {loan.mora_amount > 0 ? <span className="text-[#D32F2F] font-bold">${loan.mora_amount.toLocaleString('es-CO')}</span> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      {(loan.status === 'active' || loan.status === 'overdue') && (
                        <button onClick={() => setReturnModal(loan)}
                          className="text-sm bg-[#1A3A5C] text-white px-3 py-1 rounded-lg hover:bg-[#2a4a6c]">
                          Registrar devolución
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-gray-500 py-8">No hay préstamos</p>}
          </div>
        )}
      </Card>

      {returnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#1A3A5C]">Confirmar devolución</h2>
              <button onClick={() => setReturnModal(null)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <p className="text-gray-700 mb-2"><strong>Usuario:</strong> {returnModal.user?.name}</p>
            <p className="text-gray-700 mb-2"><strong>Libro:</strong> {returnModal.book?.title}</p>
            <p className="text-gray-700 mb-4"><strong>Vencimiento:</strong> {returnModal.due_date}</p>
            {returnModal.mora_amount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-[#D32F2F] font-bold">Mora pendiente: ${returnModal.mora_amount.toLocaleString('es-CO')}</p>
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