import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { BookOpen, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);

      // Determinar redirección basada en dominio
      const isAdmin = email.endsWith('@edu.co') ||
                      email.endsWith('@edu.co.com') ||
                      email.match(/@.*\.edu\./);

      setTimeout(() => toast.success('¡Bienvenido al SGB!'), 150);
      navigate(isAdmin ? '/admin' : '/user');
    } catch (error) {
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register(registerData.name, registerData.email, registerData.password);
      toast.success('¡Cuenta creada exitosamente! Ya puedes iniciar sesión');
      setShowRegisterModal(false);
      setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
      setEmail(registerData.email);
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const useExampleCredentials = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setEmail('admin@edu.co');
      setPassword('admin123');
    } else {
      setEmail('usuario@gmail.com');
      setPassword('usuario123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A3A5C] to-[#0D5C63] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          {/* 🖼️ LOGO DEL SISTEMA - AQUÍ VA LA IMAGEN */}
          {/* TODO: Reemplazar con logo real */}
          {/* Ejemplo: <img src="/logo-sgb.png" alt="SGB Logo" className="w-16 h-16" /> */}
          <div className="bg-[#E8A020] p-3 rounded-full">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          {/* FIN LOGO 🖼️ */}
        </div>

        <h1 className="text-3xl font-bold text-center text-[#1A3A5C] mb-2">
          Sistema de Gestión Bibliotecaria
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Ingresa tus credenciales para continuar
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Correo electrónico"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-[#1A3A5C] hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">¿No tienes una cuenta?</p>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setShowRegisterModal(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Crear cuenta nueva
          </Button>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-[#1A3A5C] mb-3 text-center">
            Credenciales de prueba
          </p>

          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border border-blue-300">
              <p className="text-xs font-semibold text-[#1A3A5C] mb-2">👤 Usuario (Lector)</p>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Email:</span>
                <code className="bg-gray-100 px-2 py-1 rounded">usuario@gmail.com</code>
              </div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-600">Contraseña:</span>
                <code className="bg-gray-100 px-2 py-1 rounded">usuario123</code>
              </div>
              <button
                onClick={() => useExampleCredentials('user')}
                className="w-full text-xs bg-[#E8A020] text-white py-1.5 rounded hover:bg-[#d89418]"
              >
                Usar estas credenciales
              </button>
            </div>

            <div className="bg-white rounded-lg p-3 border border-blue-300">
              <p className="text-xs font-semibold text-[#1A3A5C] mb-2">🛠️ Administrador</p>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Email:</span>
                <code className="bg-gray-100 px-2 py-1 rounded">admin@edu.co</code>
              </div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-600">Contraseña:</span>
                <code className="bg-gray-100 px-2 py-1 rounded">admin123</code>
              </div>
              <button
                onClick={() => useExampleCredentials('admin')}
                className="w-full text-xs bg-[#1A3A5C] text-white py-1.5 rounded hover:bg-[#2a4a6c]"
              >
                Usar estas credenciales
              </button>
            </div>
          </div>
        </div>
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1A3A5C]">Crear cuenta nueva</h2>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                type="text"
                label="Nombre completo"
                placeholder="Juan Pérez"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                required
              />

              <Input
                type="email"
                label="Correo electrónico"
                placeholder="ejemplo@correo.com"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Nota:</strong> Si usas un correo institucional (@edu.co, @edu.co.com),
                  tendrás acceso como <strong>Administrador</strong>. Otros correos tendrán acceso como <strong>Usuario</strong>.
                </p>
              </div>

              <Input
                type="password"
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
              />

              <Input
                type="password"
                label="Confirmar contraseña"
                placeholder="Repite tu contraseña"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                required
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowRegisterModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Crear cuenta
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}