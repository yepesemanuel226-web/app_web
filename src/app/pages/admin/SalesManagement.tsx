import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Search, Filter, TrendingUp } from 'lucide-react';

export function SalesManagement() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const sales = [
    { id: 1, date: '2026-05-08', userName: 'Ana Martínez', email: 'ana@gmail.com', bookTitle: 'Don Quijote', quantity: 1, unitPrice: 38000, total: 38000 },
    { id: 2, date: '2026-05-07', userName: 'María González', email: 'maria@gmail.com', bookTitle: 'El principito', quantity: 2, unitPrice: 25000, total: 50000 },
    { id: 3, date: '2026-05-07', userName: 'Laura Ruiz', email: 'laura@outlook.com', bookTitle: 'Cien años de soledad', quantity: 1, unitPrice: 45000, total: 45000 },
    { id: 4, date: '2026-05-06', userName: 'Pedro Gómez', email: 'pedro@gmail.com', bookTitle: 'La casa de los espíritus', quantity: 1, unitPrice: 42000, total: 42000 },
    { id: 5, date: '2026-05-06', userName: 'Carlos López', email: 'carlos@yahoo.com', bookTitle: 'El principito', quantity: 3, unitPrice: 25000, total: 75000 },
  ];

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = sales.length;
  const averageTicket = totalRevenue / totalTransactions;

  const bookInventory = [
    { bookTitle: 'Cien años de soledad', stock: 8, sold: 12 },
    { bookTitle: 'El principito', stock: 12, sold: 28 },
    { bookTitle: 'Don Quijote', stock: 6, sold: 9 },
    { bookTitle: 'La casa de los espíritus', stock: 5, sold: 7 },
  ];

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
            <TrendingUp className="w-5 h-5 text-[#388E3C]" />
          </div>
          <p className="text-3xl font-bold text-[#388E3C]">
            ${totalRevenue.toLocaleString('es-CO')}
          </p>
          <p className="text-xs text-gray-500 mt-1">Todos los tiempos</p>
        </Card>

        <Card>
          <p className="text-gray-600 text-sm mb-2">Total transacciones</p>
          <p className="text-3xl font-bold text-[#1A3A5C]">{totalTransactions}</p>
          <p className="text-xs text-gray-500 mt-1">Registradas en el sistema</p>
        </Card>

        <Card>
          <p className="text-gray-600 text-sm mb-2">Ticket promedio</p>
          <p className="text-3xl font-bold text-[#E8A020]">
            ${Math.round(averageTicket).toLocaleString('es-CO')}
          </p>
          <p className="text-xs text-gray-500 mt-1">Por transacción</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Historial de transacciones</h2>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por usuario o libro..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Fecha</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Usuario</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Libro</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Cantidad</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Precio unit.</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">{sale.date}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#1A3A5C]">{sale.userName}</p>
                    <p className="text-xs text-gray-500">{sale.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#1A3A5C]">{sale.bookTitle}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{sale.quantity}</td>
                  <td className="py-3 px-4 text-gray-700">
                    ${sale.unitPrice.toLocaleString('es-CO')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#388E3C]">
                      ${sale.total.toLocaleString('es-CO')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Inventario de venta</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Libro</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Stock actual</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Unidades vendidas</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Estado</th>
              </tr>
            </thead>
            <tbody>
              {bookInventory.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#1A3A5C]">{item.bookTitle}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${item.stock < 5 ? 'text-[#D32F2F]' : 'text-[#388E3C]'}`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{item.sold}</td>
                  <td className="py-3 px-4">
                    {item.stock < 5 ? (
                      <Badge variant="warning">Stock bajo</Badge>
                    ) : (
                      <Badge variant="success">Disponible</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
