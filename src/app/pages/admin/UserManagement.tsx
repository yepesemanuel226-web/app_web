import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Search, Eye, Ban, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userDetail, setUserDetail] = useState<any>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('registration_date', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const fetchUserDetail = async (user: any) => {
    const [loans, reservations, sales] = await Promise.all([
      supabase.from('loans').select('*, book:books(title)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('reservations').select('*, book:books(title)').eq('user_id', user.id).in('status', ['waiting', 'available']),
      supabase.from('sales').select('*, book:books(title)').eq('user_id', user.id).order('sale_date', { ascending: false }).limit(5),
    ]);

    setUserDetail({
      loans: loans.data || [],
      reservations: reservations.data || [],
      sales: sales.data || [],
    });
    setSelectedUser(user);
  };

  const handleToggleBlock = async (user: any) => {
    const newVal = !user.is_blocked;
    await supabase.from('users').update({ is_blocked: newVal }).eq('id', user.id);
    toast.success(`Usuario ${newVal ? 'bloqueado' : 'desbloqueado'} exitosamente`);
    fetchUsers();
    if (selectedUser?.id === user.id) setSelectedUser({ ...selectedUser, is_blocked: newVal });
  };

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Gestión de usuarios</h1>
        <p className="text-gray-600">Administra los usuarios registrados en el sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Buscar por nombre o email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? <p className="text-gray-500">Cargando...</p> : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filtered.map(user => (
                <div key={user.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'border-[#E8A020] bg-yellow-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => fetchUserDetail(user)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#1A3A5C]">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === 'admin' ? 'info' : 'neutral'}>{user.role}</Badge>
                      {user.is_blocked && <Badge variant="danger">Bloqueado</Badge>}
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p className="text-center text-gray-500 py-4">No se encontraron usuarios</p>}
            </div>
          )}
        </Card>

        {selectedUser ? (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1A3A5C]">Detalle del usuario</h2>
              <button onClick={() => setSelectedUser(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-bold text-[#1A3A5C] text-lg">{selectedUser.name}</p>
                <p className="text-gray-600 text-sm">{selectedUser.email}</p>
                {selectedUser.phone && <p className="text-gray-500 text-xs">📞 {selectedUser.phone}</p>}
                {selectedUser.city && <p className="text-gray-500 text-xs">📍 {selectedUser.city}</p>}
                <p className="text-gray-400 text-xs mt-1">
                  Registrado: {selectedUser.registration_date ? new Date(selectedUser.registration_date).toLocaleDateString('es-CO') : '—'}
                </p>
                {selectedUser.last_login && (
                  <p className="text-gray-400 text-xs">Último acceso: {new Date(selectedUser.last_login).toLocaleDateString('es-CO')}</p>
                )}
              </div>

              <button onClick={() => handleToggleBlock(selectedUser)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white text-sm font-medium ${selectedUser.is_blocked ? 'bg-[#388E3C] hover:bg-green-700' : 'bg-[#D32F2F] hover:bg-red-700'}`}>
                {selectedUser.is_blocked ? <><CheckCircle className="w-4 h-4" />Desbloquear usuario</> : <><Ban className="w-4 h-4" />Bloquear usuario</>}
              </button>
            </div>

            {userDetail && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[#1A3A5C] mb-2">Préstamos recientes ({userDetail.loans.length})</h3>
                  {userDetail.loans.length === 0 ? <p className="text-gray-400 text-sm">Sin préstamos</p> : (
                    <div className="space-y-1">
                      {userDetail.loans.map((l: any) => (
                        <div key={l.id} className="flex justify-between text-sm py-1 border-b border-gray-100">
                          <span className="text-gray-700 truncate">{l.book?.title}</span>
                          <Badge variant={l.status === 'overdue' ? 'danger' : l.status === 'active' ? 'success' : 'neutral'} className="ml-2 flex-shrink-0">
                            {l.status === 'overdue' ? 'Vencido' : l.status === 'active' ? 'Activo' : 'Devuelto'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A3A5C] mb-2">Reservas activas ({userDetail.reservations.length})</h3>
                  {userDetail.reservations.length === 0 ? <p className="text-gray-400 text-sm">Sin reservas</p> : (
                    <div className="space-y-1">
                      {userDetail.reservations.map((r: any) => (
                        <div key={r.id} className="flex justify-between text-sm py-1 border-b border-gray-100">
                          <span className="text-gray-700 truncate">{r.book?.title}</span>
                          <Badge variant={r.status === 'available' ? 'success' : 'warning'}>
                            {r.status === 'available' ? 'Disponible' : 'En espera'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A3A5C] mb-2">Compras recientes ({userDetail.sales.length})</h3>
                  {userDetail.sales.length === 0 ? <p className="text-gray-400 text-sm">Sin compras</p> : (
                    <div className="space-y-1">
                      {userDetail.sales.map((s: any) => (
                        <div key={s.id} className="flex justify-between text-sm py-1 border-b border-gray-100">
                          <span className="text-gray-700 truncate">{s.book?.title}</span>
                          <span className="text-[#388E3C] font-semibold ml-2">${s.total_amount?.toLocaleString('es-CO')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="flex items-center justify-center">
            <div className="text-center text-gray-400 py-12">
              <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Selecciona un usuario para ver su detalle</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
