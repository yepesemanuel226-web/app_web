import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export function LoansManagement() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const loans = [
    { id: 1, userName: 'María González', email: 'maria@gmail.com', bookTitle: 'Cien años de soledad', loanType: 'Semanal', dueDate: '2026-05-15', status: 'active', overdue: false, moraAmount: 0 },
    { id: 2, userName: 'Juan Pérez', email: 'juan@hotmail.com', bookTitle: 'Don Quijote', loanType: 'Mensual', dueDate: '2026-05-20', status: 'active', overdue: false, moraAmount: 0 },
    { id: 3, userName: 'Carlos López', email: 'carlos@yahoo.com', bookTitle: '1984', loanType: 'Semanal', dueDate: '2026-05-01', status: 'overdue', overdue: true, moraAmount: 14000 },
    { id: 4, userName: 'Ana Martínez', email: 'ana@gmail.com', bookTitle: 'El principito', loanType: 'Express', dueDate: '2026-05-10', status: 'active', overdue: false, moraAmount: 0 },
    { id: 5, userName: 'Laura Ruiz', email: 'laura@outlook.com', bookTitle: 'Rayuela', loanType: 'Semanal', dueDate: '2026-04-28', status: 'overdue', overdue: true, moraAmount: 20000 },
  ];

  const [showReturnModal, setShowReturnModal] = useState<number | null>(null);

  const handleReturn = (loanId: number) => {
    setShowReturnModal(loanId);
  };

  const confirmReturn = () => {
    toast.success('Devolución registrada exitosamente');
    setShowReturnModal(null);
  };

  const getStatusBadge = (status: string, overdue: boolean) => {
    if (status === 'overdue') return <Badge variant="danger">Vencido</Badge>;
    return <Badge variant="success">Activo</Badge>;
  };

  const selectedLoan = loans.find(l => l.id === showReturnModal);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Gestión de préstamos</h1>
        <p className="text-gray-600">Administra todos los préstamos activos del sistema</p>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por usuario, libro o email..."
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
              <option value="all">Todos los préstamos</option>
              <option value="active">Solo activos</option>
              <option value="overdue">Solo vencidos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Usuario</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Libro</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Vencimiento</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Mora</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr
                  key={loan.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${loan.overdue ? 'bg-red-50' : ''}`}
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#1A3A5C]">{loan.userName}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm">{loan.email}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#1A3A5C]">{loan.bookTitle}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{loan.loanType}</td>
                  <td className="py-3 px-4">
                    <span className={loan.overdue ? 'text-[#D32F2F] font-semibold' : 'text-gray-700'}>
                      {loan.dueDate}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(loan.status, loan.overdue)}
                  </td>
                  <td className="py-3 px-4">
                    {loan.moraAmount > 0 ? (
                      <span className="text-[#D32F2F] font-semibold">
                        ${loan.moraAmount.toLocaleString('es-CO')}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Button size="sm" onClick={() => handleReturn(loan.id)}>
                      Registrar devolución
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showReturnModal && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#1A3A5C] mb-6">Registrar devolución</h2>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Usuario</p>
                <p className="font-semibold text-[#1A3A5C]">{selectedLoan.userName}</p>
                <p className="text-sm text-gray-600">{selectedLoan.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Libro</p>
                <p className="font-semibold text-[#1A3A5C]">{selectedLoan.bookTitle}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Fecha de vencimiento</p>
                <p className={`font-semibold ${selectedLoan.overdue ? 'text-[#D32F2F]' : 'text-[#1A3A5C]'}`}>
                  {selectedLoan.dueDate}
                </p>
              </div>

              {selectedLoan.moraAmount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2">Mora acumulada</p>
                  <p className="text-3xl font-bold text-[#D32F2F]">
                    ${selectedLoan.moraAmount.toLocaleString('es-CO')}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Esta mora debe ser cobrada al usuario
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowReturnModal(null)}>
                Cancelar
              </Button>
              <Button onClick={confirmReturn} className="flex-1">
                Confirmar devolución
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
