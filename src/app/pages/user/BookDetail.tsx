import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ArrowLeft, BookOpen, Bookmark, ShoppingCart, Minus, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

export function BookDetail() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'loan' | 'reserve' | 'buy'>('loan');
  const [loanType, setLoanType] = useState<'express' | 'weekly' | 'monthly'>('weekly');
  const [quantity, setQuantity] = useState(1);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userMoraInfo, setUserMoraInfo] = useState<{ count: number; total: number } | null>(null);
  const [purchaseData, setPurchaseData] = useState({ name: '', phone: '', address: '', city: '', paymentMethod: 'efectivo' });

  useEffect(() => {
    if (bookId) { fetchBook(); fetchUserMora(); }
  }, [bookId]);

  const fetchBook = async () => {
    const { data } = await supabase.from('books').select('*').eq('id', bookId).single();
    setBook(data);
    setLoading(false);
  };

  const fetchUserMora = async () => {
    if (!user) return;
    const { data } = await supabase.from('loans').select('mora_amount').eq('user_id', user.id).eq('status', 'overdue').eq('mora_paid', false);
    if (data && data.length > 0) {
      setUserMoraInfo({ count: data.length, total: data.reduce((s: number, l: any) => s + (l.mora_amount || 0), 0) });
    }
  };

  const loanOptions = [
    { value: 'express', label: 'Diario', days: 1, emoji: '⚡' },
    { value: 'weekly', label: 'Semanal', days: 7, emoji: '📅' },
    { value: 'monthly', label: 'Mensual', days: 30, emoji: '📅' },
  ];

  const getDueDate = (days: number) => {
    const d = new Date(); d.setDate(d.getDate() + days);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const handleLoan = async () => {
    if (!user || !book) return;
    setSubmitting(true);

    const { data: overdue } = await supabase.from('loans').select('id, mora_amount').eq('user_id', user.id).eq('status', 'overdue').eq('mora_paid', false);
    if (overdue && overdue.length > 0) {
      const total = overdue.reduce((s: number, l: any) => s + (l.mora_amount || 0), 0);
      toast.error(`No puedes solicitar préstamos. Tienes mora de $${total.toLocaleString('es-CO')}`);
      setSubmitting(false);
      return;
    }

    const days = loanType === 'express' ? 1 : loanType === 'weekly' ? 7 : 30;
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(); due.setDate(due.getDate() + days);

    const { error } = await supabase.from('loans').insert([{
      user_id: user.id, book_id: book.id, loan_type: loanType,
      start_date: today, due_date: due.toISOString().split('T')[0],
      status: 'active', mora_amount: 0, mora_paid: false
    }]);

    if (error) { toast.error('Error: ' + error.message); setSubmitting(false); return; }

    await supabase.rpc('decrement_book_stock', { book_id: book.id });
    await supabase.from('notifications').insert([{
      user_id: user.id, type: 'info', title: 'Préstamo confirmado',
      message: `Tu préstamo de "${book.title}" fue confirmado. Devuélvelo antes del ${due.toLocaleDateString('es-CO')}.`, is_read: false
    }]);

    toast.success('¡Préstamo solicitado exitosamente!');
    navigate('/user/loans');
    setSubmitting(false);
  };

  const handleReserve = async () => {
    if (!user || !book) return;
    setSubmitting(true);

    const { error } = await supabase.from('reservations').insert([{
      user_id: user.id, book_id: book.id, status: 'waiting',
      reserved_date: new Date().toISOString().split('T')[0], queue_position: 1
    }]);

    if (error) { toast.error('Error: ' + error.message); setSubmitting(false); return; }

    await supabase.from('notifications').insert([{
      user_id: user.id, type: 'warning', title: 'Reserva registrada',
      message: `Tu reserva de "${book.title}" fue registrada. Te notificaremos cuando esté disponible.`, is_read: false
    }]);

    toast.success('¡Reserva registrada exitosamente!');
    navigate('/user/reservations');
    setSubmitting(false);
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !book) return;
    setSubmitting(true);

    const total = (book.sale_price || 0) * quantity;
    const { error } = await supabase.from('sales').insert([{
      user_id: user.id, book_id: book.id, quantity,
      unit_price: book.sale_price, total_amount: total,
      delivery_name: purchaseData.name, delivery_phone: purchaseData.phone,
      delivery_address: purchaseData.address, delivery_city: purchaseData.city,
      payment_method: purchaseData.paymentMethod,
      sale_date: new Date().toISOString().split('T')[0], status: 'pending'
    }]);

    if (error) { toast.error('Error: ' + error.message); setSubmitting(false); return; }

    await supabase.rpc('decrement_sale_stock', { book_id: book.id, quantity });
    await supabase.from('notifications').insert([{
      user_id: user.id, type: 'success', title: 'Compra confirmada',
      message: `Tu compra de ${quantity} unidad(es) de "${book.title}" fue registrada. Total: $${total.toLocaleString('es-CO')}.`, is_read: false
    }]);

    toast.success('¡Compra registrada exitosamente!');
    navigate('/user/purchases');
    setSubmitting(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <p className="text-gray-500">Cargando libro...</p>
    </div>
  );

  if (!book) return (
    <div className="text-center py-20">
      <p className="text-gray-500 text-lg">Libro no encontrado</p>
      <button onClick={() => navigate('/user/catalog')} className="mt-4 text-[#1A3A5C] hover:underline">Volver al catálogo</button>
    </div>
  );

  const selectedLoan = loanOptions.find(o => o.value === loanType)!;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <button onClick={() => navigate('/user/catalog')}
        className="flex items-center gap-2 text-[#1A3A5C] hover:text-[#E8A020] transition-colors font-medium">
        <ArrowLeft className="w-5 h-5" />Volver al catálogo
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-[#1A3A5C] to-[#0D5C63] p-8 text-white">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Portada */}
            <div className="w-48 h-64 bg-white bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xl border border-white border-opacity-20">
              <BookOpen className="w-20 h-20 text-white opacity-40" />
            </div>
            {/* Info principal */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-white bg-opacity-20 text-white text-xs px-3 py-1 rounded-full">{book.category}</span>
                {book.stock_loan > 0
                  ? <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">✓ Disponible para préstamo</span>
                  : <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">Sin stock</span>}
              </div>
              <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-blue-200 mb-1">{book.author}</p>
              <p className="text-blue-300 text-sm mb-4">{book.publisher} · {book.publication_year}</p>
              {book.sale_price && book.stock_sale > 0 && (
                <p className="text-3xl font-bold text-[#E8A020]">${book.sale_price.toLocaleString('es-CO')}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda: descripción e info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#1A3A5C] mb-3">Descripción</h2>
                <p className="text-gray-700 leading-relaxed">{book.description || 'Sin descripción disponible.'}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'ISBN', value: book.isbn },
                  { label: 'Páginas', value: book.pages || '—' },
                  { label: 'Idioma', value: book.language || 'Español' },
                  { label: 'Año', value: book.publication_year },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="font-semibold text-[#1A3A5C] text-sm">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Stock préstamo</p>
                  <p className={`text-3xl font-bold ${book.stock_loan > 0 ? 'text-[#388E3C]' : 'text-[#D32F2F]'}`}>{book.stock_loan}</p>
                  <p className="text-xs text-gray-500">disponibles</p>
                </div>
                {book.stock_sale > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Stock venta</p>
                    <p className="text-3xl font-bold text-[#E8A020]">{book.stock_sale}</p>
                    <p className="text-xs text-gray-500">disponibles</p>
                  </div>
                )}
              </div>
            </div>

            {/* Columna derecha: acciones */}
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button onClick={() => setActiveTab('loan')}
                  className={`flex-1 flex items-center justify-center gap-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'loan' ? 'border-[#1A3A5C] text-[#1A3A5C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <BookOpen className="w-4 h-4" />Préstamo
                </button>
                <button onClick={() => setActiveTab('reserve')}
                  className={`flex-1 flex items-center justify-center gap-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reserve' ? 'border-[#E8A020] text-[#E8A020]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <Bookmark className="w-4 h-4" />Reservar
                </button>
                {book.stock_sale > 0 && (
                  <button onClick={() => setActiveTab('buy')}
                    className={`flex-1 flex items-center justify-center gap-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'buy' ? 'border-[#388E3C] text-[#388E3C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    <ShoppingCart className="w-4 h-4" />Comprar
                  </button>
                )}
              </div>

              {/* PRÉSTAMO */}
              {activeTab === 'loan' && (
                <div className="space-y-4">
                  {userMoraInfo && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#D32F2F] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-[#D32F2F]">
                          <strong>No puedes solicitar préstamos.</strong> Tienes <strong>{userMoraInfo.count}</strong> préstamo(s) vencido(s) con mora de{' '}
                          <strong>${userMoraInfo.total.toLocaleString('es-CO')}</strong>. Dirígete a la biblioteca.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {loanOptions.map(opt => (
                      <button key={opt.value} onClick={() => setLoanType(opt.value as any)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${loanType === opt.value ? 'border-[#1A3A5C] bg-[#1A3A5C] text-white' : 'border-gray-200 hover:border-gray-300'}`}>
                        <span className="flex items-center gap-2 font-medium">
                          <span>{opt.emoji}</span>{opt.label}
                        </span>
                        <span className={`text-sm ${loanType === opt.value ? 'text-blue-200' : 'text-gray-500'}`}>{opt.days} día{opt.days > 1 ? 's' : ''}</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Fecha de devolución</p>
                    <p className="font-semibold text-[#1A3A5C] text-sm">{getDueDate(selectedLoan.days)}</p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">⚠️ El retraso genera mora de <strong>$2.000/día</strong></p>
                  </div>

                  <button onClick={handleLoan}
                    disabled={book.stock_loan <= 0 || submitting || !!userMoraInfo}
                    className="w-full bg-[#1A3A5C] text-white py-3 rounded-xl font-semibold hover:bg-[#2a4a6c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? 'Procesando...' : book.stock_loan <= 0 ? 'Sin stock disponible' : 'Confirmar préstamo'}
                  </button>
                </div>
              )}

              {/* RESERVAR */}
              {activeTab === 'reserve' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      {book.stock_loan > 0
                        ? '¿Prefieres reservarlo para recogerlo más tarde? Te notificaremos cuando debas pasar.'
                        : 'Este libro no tiene stock disponible. Reserva tu lugar en la lista de espera y te avisaremos cuando esté disponible.'}
                    </p>
                  </div>
                  <button onClick={handleReserve} disabled={submitting}
                    className="w-full bg-[#E8A020] text-white py-3 rounded-xl font-semibold hover:bg-[#d4911c] transition-colors disabled:opacity-50">
                    {submitting ? 'Procesando...' : 'Confirmar reserva'}
                  </button>
                </div>
              )}

              {/* COMPRAR */}
              {activeTab === 'buy' && book.stock_sale > 0 && (
                <div className="space-y-4">
                  {!showPurchaseForm ? (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Cantidad</p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-xl w-8 text-center">{quantity}</span>
                          <button onClick={() => setQuantity(Math.min(book.stock_sale, quantity + 1))} disabled={quantity >= book.stock_sale}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-1">Total a pagar</p>
                        <p className="text-3xl font-bold text-[#388E3C]">${((book.sale_price || 0) * quantity).toLocaleString('es-CO')}</p>
                      </div>
                      <button onClick={() => setShowPurchaseForm(true)}
                        className="w-full bg-[#388E3C] text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
                        Continuar con la compra
                      </button>
                    </>
                  ) : (
                    <form onSubmit={handlePurchase} className="space-y-3">
                      <p className="font-semibold text-[#1A3A5C]">Datos de entrega</p>
                      {[
                        { label: 'Nombre completo', key: 'name', placeholder: 'Juan Pérez', type: 'text' },
                        { label: 'Teléfono', key: 'phone', placeholder: '300 123 4567', type: 'tel' },
                        { label: 'Dirección', key: 'address', placeholder: 'Calle 123 # 45-67', type: 'text' },
                        { label: 'Ciudad', key: 'city', placeholder: 'Bogotá', type: 'text' },
                      ].map(({ label, key, placeholder, type }) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                          <input type={type} placeholder={placeholder} required
                            value={(purchaseData as any)[key]}
                            onChange={e => setPurchaseData({ ...purchaseData, [key]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#388E3C]" />
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Método de pago</label>
                        <select value={purchaseData.paymentMethod} onChange={e => setPurchaseData({ ...purchaseData, paymentMethod: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#388E3C]">
                          <option value="efectivo">Efectivo contra entrega</option>
                          <option value="transferencia">Transferencia bancaria</option>
                          <option value="tarjeta">Tarjeta de crédito/débito</option>
                        </select>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="text-[#388E3C]">${((book.sale_price || 0) * quantity).toLocaleString('es-CO')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setShowPurchaseForm(false)}
                          className="flex-1 border border-gray-300 py-2 rounded-xl text-sm hover:bg-gray-50">Volver</button>
                        <button type="submit" disabled={submitting}
                          className="flex-1 bg-[#388E3C] text-white py-2 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1">
                          <CheckCircle className="w-4 h-4" />{submitting ? 'Procesando...' : 'Confirmar'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
