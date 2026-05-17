import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ShoppingCart, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

export function MyPurchases() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchPurchases();
  }, [user]);

  const fetchPurchases = async () => {
    const { data } = await supabase
      .from('sales')
      .select('*, book:books(title, author, category)')
      .eq('user_id', user!.id)
      .order('sale_date', { ascending: false });

    setPurchases(data || []);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Pendiente</Badge>;
      case 'delivered': return <Badge variant="success">Entregado</Badge>;
      case 'cancelled': return <Badge variant="danger">Cancelado</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const paymentLabel = (method: string) => {
    if (method === 'efectivo') return 'Efectivo contra entrega';
    if (method === 'transferencia') return 'Transferencia bancaria';
    if (method === 'tarjeta') return 'Tarjeta de crédito/débito';
    return method;
  };

  const total = purchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Mis compras</h1>
        <p className="text-gray-600">Historial de todos tus pedidos</p>
      </div>

      {purchases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-600">Total de compras</p>
            <p className="text-3xl font-bold text-[#1A3A5C]">{purchases.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Libros adquiridos</p>
            <p className="text-3xl font-bold text-[#1A3A5C]">{purchases.reduce((sum, p) => sum + (p.quantity || 0), 0)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Total gastado</p>
            <p className="text-3xl font-bold text-[#388E3C]">${total.toLocaleString('es-CO')}</p>
          </Card>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando compras...</p>
      ) : purchases.length === 0 ? (
        <Card className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No tienes compras aún</h3>
          <p className="text-gray-500">Explora el catálogo y adquiere tus libros favoritos</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-20 bg-gradient-to-br from-[#1A3A5C] to-[#0D5C63] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl opacity-30">📖</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-bold text-[#1A3A5C] text-lg">{purchase.book?.title}</h3>
                      <p className="text-gray-600">{purchase.book?.author}</p>
                      <p className="text-xs text-gray-500">{purchase.book?.category}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(purchase.status)}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(purchase.sale_date).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-100 text-sm">
                    <div>
                      <p className="text-gray-500">Cantidad</p>
                      <p className="font-semibold text-[#1A3A5C]">{purchase.quantity} unidad(es)</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Precio unitario</p>
                      <p className="font-semibold text-[#1A3A5C]">${(purchase.unit_price || 0).toLocaleString('es-CO')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-bold text-[#388E3C]">${(purchase.total_amount || 0).toLocaleString('es-CO')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pago</p>
                      <p className="font-semibold text-[#1A3A5C]">{paymentLabel(purchase.payment_method)}</p>
                    </div>
                  </div>
                  {purchase.delivery_address && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <Package className="w-4 h-4" />
                      <span>{purchase.delivery_name} — {purchase.delivery_address}, {purchase.delivery_city}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
