import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Home, Search, Bell, User, LogOut, ShoppingCart, Bookmark } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setUnreadCount(count || 0);
  };

  // Se actualiza cada vez que cambia la ruta (cuando el usuario vuelve de Notificaciones)
  useEffect(() => {
    fetchUnreadCount();
  }, [location.pathname, user]);

  // Suscripción en tiempo real
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('notifications_layout')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => fetchUnreadCount())
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/user', icon: Home, label: 'Inicio' },
    { path: '/user/catalog', icon: Search, label: 'Catálogo' },
    { path: '/user/loans', icon: BookOpen, label: 'Mis préstamos' },
    { path: '/user/reservations', icon: Bookmark, label: 'Reservas' },
    { path: '/user/purchases', icon: ShoppingCart, label: 'Mis compras' },
    { path: '/user/notifications', icon: Bell, label: 'Notificaciones', badge: unreadCount },
    { path: '/user/profile', icon: User, label: 'Mi perfil' },
  ];

  const isActive = (path: string) => {
    if (path === '/user') return location.pathname === '/user';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-[#1A3A5C] p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1A3A5C]">SGB</h1>
                <p className="text-xs text-gray-600">Sistema de Gestión Bibliotecaria</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-[#E8A020] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#D32F2F] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-700 hover:text-[#D32F2F] transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Salir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navbar móvil */}
        <div className="md:hidden border-t border-gray-200 px-4 py-2 overflow-x-auto">
          <div className="flex gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  isActive(item.path)
                    ? 'bg-[#E8A020] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D32F2F] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}