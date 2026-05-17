import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Plus, Edit, Trash2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

const BOOKS_PER_PAGE = 10;

const LOAN_TYPE_OPTIONS = [
  { value: 'express', label: 'Diario',  icon: '⚡' },
  { value: 'weekly',  label: 'Semanal', icon: '📅' },
  { value: 'monthly', label: 'Mensual', icon: '🗓️' },
];

export function CatalogManagement() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { fetchBooks(); fetchCategories(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory]);

  const fetchBooks = async () => {
    const { data } = await supabase.from('books').select('*').order('title');
    setBooks(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('books').select('category').not('category', 'is', null).neq('category', '');
    if (data) {
      setCategories([...new Set(data.map(b => b.category))].sort());
    }
  };

  const filtered = books.filter(b => {
    const matchSearch = !searchQuery ||
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn?.includes(searchQuery);
    const matchCategory = !selectedCategory || b.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filtered.length / BOOKS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * BOOKS_PER_PAGE, currentPage * BOOKS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"?`)) return;
    await supabase.from('books').update({ is_active: false }).eq('id', id);
    toast.success(`"${title}" desactivado`);
    fetchBooks();
  };

  const loanTypeBadge = (types: string[] | null) => {
    if (!types || types.length === 0) return <span className="text-gray-400 text-xs">—</span>;
    return (
      <div className="flex gap-1 flex-wrap">
        {LOAN_TYPE_OPTIONS.filter(o => types.includes(o.value)).map(o => (
          <span key={o.value} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {o.icon} {o.label}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Gestión de catálogo</h1>
          <p className="text-gray-600">Administra los libros del sistema</p>
        </div>
        <button
          onClick={() => navigate('/admin/catalog/new')}
          className="flex items-center gap-2 bg-[#E8A020] text-white px-4 py-2 rounded-lg hover:bg-[#d4911c]"
        >
          <Plus className="w-4 h-4" />Agregar libro
        </button>
      </div>

      <Card>
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, autor o ISBN..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020] text-gray-700"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4" />Limpiar
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} {filtered.length === 1 ? 'libro encontrado' : 'libros encontrados'}
          {selectedCategory && <span className="ml-1">en <span className="font-medium text-[#1A3A5C]">{selectedCategory}</span></span>}
        </p>

        {loading ? <p className="text-gray-500">Cargando...</p> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-sm">
                    <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Libro</th>
                    <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Autor</th>
                    <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Categoría</th>
                    <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Stock préstamo</th>
                    <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Stock venta</th>
                    <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Precio</th>
                    <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Tipos préstamo</th>
                    <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Estado</th>
                    <th className="py-3 px-4 font-semibold text-[#1A3A5C]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(book => (
                    <tr key={book.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#1A3A5C]">{book.title}</p>
                        <p className="text-xs text-gray-500">{book.isbn}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{book.author}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{book.category || '—'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${book.stock_loan > 0 ? 'text-[#388E3C]' : 'text-[#D32F2F]'}`}>{book.stock_loan}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${book.stock_sale > 0 ? 'text-[#388E3C]' : 'text-gray-400'}`}>{book.stock_sale}</span>
                      </td>
                      <td className="py-3 px-4">
                        {book.sale_price ? <span className="text-[#E8A020] font-semibold">${book.sale_price?.toLocaleString('es-CO')}</span> : <span className="text-gray-400">N/A</span>}
                      </td>
                      <td className="py-3 px-4">{loanTypeBadge(book.allowed_loan_types)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={book.is_active ? 'success' : 'danger'}>{book.is_active ? 'Activo' : 'Inactivo'}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/admin/catalog/edit/${book.id}`)} className="text-[#1A3A5C] hover:text-[#E8A020]">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(book.id, book.title)} className="text-[#D32F2F] hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {paginated.length === 0 && <p className="text-center text-gray-500 py-8">No se encontraron libros</p>}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-6">
                <button onClick={() => goToPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-[#1A3A5C]">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {getPageNumbers().map((page, i) => (
                  page === '...'
                    ? <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
                    : <button key={page} onClick={() => goToPage(page as number)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-[#1A3A5C] text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                        {page}
                      </button>
                ))}
                <button onClick={() => goToPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-[#1A3A5C]">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            {totalPages > 1 && (
              <p className="text-center text-xs text-gray-400 mt-2">
                Página {currentPage} de {totalPages} · {filtered.length} libros en total
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}