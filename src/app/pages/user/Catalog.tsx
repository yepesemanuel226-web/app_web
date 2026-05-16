import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Filter, X, BookOpen, ShoppingCart, Bookmark, Minus, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

export function Catalog() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'loan' | 'reserve' | 'buy'>('loan');
  const [quantity, setQuantity] = useState(1);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    name: '', phone: '', address: '', city: '', paymentMethod: 'efectivo'
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('is_active', true)
      .order('title');
    const allBooks = data || [];
    setBooks(allBooks);
    const cats = [...new Set(allBooks.map((b: any) => b.category).filter(Boolean))];
    setCategories(cats);
    setLoading(false);
  };

  const filteredBooks = books.filter(book => {
    const matchSearch = !searchQuery ||
      book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn?.includes(searchQuery);
    const matchCat = selectedCategory === 'all' || book.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const getStatusBadge = (book: any) => {
    if (book.stock_loan > 0) return <Badge variant="success">Disponible</Badge>;
    return <Badge variant="danger">Sin stock</Badge>;
  };

  const handleLoanRequest = async () => {
    if (!user || !selectedBook) return;
    setSubmitting(true);

    if (selectedBook.stock_loan <= 0) {
      toast.error('Este libro no tiene stock para préstamo');
      setSubmitting(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const due = new Date();
    due.setDate(due.getDate() + 7);
    const dueDate = due.toISOString().split('T')[0];

    const { error } = await supabase.from('loans').insert([{
      user_id: user.id,
      book_id: selectedBook.id,
      loan_type: 'weekly',
      start_date: today,
      due_date: dueDate,
      status: 'active',
      mora_amount: 0,
      mora_paid: false
    }]);

    if (error) {
      toast.error('Error al solicitar préstamo: ' + error.message);
      setSubmitting(false);
      return;
    }

    await supabase.rpc('decrement_book_stock', { book_id: selectedBook.id });

    await supabase.from('notifications').insert([{
      user_id: user.id,
      type: 'info',
      title: 'Préstamo confirmado',
      message: `Tu préstamo de "${selectedBook.title}" fue confirmado. Devuélvelo antes del ${due.toLocaleDateString('es-CO')}.`,
      is_read: false
    }]);

    toast.success(`Préstamo de "${selectedBook.title}" solicitado exitosamente`);
    setSelectedBook(null);
    fetchBooks();
    setSubmitting(false);
  };

  const handleReserve = async () => {
    if (!user || !selectedBook) return;
    setSubmitting(true);

    const { error } = await supabase.from('reservations').insert([{
      user_id: user.id,
      book_id: selectedBook.id,
      status: 'waiting',
      reserved_date: new Date().toISOString().split('T')[0],
      queue_position: 1
    }]);

    if (error) {
      toast.error('Error al reservar: ' + error.message);
      setSubmitting(false);
      return;
    }

    await supabase.from('notifications').insert([{
      user_id: user.id,
      type: 'warning',
      title: 'Reserva registrada',
      message: `Tu reserva de "${selectedBook.title}" fue registrada. Te notificaremos cuando esté disponible.`,
      is_read: false
    }]);

    toast.success(`Reserva de "${selectedBook.title}" registrada exitosamente`);
    setSelectedBook(null);
    setSubmitting(false);
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBook) return;
    setSubmitting(true);

    const total = (selectedBook.price || 0) * quantity;

    const { error } = await supabase.from('sales').insert([{
      user_id: user.id,
      book_id: selectedBook.id,
      quantity,
      unit_price: selectedBook.price,
      total_amount: total,
      delivery_name: purchaseData.name,
      delivery_phone: purchaseData.phone,
      delivery_address: purchaseData.address,
      delivery_city: purchaseData.city,
      payment_method: purchaseData.paymentMethod,
      sale_date: new Date().toISOString().split('T')[0],
      status: 'pending'
    }]);

    if (error) {
      toast.error('Error al registrar compra: ' + error.message);
      setSubmitting(false);
      return;
    }

    await supabase.rpc('decrement_sale_stock', { book_id: selectedBook.id, quantity });

    await supabase.from('notifications').insert([{
      user_id: user.id,
      type: 'success',
      title: 'Compra confirmada',
      message: `Tu compra de ${quantity} unidad(es) de "${selectedBook.title}" fue registrada. Total: $${total.toLocaleString('es-CO')}.`,
      is_read: false
    }]);

    toast.success(`Compra de "${selectedBook.title}" registrada exitosamente`);
    setSelectedBook(null);
    setShowPurchaseForm(false);
    setPurchaseData({ name: '', phone: '', address: '', city: '', paymentMethod: 'efectivo' });
    fetchBooks();
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Catálogo de libros</h1>
        <p className="text-gray-600">Explora nuestra colección completa</p>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Buscar por título, autor, ISBN..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Categoría:</span>
            </div>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020]">
              <option value="all">Todas las categorías</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <p className="text-gray-500">Cargando catálogo...</p>
      ) : filteredBooks.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron libros</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id}
              className="hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
              onClick={() => { setSelectedBook(book); setActiveTab('loan'); setQuantity(1); setShowPurchaseForm(false); }}>
              <div className="aspect-[3/4] bg-gradient-to-br from-[#1A3A5C] to-[#0D5C63] rounded-lg mb-4 flex items-center justify-center overflow-hidden relative group-hover:shadow-lg">
                <span className="text-white text-4xl opacity-30 group-hover:opacity-50 transition-all duration-300">📖</span>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">Ver detalles</span>
                </div>
              </div>
              <div className="mb-2">{getStatusBadge(book)}</div>
              <h3 className="font-bold text-[#1A3A5C] mb-1 group-hover:text-[#E8A020] transition-colors">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-1">{book.author}</p>
              <p className="text-xs text-gray-500 mb-3">{book.category}</p>
              {book.for_sale && book.price && (
                <p className="text-[#E8A020] font-semibold">${book.price.toLocaleString('es-CO')}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-[#1A3A5C]">Detalles del libro</h2>
              <button onClick={() => setSelectedBook(null)} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-1">
                  <div className="aspect-[3/4] bg-gradient-to-br from-[#1A3A5C] to-[#0D5C63] rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-6xl opacity-30">📖</span>
                  </div>
                  <div className="mt-4">{getStatusBadge(selectedBook)}</div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-3xl font-bold text-[#1A3A5C] mb-2">{selectedBook.title}</h3>
                  <p className="text-xl text-gray-700 mb-4">{selectedBook.author}</p>
                  {selectedBook.for_sale && selectedBook.price && (
                    <p className="text-3xl font-bold text-[#E8A020] mb-4">${selectedBook.price.toLocaleString('es-CO')}</p>
                  )}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-[#1A3A5C] mb-2">Descripción</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{selectedBook.description || 'Sin descripción disponible.'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-gray-600">ISBN</p><p className="font-semibold text-[#1A3A5C]">{selectedBook.isbn}</p></div>
                    <div><p className="text-gray-600">Editorial</p><p className="font-semibold text-[#1A3A5C]">{selectedBook.publisher}</p></div>
                    <div><p className="text-gray-600">Año</p><p className="font-semibold text-[#1A3A5C]">{selectedBook.publication_year}</p></div>
                    <div><p className="text-gray-600">Categoría</p><p className="font-semibold text-[#1A3A5C]">{selectedBook.category}</p></div>
                    <div><p className="text-gray-600">Stock préstamo</p><p className="font-semibold text-[#1A3A5C]">{selectedBook.stock_loan} disponibles</p></div>
                    {selectedBook.for_sale && <div><p className="text-gray-600">Stock venta</p><p className="font-semibold text-[#1A3A5C]">{selectedBook.stock_sale} disponibles</p></div>}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                  <button onClick={() => setActiveTab('loan')}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'loan' ? 'border-[#1A3A5C] text-[#1A3A5C]' : 'border-transparent text-gray-600 hover:text-[#1A3A5C]'}`}>
                    <BookOpen className="w-5 h-5" />Solicitar préstamo
                  </button>
                  <button onClick={() => setActiveTab('reserve')}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'reserve' ? 'border-[#E8A020] text-[#E8A020]' : 'border-transparent text-gray-600 hover:text-[#E8A020]'}`}>
                    <Bookmark className="w-5 h-5" />Reservar
                  </button>
                  {selectedBook.for_sale && (
                    <button onClick={() => setActiveTab('buy')}
                      className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'buy' ? 'border-[#388E3C] text-[#388E3C]' : 'border-transparent text-gray-600 hover:text-[#388E3C]'}`}>
                      <ShoppingCart className="w-5 h-5" />Comprar
                    </button>
                  )}
                </div>

                {activeTab === 'loan' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-bold text-[#1A3A5C] mb-3">Solicitar préstamo</h4>
                    <p className="text-sm text-gray-700 mb-4">Se registrará un préstamo semanal (7 días). Recuerda que los retrasos generan mora de $2.000 por día.</p>
                    <Button onClick={handleLoanRequest} disabled={selectedBook.stock_loan <= 0 || submitting} variant="secondary" className="w-full md:w-auto">
                      {submitting ? 'Procesando...' : selectedBook.stock_loan > 0 ? 'Confirmar préstamo' : 'Sin stock disponible'}
                    </Button>
                  </div>
                )}

                {activeTab === 'reserve' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h4 className="font-bold text-[#1A3A5C] mb-3">Reservar libro</h4>
                    <p className="text-sm text-gray-700 mb-4">
                      {selectedBook.stock_loan > 0
                        ? 'Este libro está disponible. ¿Prefieres reservarlo para recogerlo más tarde?'
                        : 'Sin stock actualmente. Te notificaremos cuando esté disponible.'}
                    </p>
                    <Button onClick={handleReserve} disabled={submitting} className="w-full md:w-auto">
                      {submitting ? 'Procesando...' : 'Confirmar reserva'}
                    </Button>
                  </div>
                )}

                {activeTab === 'buy' && selectedBook.for_sale && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-bold text-[#1A3A5C] mb-4">Comprar libro</h4>
                    {!showPurchaseForm ? (
                      <>
                        <div className="flex items-center gap-4 mb-6">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Cantidad</p>
                            <div className="flex items-center gap-3">
                              <Button variant="ghost" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="font-bold text-2xl text-[#1A3A5C] min-w-[50px] text-center">{quantity}</span>
                              <Button variant="ghost" size="sm" onClick={() => setQuantity(Math.min(selectedBook.stock_sale, quantity + 1))} disabled={quantity >= selectedBook.stock_sale}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Stock disponible: {selectedBook.stock_sale}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-2">Total a pagar</p>
                            <p className="text-3xl font-bold text-[#388E3C]">${((selectedBook.price || 0) * quantity).toLocaleString('es-CO')}</p>
                          </div>
                        </div>
                        <Button onClick={() => setShowPurchaseForm(true)} disabled={selectedBook.stock_sale <= 0} className="w-full">
                          Continuar con la compra
                        </Button>
                      </>
                    ) : (
                      <form onSubmit={handlePurchase} className="space-y-4">
                        <h5 className="font-semibold text-[#1A3A5C] mb-3">Datos de entrega</h5>
                        <Input label="Nombre completo" placeholder="Juan Pérez" value={purchaseData.name} onChange={(e) => setPurchaseData({ ...purchaseData, name: e.target.value })} required />
                        <Input label="Teléfono" type="tel" placeholder="300 123 4567" value={purchaseData.phone} onChange={(e) => setPurchaseData({ ...purchaseData, phone: e.target.value })} required />
                        <Input label="Dirección" placeholder="Calle 123 # 45-67" value={purchaseData.address} onChange={(e) => setPurchaseData({ ...purchaseData, address: e.target.value })} required />
                        <Input label="Ciudad" placeholder="Bogotá" value={purchaseData.city} onChange={(e) => setPurchaseData({ ...purchaseData, city: e.target.value })} required />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Método de pago</label>
                          <select value={purchaseData.paymentMethod} onChange={(e) => setPurchaseData({ ...purchaseData, paymentMethod: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]" required>
                            <option value="efectivo">Efectivo contra entrega</option>
                            <option value="transferencia">Transferencia bancaria</option>
                            <option value="tarjeta">Tarjeta de crédito/débito</option>
                          </select>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-300">
                          <h6 className="font-semibold text-[#1A3A5C] mb-2">Resumen</h6>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">Libro:</span><span className="font-medium">{selectedBook.title}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Cantidad:</span><span className="font-medium">{quantity}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Precio unitario:</span><span className="font-medium">${selectedBook.price?.toLocaleString('es-CO')}</span></div>
                            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                              <span className="font-bold text-[#1A3A5C]">Total:</span>
                              <span className="font-bold text-[#388E3C] text-xl">${((selectedBook.price || 0) * quantity).toLocaleString('es-CO')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button type="button" variant="ghost" onClick={() => setShowPurchaseForm(false)} className="flex-1">Volver</Button>
                          <Button type="submit" disabled={submitting} className="flex-1">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {submitting ? 'Procesando...' : 'Confirmar compra'}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}