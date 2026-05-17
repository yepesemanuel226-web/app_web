import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Home, Search, Bell, User, LogOut, ShoppingCart, Bookmark, Menu, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchUnreadCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setUnreadCount(count || 0);
  };

  useEffect(() => {
    fetchUnreadCount();
    setMenuOpen(false); // cerrar menú al cambiar de ruta
  }, [location.pathname, user]);

  useEffect(() => {
    if (!user) return;
    const subscription = supabase
      .channel('notifications_layout')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => fetchUnreadCount())
      .subscribe();
    return () => { subscription.unsubscribe(); };
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

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
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/user" className="flex items-center gap-3">
              <div className="bg-[#1A3A5C] p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-[#1A3A5C] leading-tight">SGB</h1>
                <p className="text-xs text-gray-500 leading-tight">Sistema de Gestión Bibliotecaria</p>
              </div>
              <h1 className="sm:hidden text-xl font-bold text-[#1A3A5C]">SGB</h1>
            </Link>

            {/* Nav desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    isActive(item.path) ? 'bg-[#E8A020] text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#D32F2F] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              ))}
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:text-[#D32F2F] hover:bg-red-50 transition-colors text-sm font-medium ml-2">
                <LogOut className="w-4 h-4" />Salir
              </button>
            </div>

            {/* Botón hamburguesa móvil */}
            <div className="flex items-center gap-3 md:hidden">
              {/* Badge notificaciones visible en móvil */}
              <Link to="/user/notifications" className="relative">
                <Bell className="w-6 h-6 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D32F2F] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {/* Info usuario */}
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-[#1A3A5C] rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#1A3A5C] truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>

              {navItems.map((item) => (
                <Link key={item.path} to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                    isActive(item.path) ? 'bg-[#E8A020] text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-[#D32F2F] text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              ))}

              <div className="border-t border-gray-200 pt-2 mt-2">
                <button onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[#D32F2F] hover:bg-red-50 transition-colors font-medium">
                  <LogOut className="w-5 h-5" />Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}