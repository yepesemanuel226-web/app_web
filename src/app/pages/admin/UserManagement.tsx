import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Eye, Ban } from 'lucide-react';
import { toast } from 'sonner';

export function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const users = [
    { id: 1, name: 'María González', email: 'maria@gmail.com', registrationDate: '2025-01-15', activeLoans: 2, moraStatus: false, moraAmount: 0 },
    { id: 2, name: 'Juan Pérez', email: 'juan@hotmail.com', registrationDate: '2025-02-20', activeLoans: 1, moraStatus: false, moraAmount: 0 },
    { id: 3, name: 'Carlos López', email: 'carlos@yahoo.com', registrationDate: '2024-11-10', activeLoans: 1, moraStatus: true, moraAmount: 14000 },
    { id: 4, name: 'Ana Martínez', email: 'ana@gmail.com', registrationDate: '2025-03-05', activeLoans: 0, moraStatus: false, moraAmount: 0 },
    { id: 5, name: 'Laura Ruiz', email: 'laura@outlook.com', registrationDate: '2024-12-01', activeLoans: 2, moraStatus: true, moraAmount: 20000 },
    { id: 6, name: 'Pedro Gómez', email: 'pedro@gmail.com', registrationDate: '2025-04-12', activeLoans: 1, moraStatus: false, moraAmount: 0 },
  ];

  const handleBlockUser = (userId: number, userName: string) => {
    toast.success(`Usuario ${userName} bloqueado`);
  };

  const userDetail = users.find(u => u.id === selectedUser);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Gestión de usuarios</h1>
        <p className="text-gray-600">Administra los usuarios registrados en el sistema</p>
      </div>

      <Card>
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
            />
          </div>
          <Button>Buscar</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Registro</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Préstamos activos</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Estado mora</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${user.moraStatus ? 'bg-red-50' : ''}`}
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#1A3A5C]">{user.name}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{user.email}</td>
                  <td className="py-3 px-4 text-gray-700">{user.registrationDate}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#1A3A5C]">{user.activeLoans}</span>
                  </td>
                  <td className="py-3 px-4">
                    {user.moraStatus ? (
                      <div>
                        <Badge variant="danger">Mora activa</Badge>
                        <p className="text-xs text-[#D32F2F] font-semibold mt-1">
                          ${user.moraAmount.toLocaleString('es-CO')}
                        </p>
                      </div>
                    ) : (
                      <Badge variant="success">Sin mora</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBlockUser(user.id, user.name)}
                        className="text-[#D32F2F] hover:bg-red-50"
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedUser && userDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-[#1A3A5C] mb-6">Detalle del usuario</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nombre completo</p>
                <p className="font-semibold text-[#1A3A5C]">{userDetail.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Correo electrónico</p>
                <p className="font-semibold text-[#1A3A5C]">{userDetail.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Fecha de registro</p>
                <p className="font-semibold text-[#1A3A5C]">{userDetail.registrationDate}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Préstamos activos</p>
                <p className="font-semibold text-[#1A3A5C]">{userDetail.activeLoans}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-2">Estado de mora</p>
                {userDetail.moraStatus ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <Badge variant="danger" className="mb-2">Mora activa</Badge>
                    <p className="text-2xl font-bold text-[#D32F2F]">
                      ${userDetail.moraAmount.toLocaleString('es-CO')}
                    </p>
                  </div>
                ) : (
                  <Badge variant="success">Sin mora</Badge>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setSelectedUser(null)}>
                Cerrar
              </Button>
              <Button variant="danger" onClick={() => { handleBlockUser(userDetail.id, userDetail.name); setSelectedUser(null); }}>
                Bloquear usuario
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
