import React from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { BookOpen, AlertTriangle, ShoppingCart, Users, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const kpis = [
    { label: 'Préstamos activos', value: 127, icon: BookOpen, color: 'bg-[#1A3A5C]', change: '+12%' },
    { label: 'Préstamos vencidos hoy', value: 8, icon: AlertTriangle, color: 'bg-[#D32F2F]', change: '-5%' },
    { label: 'Libros en catálogo', value: 1432, icon: BookOpen, color: 'bg-[#0D5C63]', change: '+3%' },
    { label: 'Ventas este mes', value: 42, icon: ShoppingCart, color: 'bg-[#E8A020]', change: '+18%' },
    { label: 'Reservas pendientes', value: 23, icon: Clock, color: 'bg-[#388E3C]', change: '+8%' },
    { label: 'Usuarios activos', value: 456, icon: Users, color: 'bg-[#1A3A5C]', change: '+15%' },
  ];

  const recentActivity = [
    { id: 1, type: 'loan', user: 'María González', action: 'solicitó préstamo de', item: 'Cien años de soledad', time: 'Hace 5 min' },
    { id: 2, type: 'return', user: 'Juan Pérez', action: 'devolvió', item: 'Don Quijote', time: 'Hace 12 min' },
    { id: 3, type: 'purchase', user: 'Ana Martínez', action: 'compró', item: 'El principito', time: 'Hace 25 min' },
    { id: 4, type: 'overdue', user: 'Carlos López', action: 'tiene mora en', item: '1984', time: 'Hace 1 hora' },
    { id: 5, type: 'reservation', user: 'Laura Ruiz', action: 'reservó', item: 'Rayuela', time: 'Hace 2 horas' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Panel de administración</h1>
        <p className="text-gray-600">Resumen general del sistema bibliotecario</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`${kpi.color} p-3 rounded-lg`}>
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-[#388E3C]" />
                <span className="text-[#388E3C] font-medium">{kpi.change}</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">{kpi.label}</p>
            <p className="text-3xl font-bold text-[#1A3A5C]">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Acciones rápidas</h2>
            <div className="space-y-2">
              <Link to="/admin/loans" className="block">
                <Button variant="secondary" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Registrar devolución
                </Button>
              </Link>
              <Link to="/admin/catalog" className="block">
                <Button variant="secondary" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Agregar libro
                </Button>
              </Link>
              <Link to="/admin/reports" className="block">
                <Button variant="secondary" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Ver reportes
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Actividad reciente</h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 bg-[#E8A020] rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-700">
                    <span className="font-semibold text-[#1A3A5C]">{activity.user}</span>
                    {' '}{activity.action}{' '}
                    <span className="font-medium">"{activity.item}"</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
