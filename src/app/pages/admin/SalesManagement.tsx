import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Search, TrendingUp, ShoppingCart, DollarSign } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

export function SalesManagement() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchSales(); }, []);

  const fetchSales = async () => {
    const { data } = await supabase
      .from('sales')
      .select('*, user:users(name, email), book:books(title)')
      .order('sale_date', { ascending: false });
    setSales(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('sales').update({ status }).eq('id', id);
    toast.success('Estado actualizado');
    fetchSales();
  };

  const filtered = sales.filter(s => {
    const matchFilter = filter === 'all' || s.status === filter;
    const matchSearch = !search ||
      s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.book?.title?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalQty = sales.reduce((sum, s) => sum + (s.quantity || 0), 0);

  const paymentLabel = (m: string) => ({ efectivo: 'Efectivo', transferencia: 'Transferencia', tarjeta: 'Tarjeta' }[m] || m);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Gestión de ventas</h1>
        <p className="text-gray-600">Administra las transacciones de venta de libros</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Ingresos totales</p>
            <DollarSign className="w-5 h-5 text-[#388E3C]" />
          </div>
          <p className="text-3xl font-bold text-[#388E3C]">${totalRevenue.toLocaleString('es-CO')}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Transacciones</p>
            <ShoppingCart className="w-5 h-5 text-[#1A3A5C]" />
          </div>
          <p className="text-3xl font-bold text-[#1A3A5C]">{sales.length}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Libros vendidos</p>
            <TrendingUp className="w-5 h-5 text-[#E8A020]" />
          </div>
          <p className="text-3xl font-bold text-[#E8A020]">{totalQty}</p>
        </Card>
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
            {['all', 'pending', 'delivered', 'cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-[#1A3A5C] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : f === 'delivered' ? 'Entregadas' : 'Canceladas'}
              </button>
            ))}
          </div>
        </div>

        {loading ? <p className="text-gray-500">Cargando...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Fecha</th>
                  <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Usuario</th>
                  <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Libro</th>
                  <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Cant.</th>
                  <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Total</th>
                  <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Pago</th>
                  <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Estado</th>
                  <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(sale => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">{sale.sale_date}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#1A3A5C]">{sale.user?.name}</p>
                      <p className="text-xs text-gray-500">{sale.user?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{sale.book?.title}</td>
                    <td className="py-3 px-4 text-gray-700">{sale.quantity}</td>
                    <td className="py-3 px-4 font-bold text-[#388E3C]">${sale.total_amount?.toLocaleString('es-CO')}</td>
                    <td className="py-3 px-4 text-gray-700">{paymentLabel(sale.payment_method)}</td>
                    <td className="py-3 px-4">
                      {sale.status === 'pending' ? <Badge variant="warning">Pendiente</Badge> :
                       sale.status === 'delivered' ? <Badge variant="success">Entregado</Badge> :
                       <Badge variant="danger">Cancelado</Badge>}
                    </td>
                    <td className="py-3 px-4">
                      {sale.status === 'pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => updateStatus(sale.id, 'delivered')} className="text-xs bg-[#388E3C] text-white px-2 py-1 rounded hover:bg-green-700">Entregar</button>
                          <button onClick={() => updateStatus(sale.id, 'cancelled')} className="text-xs bg-[#D32F2F] text-white px-2 py-1 rounded hover:bg-red-700">Cancelar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-gray-500 py-8">No hay ventas</p>}
          </div>
        )}
      </Card>
    </div>
  );
}
