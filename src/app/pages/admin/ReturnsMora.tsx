import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Search, Settings, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export function ReturnsMora() {
  const [searchQuery, setSearchQuery] = useState('');
  const [moraTariff, setMoraTariff] = useState(2000);
  const [editingTariff, setEditingTariff] = useState(false);

  const userLoans = [
    { id: 1, bookTitle: '1984', dueDate: '2026-05-01', daysOverdue: 7, moraAmount: 14000 },
    { id: 2, bookTitle: 'El amor en los tiempos del cólera', dueDate: '2026-05-05', daysOverdue: 3, moraAmount: 6000 },
  ];

  const handleSearch = () => {
    toast.info(`Buscando usuario: ${searchQuery}`);
  };

  const handleReturn = (loanId: number) => {
    toast.success('Devolución procesada exitosamente');
  };

  const handleSaveTariff = () => {
    toast.success('Tarifa de mora actualizada');
    setEditingTariff(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Devoluciones y moras</h1>
        <p className="text-gray-600">Procesa devoluciones y gestiona las tarifas de mora</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Procesar devolución</h2>

          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por email o ID de usuario..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch}>Buscar</Button>
          </div>

          {searchQuery && (
            <div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-[#1A3A5C] mb-2">Usuario encontrado</h3>
                <p className="text-gray-700">Carlos López</p>
                <p className="text-sm text-gray-600">carlos@yahoo.com</p>
              </div>

              <h3 className="font-bold text-[#1A3A5C] mb-3">Préstamos activos</h3>

              <div className="space-y-3">
                {userLoans.map((loan) => (
                  <div key={loan.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#1A3A5C] mb-1">{loan.bookTitle}</h4>
                        <p className="text-sm text-gray-600">Venció: {loan.dueDate}</p>
                        <Badge variant="danger" className="mt-2">
                          {loan.daysOverdue} días de retraso
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Mora</p>
                        <p className="text-2xl font-bold text-[#D32F2F]">
                          ${loan.moraAmount.toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>

                    <Button size="sm" onClick={() => handleReturn(loan.id)} className="w-full">
                      Marcar como devuelto y cobrar mora
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">
            <Settings className="w-5 h-5 inline mr-2" />
            Configuración de mora
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Tarifa actual</p>
              <div className="bg-[#FFF9EC] border border-[#E8A020] rounded-lg p-4 mb-3">
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className="w-6 h-6 text-[#E8A020]" />
                  <span className="text-3xl font-bold text-[#E8A020]">
                    ${moraTariff.toLocaleString('es-CO')}
                  </span>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">por día de retraso</p>
              </div>

              {editingTariff ? (
                <div className="space-y-3">
                  <Input
                    type="number"
                    label="Nueva tarifa (por día)"
                    value={moraTariff}
                    onChange={(e) => setMoraTariff(Number(e.target.value))}
                  />
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingTariff(false)}>
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSaveTariff} className="flex-1">
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="secondary" size="sm" className="w-full" onClick={() => setEditingTariff(true)}>
                  Modificar tarifa
                </Button>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-[#1A3A5C] mb-2">Ejemplos de cálculo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">1 día:</span>
                  <span className="font-medium">${(moraTariff * 1).toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">7 días:</span>
                  <span className="font-medium">${(moraTariff * 7).toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">30 días:</span>
                  <span className="font-medium">${(moraTariff * 30).toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
