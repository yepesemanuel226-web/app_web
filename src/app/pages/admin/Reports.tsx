import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import {
  exportLoansToPDF,
  exportPopularBooksToPDF,
  exportMoraUsersToPDF,
  exportInventoryToPDF,
  exportRevenueToPDF,
} from '../../../lib/pdfExport';

type Tab = 'loans' | 'popular' | 'mora' | 'inventory' | 'revenue';

export function Reports() {
  const [activeTab, setActiveTab] = useState<Tab>('loans');
  const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(true);

  // Datos reales
  const [loansData, setLoansData] = useState<any[]>([]);
  const [popularBooks, setPopularBooks] = useState<any[]>([]);
  const [moraUsers, setMoraUsers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);

  useEffect(() => { fetchAll(); }, [dateRange]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchLoans(),
      fetchPopularBooks(),
      fetchMoraUsers(),
      fetchInventory(),
      fetchSales(),
    ]);
    setLoading(false);
  };

  const fetchLoans = async () => {
    const { data } = await supabase
      .from('loans')
      .select('*, user:users(name, email), book:books(title)')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end + 'T23:59:59')
      .order('created_at', { ascending: false });
    setLoansData(data || []);
  };

  const fetchPopularBooks = async () => {
    const { data } = await supabase
      .from('books')
      .select('id, title, author, category, stock_loan, stock_sale, isbn')
      .eq('is_active', true)
      .order('title');

    if (!data) return;

    // Contar préstamos por libro
    const { data: loanCounts } = await supabase
      .from('loans')
      .select('book_id');

    const counts: Record<string, number> = {};
    (loanCounts || []).forEach(l => {
      counts[l.book_id] = (counts[l.book_id] || 0) + 1;
    });

    const booksWithCount = data.map(b => ({ ...b, loans_count: counts[b.id] || 0 }))
      .sort((a, b) => b.loans_count - a.loans_count)
      .slice(0, 20);

    setPopularBooks(booksWithCount);
  };

  const fetchMoraUsers = async () => {
    const { data } = await supabase
      .from('loans')
      .select('*, user:users(name, email), book:books(title)')
      .eq('status', 'overdue')
      .order('mora_amount', { ascending: false });

    const mapped = (data || []).map(l => ({
      ...l,
      name: l.user?.name,
      email: l.user?.email,
      bookTitle: l.book?.title,
      daysOverdue: Math.max(0, Math.floor((Date.now() - new Date(l.due_date).getTime()) / 86400000)),
    }));

    setMoraUsers(mapped);
  };

  const fetchInventory = async () => {
    const { data } = await supabase
      .from('books')
      .select('id, title, author, category, isbn, stock_loan, stock_sale, sale_price, is_active')
      .order('title');
    setInventory(data || []);
  };

  const fetchSales = async () => {
    const { data } = await supabase
      .from('sales')
      .select('*, user:users(name, email), book:books(title)')
      .gte('sale_date', dateRange.start)
      .lte('sale_date', dateRange.end)
      .order('sale_date', { ascending: false });
    setSalesData(data || []);
  };

  // Datos para gráficas de préstamos (agrupar por semana)
  const loansChartData = (() => {
    const weeks: Record<string, number> = {};
    loansData.forEach(l => {
      const date = new Date(l.created_at);
      const weekNum = Math.ceil(date.getDate() / 7);
      const key = `${date.toLocaleString('es-CO', { month: 'short' })} S${weekNum}`;
      weeks[key] = (weeks[key] || 0) + 1;
    });
    return Object.entries(weeks).map(([period, cantidad]) => ({ period, cantidad }));
  })();

  // Datos para gráfica de ventas (agrupar por mes)
  const salesChartData = (() => {
    const months: Record<string, number> = {};
    salesData.forEach(s => {
      const date = new Date(s.sale_date);
      const key = date.toLocaleString('es-CO', { month: 'long', year: 'numeric' });
      months[key] = (months[key] || 0) + (s.total_amount || 0);
    });
    return Object.entries(months).map(([month, ingresos]) => ({ month, ingresos }));
  })();

  // CSV con UTF-8 + BOM y separador punto y coma (estandar Excel latinoamerica)
  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const SEP = ';';
    const q = (v: string) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const csv = [headers, ...rows].map((r) => r.map(q).join(SEP)).join('\r\n');
    // \uFEFF = BOM UTF-8: le dice a Excel que el archivo es UTF-8
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    try {
      const ts = Date.now();
      switch (activeTab) {
        case 'loans': {
          downloadCSV(`Prestamos_${ts}.csv`,
            ['Fecha', 'Usuario', 'Email', 'Libro', 'Estado', 'Fecha devolucion'],
            loansData.map((l) => [
              l.created_at ? new Date(l.created_at).toLocaleDateString('es-CO') : '',
              l.user?.name ?? '', l.user?.email ?? '', l.book?.title ?? '',
              l.status === 'active' ? 'Activo' : l.status === 'overdue' ? 'Vencido' : 'Devuelto',
              l.due_date ?? '',
            ])
          ); break;
        }
        case 'popular': {
          downloadCSV(`LibrosSolicitados_${ts}.csv`,
            ['#', 'Titulo', 'Autor', 'Categoria', 'Prestamos', 'Stock prestamo'],
            popularBooks.map((b, i) => [
              String(i + 1), b.title ?? '', b.author ?? '', b.category ?? '',
              String(b.loans_count ?? 0), String(b.stock_loan ?? 0),
            ])
          ); break;
        }
        case 'mora': {
          downloadCSV(`UsuariosMora_${ts}.csv`,
            ['Usuario', 'Email', 'Libro', 'Vencio el', 'Dias vencido', 'Mora COP'],
            moraUsers.map((u) => [
              u.name ?? '', u.email ?? '', u.bookTitle ?? '', u.due_date ?? '',
              String(u.daysOverdue ?? 0), String(u.mora_amount || 0),
            ])
          ); break;
        }
        case 'inventory': {
          downloadCSV(`Inventario_${ts}.csv`,
            ['Titulo', 'Autor', 'Categoria', 'ISBN', 'Stock prestamo', 'Stock venta', 'Precio venta', 'Activo'],
            inventory.map((b) => [
              b.title ?? '', b.author ?? '', b.category ?? '', b.isbn ?? '',
              String(b.stock_loan ?? 0), String(b.stock_sale ?? 0),
              b.sale_price ? String(Number(b.sale_price)) : '',
              b.is_active ? 'Si' : 'No',
            ])
          ); break;
        }
        case 'revenue': {
          downloadCSV(`Ventas_${ts}.csv`,
            ['Fecha', 'Usuario', 'Email', 'Libro', 'Cantidad', 'Total COP', 'Estado'],
            salesData.map((s) => [
              s.sale_date ?? '', s.user?.name ?? '', s.user?.email ?? '', s.book?.title ?? '',
              String(s.quantity ?? 1), String(s.total_amount || 0),
              s.status === 'delivered' ? 'Entregado' : s.status === 'pending' ? 'Pendiente' : 'Cancelado',
            ])
          ); break;
        }
      }
      toast.success('¡CSV descargado exitosamente!');
    } catch (error) {
      toast.error('Error al generar el CSV');
      console.error(error);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') { handleExportCSV(); return; }
    try {
      switch (activeTab) {
        case 'loans':    exportLoansToPDF(loansData, dateRange); break;
        case 'popular':  exportPopularBooksToPDF(popularBooks); break;
        case 'mora':     exportMoraUsersToPDF(moraUsers); break;
        case 'inventory': exportInventoryToPDF(inventory); break;
        case 'revenue':  exportRevenueToPDF(salesData, dateRange); break;
      }
      toast.success('¡Reporte descargado exitosamente!');
    } catch (error) {
      toast.error('Error al generar el PDF');
      console.error(error);
    }
  };

  const tabs = [
    { id: 'loans', label: 'Préstamos por período' },
    { id: 'popular', label: 'Libros más solicitados' },
    { id: 'mora', label: 'Usuarios con mora' },
    { id: 'inventory', label: 'Inventario actual' },
    { id: 'revenue', label: 'Ingresos por ventas' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Reportes</h1>
          <p className="text-gray-600">Análisis y estadísticas del sistema</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />CSV
          </Button>
          <Button variant="secondary" onClick={() => handleExport('pdf')}>
            <Download className="w-4 h-4 mr-2" />PDF
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <div className="flex gap-3 items-center">
            <input type="date" value={dateRange.start}
              onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020]" />
            <span className="text-gray-600">hasta</span>
            <input type="date" value={dateRange.end}
              onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020]" />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'bg-[#E8A020] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        {loading ? (
          <p className="text-center text-gray-500 py-12">Cargando datos...</p>
        ) : (
          <>
            {/* PRÉSTAMOS */}
            {activeTab === 'loans' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#1A3A5C]">Préstamos por período</h2>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600 font-semibold">Activos: {loansData.filter(l => l.status === 'active').length}</span>
                    <span className="text-red-600 font-semibold">Vencidos: {loansData.filter(l => l.status === 'overdue').length}</span>
                    <span className="text-gray-500">Devueltos: {loansData.filter(l => l.status === 'returned').length}</span>
                  </div>
                </div>
                {loansChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={loansChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="cantidad" fill="#1A3A5C" name="Préstamos" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-gray-400 py-8">No hay préstamos en este período</p>}
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Usuario</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Libro</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Tipo</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Vencimiento</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Estado</th>
                        <th className="text-right py-2 px-3 font-semibold text-[#1A3A5C]">Mora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loansData.slice(0, 20).map((l, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 text-gray-700">{l.user?.name}</td>
                          <td className="py-2 px-3 text-gray-700">{l.book?.title}</td>
                          <td className="py-2 px-3 text-gray-500 capitalize">{l.loan_type}</td>
                          <td className="py-2 px-3 text-gray-500">{l.due_date}</td>
                          <td className="py-2 px-3">
                            <span className={`text-xs font-semibold ${l.status === 'overdue' ? 'text-red-600' : l.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                              {l.status === 'overdue' ? 'Vencido' : l.status === 'active' ? 'Activo' : 'Devuelto'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-red-600">
                            {l.mora_amount > 0 ? `$${l.mora_amount.toLocaleString('es-CO')}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {loansData.length > 20 && <p className="text-center text-xs text-gray-400 mt-2">Mostrando 20 de {loansData.length}. Exporta el PDF para ver todos.</p>}
                </div>
              </div>
            )}

            {/* LIBROS POPULARES */}
            {activeTab === 'popular' && (
              <div>
                <h2 className="text-xl font-bold text-[#1A3A5C] mb-6">Libros más solicitados</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={popularBooks.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="title" type="category" width={160} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="loans_count" fill="#E8A020" name="Préstamos" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">#</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Título</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Autor</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Categoría</th>
                        <th className="text-right py-2 px-3 font-semibold text-[#1A3A5C]">Préstamos</th>
                        <th className="text-right py-2 px-3 font-semibold text-[#1A3A5C]">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {popularBooks.map((b, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 font-bold text-[#1A3A5C]">{i + 1}</td>
                          <td className="py-2 px-3 text-gray-700">{b.title}</td>
                          <td className="py-2 px-3 text-gray-500">{b.author}</td>
                          <td className="py-2 px-3 text-gray-500">{b.category}</td>
                          <td className="py-2 px-3 text-right font-bold text-[#E8A020]">{b.loans_count}</td>
                          <td className="py-2 px-3 text-right text-gray-500">{b.stock_loan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MORA */}
            {activeTab === 'mora' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#1A3A5C]">Usuarios con mora activa</h2>
                  <span className="text-red-600 font-bold text-lg">
                    Total: ${moraUsers.reduce((s, u) => s + (u.mora_amount || 0), 0).toLocaleString('es-CO')}
                  </span>
                </div>
                {moraUsers.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No hay usuarios con mora 🎉</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Usuario</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Email</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Libro</th>
                        <th className="text-right py-2 px-3 font-semibold text-[#1A3A5C]">Venció el</th>
                        <th className="text-right py-2 px-3 font-semibold text-[#1A3A5C]">Días vencido</th>
                        <th className="text-right py-2 px-3 font-semibold text-[#1A3A5C]">Mora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moraUsers.map((u, i) => (
                        <tr key={i} className="border-b border-gray-100 bg-red-50 hover:bg-red-100">
                          <td className="py-2 px-3 font-medium text-[#1A3A5C]">{u.name}</td>
                          <td className="py-2 px-3 text-gray-500">{u.email}</td>
                          <td className="py-2 px-3 text-gray-700">{u.bookTitle}</td>
                          <td className="py-2 px-3 text-right text-red-600 font-semibold">{u.due_date}</td>
                          <td className="py-2 px-3 text-right text-red-600 font-bold">{u.daysOverdue} días</td>
                          <td className="py-2 px-3 text-right text-red-600 font-bold">${(u.mora_amount || 0).toLocaleString('es-CO')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* INVENTARIO */}
            {activeTab === 'inventory' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#1A3A5C]">Inventario actual</h2>
                  <span className="text-sm text-gray-500">{inventory.length} títulos registrados</span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Título</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Autor</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Categoría</th>
                      <th className="text-right py-2 px-3 font-semibold text-[#1A3A5C]">Stock préstamo</th>
                      <th className="text-right py-2 px-3 font-semibold text-[#1A3A5C]">Stock venta</th>
                      <th className="text-right py-2 px-3 font-semibold text-[#1A3A5C]">Precio venta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((b, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-700">{b.title}</td>
                        <td className="py-2 px-3 text-gray-500">{b.author}</td>
                        <td className="py-2 px-3 text-gray-500">{b.category}</td>
                        <td className={`py-2 px-3 text-right font-semibold ${b.stock_loan === 0 ? 'text-red-600' : 'text-green-600'}`}>{b.stock_loan}</td>
                        <td className="py-2 px-3 text-right text-[#E8A020] font-semibold">{b.stock_sale}</td>
                        <td className="py-2 px-3 text-right text-gray-600">{b.sale_price ? `$${Number(b.sale_price).toLocaleString('es-CO')}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* VENTAS */}
            {activeTab === 'revenue' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#1A3A5C]">Ingresos por ventas</h2>
                  <span className="text-green-600 font-bold text-lg">
                    Total: ${salesData.reduce((s, sale) => s + (sale.total_amount || 0), 0).toLocaleString('es-CO')}
                  </span>
                </div>
                {salesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString('es-CO')}`} />
                      <Line type="monotone" dataKey="ingresos" stroke="#388E3C" strokeWidth={2} name="Ingresos" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-gray-400 py-8">No hay ventas en este período</p>}
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Fecha</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Usuario</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Libro</th>
                        <th className="text-right py-2 px-3 font-semibold text-[#1A3A5C]">Cant.</th>
                        <th className="text-right py-2 px-3 font-semibold text-[#1A3A5C]">Total</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#1A3A5C]">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.slice(0, 20).map((s, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 text-gray-500">{s.sale_date}</td>
                          <td className="py-2 px-3 text-gray-700">{s.user?.name}</td>
                          <td className="py-2 px-3 text-gray-700">{s.book?.title}</td>
                          <td className="py-2 px-3 text-right text-gray-500">{s.quantity}</td>
                          <td className="py-2 px-3 text-right font-bold text-green-600">${s.total_amount?.toLocaleString('es-CO')}</td>
                          <td className="py-2 px-3">
                            <span className={`text-xs font-semibold ${s.status === 'delivered' ? 'text-green-600' : s.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {s.status === 'delivered' ? 'Entregado' : s.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {salesData.length > 20 && <p className="text-center text-xs text-gray-400 mt-2">Mostrando 20 de {salesData.length}. Exporta el PDF para ver todos.</p>}
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}