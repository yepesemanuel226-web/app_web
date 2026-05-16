import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import {
  exportLoansToPDF,
  exportPopularBooksToPDF,
  exportMoraUsersToPDF,
  exportInventoryToPDF,
  exportRevenueToPDF,
} from '../../../lib/pdfExport';

export function Reports() {
  const [activeTab, setActiveTab] = useState<'loans' | 'popular' | 'mora' | 'inventory' | 'revenue'>('loans');
  const [dateRange, setDateRange] = useState({ start: '2026-04-01', end: '2026-05-08' });

  const loansData = [
    { period: 'Semana 1', cantidad: 24 },
    { period: 'Semana 2', cantidad: 32 },
    { period: 'Semana 3', cantidad: 28 },
    { period: 'Semana 4', cantidad: 35 },
    { period: 'Semana 5', cantidad: 30 },
  ];

  const popularBooksData = [
    { title: 'El principito', solicitudes: 45 },
    { title: 'Cien años de soledad', solicitudes: 38 },
    { title: '1984', solicitudes: 32 },
    { title: 'Don Quijote', solicitudes: 28 },
    { title: 'Rayuela', solicitudes: 22 },
  ];

  const moraUsers = [
    { name: 'Carlos López', email: 'carlos@yahoo.com', moraAmount: 14000, daysOverdue: 7 },
    { name: 'Laura Ruiz', email: 'laura@outlook.com', moraAmount: 20000, daysOverdue: 10 },
    { name: 'Pedro Gómez', email: 'pedro@gmail.com', moraAmount: 6000, daysOverdue: 3 },
  ];

  const inventoryData = [
    { book: 'Cien años de soledad', loanStock: 5, saleStock: 8 },
    { book: '1984', loanStock: 3, saleStock: 0 },
    { book: 'El principito', loanStock: 7, saleStock: 12 },
    { book: 'Don Quijote', loanStock: 4, saleStock: 6 },
  ];

  const revenueData = [
    { month: 'Enero', ingresos: 125000 },
    { month: 'Febrero', ingresos: 180000 },
    { month: 'Marzo', ingresos: 225000 },
    { month: 'Abril', ingresos: 195000 },
    { month: 'Mayo', ingresos: 250000 },
  ];

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      toast.info('Función CSV en desarrollo');
      return;
    }

    // Exportar según la pestaña activa
    try {
      switch (activeTab) {
        case 'loans':
          exportLoansToPDF(loansData, dateRange);
          break;
        case 'popular':
          exportPopularBooksToPDF(popularBooksData);
          break;
        case 'mora':
          exportMoraUsersToPDF(moraUsers);
          break;
        case 'inventory':
          exportInventoryToPDF(inventoryData);
          break;
        case 'revenue':
          exportRevenueToPDF(revenueData, dateRange);
          break;
      }
      toast.success('¡Reporte descargado exitosamente!');
    } catch (error) {
      toast.error('Error al generar el PDF');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Reportes</h1>
          <p className="text-gray-600">Análisis y estadísticas del sistema</p>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="secondary" onClick={() => handleExport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
            />
            <span className="text-gray-600">hasta</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'loans', label: 'Préstamos por período' },
            { id: 'popular', label: 'Libros más solicitados' },
            { id: 'mora', label: 'Usuarios con mora' },
            { id: 'inventory', label: 'Inventario actual' },
            { id: 'revenue', label: 'Ingresos por ventas' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#E8A020] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        {activeTab === 'loans' && (
          <div>
            <h2 className="text-xl font-bold text-[#1A3A5C] mb-6">Préstamos por período</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loansData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#1A3A5C" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 font-semibold text-[#1A3A5C]">Período</th>
                    <th className="text-right py-2 px-4 font-semibold text-[#1A3A5C]">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {loansData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-4 text-gray-700">{item.period}</td>
                      <td className="py-2 px-4 text-right font-semibold text-[#1A3A5C]">{item.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'popular' && (
          <div>
            <h2 className="text-xl font-bold text-[#1A3A5C] mb-6">Libros más solicitados</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularBooksData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="title" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="solicitudes" fill="#E8A020" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 font-semibold text-[#1A3A5C]">Libro</th>
                    <th className="text-right py-2 px-4 font-semibold text-[#1A3A5C]">Solicitudes</th>
                  </tr>
                </thead>
                <tbody>
                  {popularBooksData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-4 text-gray-700">{item.title}</td>
                      <td className="py-2 px-4 text-right font-semibold text-[#E8A020]">{item.solicitudes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'mora' && (
          <div>
            <h2 className="text-xl font-bold text-[#1A3A5C] mb-6">Usuarios con mora activa</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Usuario</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Email</th>
                  <th className="text-right py-3 px-4 font-semibold text-[#1A3A5C]">Días vencido</th>
                  <th className="text-right py-3 px-4 font-semibold text-[#1A3A5C]">Monto mora</th>
                </tr>
              </thead>
              <tbody>
                {moraUsers.map((user, index) => (
                  <tr key={index} className="border-b border-gray-100 bg-red-50">
                    <td className="py-3 px-4 font-medium text-[#1A3A5C]">{user.name}</td>
                    <td className="py-3 px-4 text-gray-700">{user.email}</td>
                    <td className="py-3 px-4 text-right text-[#D32F2F] font-semibold">{user.daysOverdue}</td>
                    <td className="py-3 px-4 text-right text-[#D32F2F] font-bold">
                      ${user.moraAmount.toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            <h2 className="text-xl font-bold text-[#1A3A5C] mb-6">Inventario actual (préstamo vs. venta)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="book" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="loanStock" fill="#1A3A5C" name="Stock préstamo" />
                <Bar dataKey="saleStock" fill="#E8A020" name="Stock venta" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 font-semibold text-[#1A3A5C]">Libro</th>
                    <th className="text-right py-2 px-4 font-semibold text-[#1A3A5C]">Stock préstamo</th>
                    <th className="text-right py-2 px-4 font-semibold text-[#1A3A5C]">Stock venta</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-4 text-gray-700">{item.book}</td>
                      <td className="py-2 px-4 text-right font-semibold text-[#1A3A5C]">{item.loanStock}</td>
                      <td className="py-2 px-4 text-right font-semibold text-[#E8A020]">{item.saleStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div>
            <h2 className="text-xl font-bold text-[#1A3A5C] mb-6">Ingresos por ventas</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="ingresos" stroke="#388E3C" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 font-semibold text-[#1A3A5C]">Mes</th>
                    <th className="text-right py-2 px-4 font-semibold text-[#1A3A5C]">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-4 text-gray-700">{item.month}</td>
                      <td className="py-2 px-4 text-right font-bold text-[#388E3C]">
                        ${item.ingresos.toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
