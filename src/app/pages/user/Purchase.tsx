import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, ShoppingCart, Minus, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function Purchase() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const book = {
    id: bookId,
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    isbn: '978-0-307-47472-8',
    category: 'Ficción',
    price: 45000,
    stock: 8,
    description: 'Una obra maestra de la literatura latinoamericana que narra la historia de la familia Buendía en el pueblo ficticio de Macondo.'
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= book.stock) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchase = () => {
    setShowConfirmation(true);
    toast.success('¡Compra registrada exitosamente!');
  };

  if (showConfirmation) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <div className="bg-[#388E3C] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">¡Compra exitosa!</h1>
          <p className="text-gray-600 mb-6">Tu compra ha sido registrada correctamente</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
            <h3 className="font-bold text-[#1A3A5C] mb-4">Resumen de compra</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Libro:</span>
                <span className="font-medium text-[#1A3A5C]">{book.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cantidad:</span>
                <span className="font-medium text-[#1A3A5C]">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Precio unitario:</span>
                <span className="font-medium text-[#1A3A5C]">${book.price.toLocaleString('es-CO')}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="font-bold text-[#1A3A5C]">Total:</span>
                <span className="font-bold text-[#E8A020] text-xl">
                  ${(book.price * quantity).toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Recibirás un correo electrónico con los detalles de tu compra y las instrucciones para recoger tu pedido.
          </p>

          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate('/user/catalog')}>
              Volver al catálogo
            </Button>
            <Button onClick={() => navigate('/user')}>
              Ir al inicio
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#1A3A5C] hover:text-[#2a4a6c]"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver al catálogo
      </button>

      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Comprar libro</h1>
        <p className="text-gray-600">Completa tu compra y recibe tu libro</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Detalles del producto</h2>

          <div className="flex gap-6 mb-6">
            <div className="w-40 h-56 bg-gradient-to-br from-[#1A3A5C] to-[#0D5C63] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-6xl opacity-30">📖</span>
            </div>

            <div className="flex-1">
              <Badge variant="success" className="mb-2">En stock</Badge>
              <h3 className="text-2xl font-bold text-[#1A3A5C] mb-2">{book.title}</h3>
              <p className="text-gray-700 mb-4">{book.author}</p>

              <p className="text-3xl font-bold text-[#E8A020] mb-4">
                ${book.price.toLocaleString('es-CO')}
              </p>

              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">ISBN:</span> {book.isbn}</p>
                <p><span className="font-medium">Categoría:</span> {book.category}</p>
                <p><span className="font-medium">Stock disponible:</span> {book.stock} unidades</p>
              </div>

              <p className="text-gray-700 text-sm">{book.description}</p>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-1 h-fit">
          <h2 className="font-bold text-[#1A3A5C] mb-4">
            <ShoppingCart className="w-5 h-5 inline mr-2" />
            Resumen de compra
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Cantidad</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-bold text-xl text-[#1A3A5C] min-w-[40px] text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= book.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Precio unitario:</span>
                  <span className="font-medium">${book.price.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cantidad:</span>
                  <span className="font-medium">{quantity}</span>
                </div>
              </div>

              <div className="bg-[#FFF9EC] border border-[#E8A020] rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1A3A5C]">Total:</span>
                  <span className="font-bold text-[#E8A020] text-2xl">
                    ${(book.price * quantity).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              <Button onClick={handlePurchase} className="w-full">
                Confirmar compra
              </Button>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Nota:</strong> Recibirás un correo con las instrucciones de pago y recogida del libro.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
