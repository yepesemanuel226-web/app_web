import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Calendar, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

export function MyLoans() {
  const { user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [loanHistory, setLoanHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchLoans();
  }, [user]);

  const fetchLoans = async () => {
    const { data } = await supabase
      .from('loans')
      .select('*, book:books(title, author)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    const all = data || [];
    setActiveLoans(all.filter(l => l.status === 'active' || l.status === 'overdue'));
    setLoanHistory(all.filter(l => l.status === 'returned'));
    setLoading(false);
  };

  const loanTypeLabel = (type: string) => {
    if (type === 'express') return 'Express';
    if (type === 'weekly') return 'Semanal';
    return 'Mensual';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'overdue') return <Badge variant="danger">Vencido</Badge>;
    if (status === 'active') return <Badge variant="success">Activo</Badge>;
    return <Badge variant="neutral">Devuelto</Badge>;
  };

  const hasOverdue = activeLoans.some(l => l.status === 'overdue');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Mis préstamos</h1>
          <p className="text-gray-600">Administra tus préstamos activos y revisa tu historial</p>
        </div>
        <Button variant={showHistory ? 'secondary' : 'ghost'} onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? 'Ocultar historial' : 'Ver historial'}
        </Button>
      </div>

      {hasOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#D32F2F] mt-0.5" />
            <div>
              <h3 className="font-bold text-[#D32F2F] mb-1">¡Tienes préstamos vencidos!</h3>
              <p className="text-sm text-red-800">Por favor, devuelve los libros lo antes posible para evitar incremento en la mora.</p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Préstamos activos</h2>
        {loading ? (
          <p className="text-gray-500 text-sm">Cargando...</p>
        ) : activeLoans.length === 0 ? (
          <p className="text-gray-500 text-sm">No tienes préstamos activos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Libro</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Inicio</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Vencimiento</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Mora</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map((loan) => (
                  <tr key={loan.id} className={`border-b border-gray-100 ${loan.status === 'overdue' ? 'bg-red-50' : ''}`}>
                    <td className="py-3 px-4 font-medium text-[#1A3A5C]">{loan.book?.title}</td>
                    <td className="py-3 px-4 text-gray-700">{loanTypeLabel(loan.loan_type)}</td>
                    <td className="py-3 px-4 text-gray-700">{loan.start_date}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className={loan.status === 'overdue' ? 'text-[#D32F2F] font-semibold' : 'text-gray-700'}>
                          {loan.due_date}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(loan.status)}</td>
                    <td className="py-3 px-4">
                      {loan.mora_amount > 0 ? (
                        <span className="text-[#D32F2F] font-semibold">${loan.mora_amount.toLocaleString('es-CO')}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showHistory && (
        <Card>
          <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Historial de préstamos</h2>
          {loanHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">No tienes préstamos devueltos aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Libro</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Inicio</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Vencimiento</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Devolución</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Mora</th>
                  </tr>
                </thead>
                <tbody>
                  {loanHistory.map((loan) => (
                    <tr key={loan.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#1A3A5C]">{loan.book?.title}</td>
                      <td className="py-3 px-4 text-gray-700">{loanTypeLabel(loan.loan_type)}</td>
                      <td className="py-3 px-4 text-gray-700">{loan.start_date}</td>
                      <td className="py-3 px-4 text-gray-700">{loan.due_date}</td>
                      <td className="py-3 px-4 text-gray-700">{loan.return_date || '-'}</td>
                      <td className="py-3 px-4">
                        {loan.mora_amount > 0 ? (
                          <span className="text-[#E8A020] font-semibold">${loan.mora_amount.toLocaleString('es-CO')}</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
