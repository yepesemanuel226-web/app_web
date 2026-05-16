import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

export function LoanRequest() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loanType, setLoanType] = useState<'express' | 'weekly' | 'monthly'>('weekly');
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bookId) return;
    supabase.from('books').select('*').eq('id', bookId).single()
      .then(({ data }) => setBook(data));
  }, [bookId]);

  const loanTypes = {
    express: { label: 'Express', days: 3, description: '1-3 días' },
    weekly:  { label: 'Semanal', days: 7, description: '7 días' },
    monthly: { label: 'Mensual', days: 30, description: '30 días' }
  };

  const getDueDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getDueDateISO = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!user || !book) return;
    setLoading(true);

    // Verificar stock
    if (book.stock_loan <= 0) {
      toast.error('Este libro no tiene stock disponible para préstamo');
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const dueDate = getDueDateISO(loanTypes[loanType].days);

    // Crear préstamo
    const { error } = await supabase.from('loans').insert([{
      user_id: user.id,
      book_id: book.id,
      loan_type: loanType,
      start_date: today,
      due_date: dueDate,
      status: 'active',
      mora_amount: 0,
      mora_paid: false
    }]);

    if (error) {
      toast.error('Error al solicitar el préstamo: ' + error.message);
      setLoading(false);
      return;
    }

    // Decrementar stock
    await supabase.rpc('decrement_book_stock', { book_id: book.id });

    // Crear notificación
    await supabase.from('notifications').insert([{
      user_id: user.id,
      type: 'info',
      title: 'Préstamo confirmado',
      message: `Tu préstamo de "${book.title}" fue confirmado. Devuélvelo antes del ${getDueDate(loanTypes[loanType].days)}.`,
      is_read: false
    }]);

    toast.success('¡Préstamo solicitado exitosamente!');
    navigate('/user/loans');
    setLoading(false);
  };

  if (!book) return <p className="text-gray-500 p-8">Cargando libro...</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#1A3A5C] hover:text-[#2a4a6c]">
        <ArrowLeft className="w-5 h-5" />
        Volver al catálogo
      </button>

      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Solicitar préstamo</h1>
        <p className="text-gray-600">Completa la información para solicitar tu préstamo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Detalles del libro</h2>
          <div className="flex gap-6 mb-6">
            <div className="w-32 h-44 bg-gradient-to-br from-[#1A3A5C] to-[#0D5C63] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-5xl opacity-30">📖</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[#1A3A5C] mb-2">{book.title}</h3>
              <p className="text-gray-700 mb-1">{book.author}</p>
              <Badge variant={book.stock_loan > 0 ? 'success' : 'danger'} className="mb-3">
                {book.stock_loan > 0 ? 'Disponible' : 'Sin stock'}
              </Badge>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">ISBN:</span> {book.isbn}</p>
                <p><span className="font-medium">Categoría:</span> {book.category}</p>
                <p><span className="font-medium">Editorial:</span> {book.publisher}</p>
                <p><span className="font-medium">Año:</span> {book.publication_year}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-bold text-[#1A3A5C] mb-4">Selecciona el tipo de préstamo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(loanTypes) as Array<keyof typeof loanTypes>).map((type) => (
                <button key={type} onClick={() => setLoanType(type)}
                  className={`p-4 border-2 rounded-lg transition-all ${loanType === type ? 'border-[#E8A020] bg-[#FFF9EC]' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-center">
                    <p className="font-bold text-[#1A3A5C] mb-1">{loanTypes[type].label}</p>
                    <p className="text-sm text-gray-600">{loanTypes[type].description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-1 h-fit">
          <h2 className="font-bold text-[#1A3A5C] mb-4">Resumen del préstamo</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tipo de préstamo</p>
              <p className="font-semibold text-[#1A3A5C]">{loanTypes[loanType].label}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Duración</p>
              <p className="font-semibold text-[#1A3A5C]">{loanTypes[loanType].days} días</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-[#1A3A5C] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Fecha de devolución</p>
                  <p className="font-semibold text-[#1A3A5C]">{getDueDate(loanTypes[loanType].days)}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-yellow-800">
                  <strong>Importante:</strong> El retraso en la devolución genera una mora de $2.000 por día.
                </p>
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={loading || book.stock_loan <= 0}>
                {loading ? 'Procesando...' : 'Confirmar préstamo'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}