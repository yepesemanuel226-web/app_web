import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Search, Filter, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const BOOKS_PER_PAGE = 20;

export function Catalog() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { fetchBooks(); }, []);

  // Reset página al cambiar filtros
  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory]);

  const fetchBooks = async () => {
    const { data } = await supabase.from('books').select('*').eq('is_active', true).order('title');
    const allBooks = data || [];
    setBooks(allBooks);
    setCategories([...new Set(allBooks.map((b: any) => b.category).filter(Boolean))] as string[]);
    setLoading(false);
  };

  const filtered = books.filter(book => {
    const matchSearch = !searchQuery ||
      book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn?.includes(searchQuery);
    const matchCat = selectedCategory === 'all' || book.category === selectedCategory;
    return matchSearch && matchCat;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Catálogo de libros</h1>
        <p className="text-gray-600">Explora nuestra colección completa — haz clic en un libro para ver sus detalles</p>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Buscar por título, autor, ISBN..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-start gap-3 flex-wrap">
            <div className="flex items-center gap-2 pt-1">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Categoría:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'all' ? 'bg-[#1A3A5C] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Todas
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-[#1A3A5C] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <p className="text-gray-500 text-center py-12">Cargando catálogo...</p>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron libros</p>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{filtered.length} libro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
            {totalPages > 1 && <p className="text-sm text-gray-500">Página {currentPage} de {totalPages}</p>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {paginated.map(book => (
              <div key={book.id}
                onClick={() => navigate(`/user/book/${book.id}`)}
                className="group cursor-pointer bg-white rounded-xl border border-gray-200 hover:border-[#E8A020] hover:shadow-lg transition-all duration-200 overflow-hidden">
                <div className="aspect-[3/4] bg-gradient-to-br from-[#1A3A5C] to-[#0D5C63] flex items-center justify-center relative overflow-hidden">
                  <BookOpen className="w-12 h-12 text-white opacity-30 group-hover:opacity-50 transition-opacity" />
                  {book.stock_loan === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-red-500 px-2 py-1 rounded">Sin stock</span>
                    </div>
                  )}
                  {book.sale_price && book.stock_sale > 0 && (
                    <div className="absolute top-2 right-2 bg-[#E8A020] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      Venta
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-bold text-[#1A3A5C] text-sm leading-tight mb-1 group-hover:text-[#E8A020] transition-colors line-clamp-2">
                    {book.title}
                  </p>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">{book.author}</p>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-gray-400 truncate">{book.category}</span>
                    {book.sale_price && book.stock_sale > 0 ? (
                      <span className="text-xs font-bold text-[#E8A020] whitespace-nowrap">${book.sale_price.toLocaleString('es-CO')}</span>
                    ) : (
                      <span className={`text-xs font-semibold whitespace-nowrap ${book.stock_loan > 0 ? 'text-[#388E3C]' : 'text-gray-400'}`}>
                        {book.stock_loan > 0 ? `${book.stock_loan} disp.` : 'Agotado'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-4">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>

              {getPageNumbers().map((page, i) =>
                page === '...' ? (
                  <span key={`dots-${i}`} className="px-3 py-2 text-gray-400">...</span>
                ) : (
                  <button key={page} onClick={() => goToPage(page as number)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-[#1A3A5C] text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}>
                    {page}
                  </button>
                )
              )}

              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}