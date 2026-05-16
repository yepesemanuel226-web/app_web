import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Key, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

export function UserProfile() {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loanStats, setLoanStats] = useState({ total: 0, active: 0, overdue: 0, returned: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    const { data } = await supabase
      .from('loans')
      .select('status')
      .eq('user_id', user!.id);

    const all = data || [];
    setLoanStats({
      total: all.length,
      active: all.filter(l => l.status === 'active').length,
      overdue: all.filter(l => l.status === 'overdue').length,
      returned: all.filter(l => l.status === 'returned').length,
    });
    setLoadingStats(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error('Error al actualizar contraseña: ' + error.message);
      return;
    }

    toast.success('Contraseña actualizada exitosamente');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Mi perfil</h1>
        <p className="text-gray-600">Administra tu información personal y configuración</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="bg-gradient-to-br from-[#1A3A5C] to-[#0D5C63] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#1A3A5C] mb-1">{user?.name}</h2>
            <p className="text-sm text-gray-600">{user?.email}</p>
            <p className="text-xs text-gray-500 mt-2 capitalize">Rol: {user?.role}</p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Información personal</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-2" />Nombre completo
              </label>
              <input type="text" value={user?.name || ''} disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-2" />Correo electrónico
              </label>
              <input type="email" value={user?.email || ''} disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">
          <BookOpen className="w-5 h-5 inline mr-2" />Resumen de préstamos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-[#1A3A5C] mb-1">{loadingStats ? '...' : loanStats.total}</p>
            <p className="text-sm text-gray-600">Total histórico</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-[#1A3A5C] mb-1">{loadingStats ? '...' : loanStats.active}</p>
            <p className="text-sm text-gray-600">Activos</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-[#D32F2F] mb-1">{loadingStats ? '...' : loanStats.overdue}</p>
            <p className="text-sm text-gray-600">Vencidos</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-[#388E3C] mb-1">{loadingStats ? '...' : loanStats.returned}</p>
            <p className="text-sm text-gray-600">Devueltos</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">
          <Key className="w-5 h-5 inline mr-2" />Cambiar contraseña
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <Input type="password" label="Nueva contraseña" placeholder="••••••••"
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Input type="password" label="Confirmar nueva contraseña" placeholder="••••••••"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <Button type="submit">Actualizar contraseña</Button>
        </form>
      </Card>
    </div>
  );
}