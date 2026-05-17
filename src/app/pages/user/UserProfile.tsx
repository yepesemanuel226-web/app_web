import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Key, BookOpen, Phone, MapPin, Edit2, Save, X, Home } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

export function UserProfile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loanStats, setLoanStats] = useState({ total: 0, active: 0, overdue: 0, returned: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profile, setProfile] = useState({ name: '', phone: '', city: '', address: '' });
  const [editProfile, setEditProfile] = useState({ name: '', phone: '', city: '', address: '' });
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchProfile();
    fetchStats();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('users')
      .select('name, phone, city, address, last_login')
      .eq('id', user!.id)
      .single();

    const p = {
      name: data?.name || user!.name || '',
      phone: data?.phone || '',
      city: data?.city || '',
      address: data?.address || '',
    };
    setProfile(p);
    setEditProfile(p);
    setLastLogin(data?.last_login || null);
  };

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

  const handleSaveProfile = async () => {
    if (!editProfile.name.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }
    setSavingProfile(true);

    const { error } = await supabase
      .from('users')
      .update({
        name: editProfile.name,
        phone: editProfile.phone,
        city: editProfile.city,
        address: editProfile.address,
      })
      .eq('id', user!.id);

    if (error) {
      toast.error('Error al guardar: ' + error.message);
      setSavingProfile(false);
      return;
    }

    setProfile(editProfile);
    setEditing(false);
    toast.success('Perfil actualizado exitosamente');
    setSavingProfile(false);
  };

  const handleCancelEdit = () => {
    setEditProfile(profile);
    setEditing(false);
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

  const inputClass = (active: boolean) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
      active
        ? 'border-[#E8A020] focus:ring-2 focus:ring-[#E8A020]'
        : 'border-gray-300 bg-gray-50 text-gray-600'
    }`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Mi perfil</h1>
        <p className="text-gray-600">Administra tu información personal y configuración</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar */}
        <Card className="lg:col-span-1 text-center">
          <div className="bg-gradient-to-br from-[#1A3A5C] to-[#0D5C63] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#1A3A5C] mb-1">{profile.name || user?.name}</h2>
          <p className="text-sm text-gray-600 mb-2">{user?.email}</p>
          {profile.city && <p className="text-xs text-gray-500">📍 {profile.city}</p>}
          {profile.phone && <p className="text-xs text-gray-500">📞 {profile.phone}</p>}
          <p className="text-xs text-gray-400 mt-3 bg-gray-100 rounded-full px-3 py-1 inline-block capitalize">
            {user?.role === 'admin' ? '👤 Administrador' : '👤 Usuario'}
          </p>
          {lastLogin && (
            <p className="text-xs text-gray-400 mt-2">
              Último acceso: {new Date(lastLogin).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </Card>

        {/* Información personal */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1A3A5C]">Información personal</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-2 text-sm text-[#1A3A5C] hover:text-[#E8A020] transition-colors border border-gray-300 hover:border-[#E8A020] px-3 py-1.5 rounded-lg">
                <Edit2 className="w-4 h-4" />Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancelEdit}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-lg">
                  <X className="w-4 h-4" />Cancelar
                </button>
                <button onClick={handleSaveProfile} disabled={savingProfile}
                  className="flex items-center gap-2 text-sm text-white bg-[#E8A020] hover:bg-[#d4911c] px-3 py-1.5 rounded-lg disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {savingProfile ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-2" />Nombre completo
              </label>
              <input type="text" disabled={!editing} value={editing ? editProfile.name : profile.name}
                onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                className={inputClass(editing)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-2" />Correo electrónico
              </label>
              <input type="email" value={user?.email || ''} disabled
                className={inputClass(false)} />
              <p className="text-xs text-gray-400 mt-1">El correo no se puede modificar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-2" />Teléfono
                </label>
                <input type="tel" disabled={!editing} placeholder="300 123 4567"
                  value={editing ? editProfile.phone : (profile.phone || 'Sin registrar')}
                  onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                  className={inputClass(editing)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-2" />Ciudad
                </label>
                <input type="text" disabled={!editing} placeholder="Bogotá"
                  value={editing ? editProfile.city : (profile.city || 'Sin registrar')}
                  onChange={(e) => setEditProfile({ ...editProfile, city: e.target.value })}
                  className={inputClass(editing)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Home className="w-4 h-4 inline mr-2" />Dirección
              </label>
              <input type="text" disabled={!editing} placeholder="Calle 123 # 45-67, Barrio Centro"
                value={editing ? editProfile.address : (profile.address || 'Sin registrar')}
                onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
                className={inputClass(editing)} />
            </div>
          </div>
        </Card>
      </div>

      {/* Resumen préstamos */}
      <Card>
        <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">
          <BookOpen className="w-5 h-5 inline mr-2" />Resumen de préstamos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total histórico', value: loanStats.total, color: 'bg-gray-50', textColor: 'text-[#1A3A5C]' },
            { label: 'Activos', value: loanStats.active, color: 'bg-blue-50', textColor: 'text-[#1A3A5C]' },
            { label: 'Vencidos', value: loanStats.overdue, color: 'bg-red-50', textColor: 'text-[#D32F2F]' },
            { label: 'Devueltos', value: loanStats.returned, color: 'bg-green-50', textColor: 'text-[#388E3C]' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-lg p-4 text-center`}>
              <p className={`text-3xl font-bold mb-1 ${stat.textColor}`}>{loadingStats ? '...' : stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Cambiar contraseña */}
      <Card>
        <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">
          <Key className="w-5 h-5 inline mr-2" />Cambiar contraseña
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
            <input type="password" placeholder="••••••••" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
            <input type="password" placeholder="••••••••" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]" />
          </div>
          <button type="submit"
            className="bg-[#1A3A5C] text-white px-6 py-2 rounded-lg hover:bg-[#2a4a6c] transition-colors">
            Actualizar contraseña
          </button>
        </form>
      </Card>
    </div>
  );
}
