import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Home, Search, Clock, Bell, User, LogOut, ShoppingCart, Bookmark } from 'lucide-react';

export function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    { path: '/user/notifications', icon: Bell, label: 'Notificaciones' },
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
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-[#E8A020] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
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

        <div className="md:hidden border-t border-gray-200 px-4 py-2 overflow-x-auto">
          <div className="flex gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  isActive(item.path)
                    ? 'bg-[#E8A020] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
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