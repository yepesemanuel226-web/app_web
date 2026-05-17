import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export function CatalogManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const books = [
    { id: 1, title: 'Cien años de soledad', author: 'Gabriel García Márquez', category: 'Ficción', isbn: '978-0307474728', loanStock: 5, saleStock: 8, price: 45000, status: 'Activo' },
    { id: 2, title: '1984', author: 'George Orwell', category: 'Ficción', isbn: '978-0451524935', loanStock: 3, saleStock: 0, price: null, status: 'Activo' },
    { id: 3, title: 'Don Quijote', author: 'Miguel de Cervantes', category: 'Clásicos', isbn: '978-0060934347', loanStock: 4, saleStock: 6, price: 38000, status: 'Activo' },
    { id: 4, title: 'El principito', author: 'Antoine de Saint-Exupéry', category: 'Infantil', isbn: '978-0156012195', loanStock: 7, saleStock: 12, price: 25000, status: 'Activo' },
    { id: 5, title: 'Rayuela', author: 'Julio Cortázar', category: 'Ficción', isbn: '978-0394752846', loanStock: 2, saleStock: 0, price: null, status: 'Activo' },
  ];

  const handleDelete = (id: number, title: string) => {
    toast.success(`"${title}" eliminado del catálogo`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Gestión de catálogo</h1>
          <p className="text-gray-600">Administra los libros del sistema</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar libro
        </Button>
      </div>

      <Card>
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, autor o ISBN..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>Buscar</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Título</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Autor</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Categoría</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Stock préstamo</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Stock venta</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Precio</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1A3A5C]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">{book.id}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#1A3A5C]">{book.title}</p>
                    <p className="text-xs text-gray-500">{book.isbn}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{book.author}</td>
                  <td className="py-3 px-4 text-gray-700">{book.category}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${book.loanStock < 3 ? 'text-[#D32F2F]' : 'text-[#388E3C]'}`}>
                      {book.loanStock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${book.saleStock === 0 ? 'text-gray-400' : book.saleStock < 5 ? 'text-[#E8A020]' : 'text-[#388E3C]'}`}>
                      {book.saleStock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {book.price ? (
                      <span className="text-[#E8A020] font-semibold">
                        ${book.price.toLocaleString('es-CO')}
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="success">{book.status}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="text-[#1A3A5C] hover:text-[#2a4a6c]">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-[#D32F2F] hover:text-[#b32727]"
                        onClick={() => handleDelete(book.id, book.title)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#1A3A5C] mb-6">Agregar nuevo libro</h2>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Título" placeholder="Título del libro" required />
                <Input label="Autor" placeholder="Autor del libro" required />
                <Input label="ISBN" placeholder="978-XXXXXXXXXX" required />
                <Input label="Categoría" placeholder="Ficción, Historia, etc." required />
                <Input label="Stock préstamo" type="number" placeholder="0" required />
                <Input label="Stock venta" type="number" placeholder="0" />
                <Input label="Precio de venta" type="number" placeholder="0" />
                <Input label="Editorial" placeholder="Editorial" />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" onClick={(e) => { e.preventDefault(); setShowAddModal(false); toast.success('Libro agregado exitosamente'); }}>
                  Guardar libro
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
