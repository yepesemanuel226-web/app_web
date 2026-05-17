import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SupabaseBanner } from '../components/SupabaseBanner';
import {
  BookOpen,
  LayoutDashboard,
  Library,
  FileText,
  RotateCcw,
  Users,
  ShoppingCart,
  BarChart3,
  UserCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/catalog', icon: Library, label: 'Gestión de catálogo' },
    { path: '/admin/loans', icon: BookOpen, label: 'Gestión de préstamos' },
    { path: '/admin/returns', icon: RotateCcw, label: 'Devoluciones y mora' },
    { path: '/admin/reservations', icon: FileText, label: 'Cola de reservas' },
    { path: '/admin/sales', icon: ShoppingCart, label: 'Ventas' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reportes' },
    { path: '/admin/users', icon: Users, label: 'Gestión de usuarios' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">

      {/* Sidebar fijo desktop (lg+) - se mantiene igual */}
      <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-50 w-64 bg-[#1A3A5C]">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-[#2a4a6c]">
            <div className="flex items-center gap-3">
              <div className="bg-[#E8A020] p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SGB Admin</h1>
                <p className="text-xs text-blue-200">Panel de administración</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#E8A020] text-white'
                      : 'text-blue-100 hover:bg-[#2a4a6c]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-[#2a4a6c]">
            <div className="bg-[#2a4a6c] rounded-lg p-3 mb-3">
              <div className="flex items-center gap-3">
                <UserCircle className="w-10 h-10 text-blue-200" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-blue-200 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-blue-100 hover:bg-[#2a4a6c] rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Menú móvil desplegable desde arriba - derecha (igual que usuario) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {sidebarOpen && (
        <div className="fixed top-16 right-0 w-72 bg-white z-50 shadow-lg rounded-bl-2xl lg:hidden">
          <div className="px-4 py-3 space-y-1">
            {/* Info usuario */}
            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-[#1A3A5C] rounded-full flex items-center justify-center flex-shrink-0">
                <UserCircle className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#1A3A5C] truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                  isActive(item.path) ? 'bg-[#E8A020] text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}

            <div className="border-t border-gray-200 pt-2 mt-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[#D32F2F] hover:bg-red-50 transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="text-sm text-gray-600 hidden lg:block">
                Bienvenido, <span className="font-semibold text-[#1A3A5C]">{user?.name}</span>
              </div>

              {/* Botón hamburguesa móvil - derecha */}
              <div className="flex-1 lg:hidden" />
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <SupabaseBanner />
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}