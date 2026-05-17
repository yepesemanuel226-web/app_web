import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

const emptyBook = {
  title: '', author: '', isbn: '', category: '', description: '',
  publisher: '', publication_year: new Date().getFullYear(), pages: 0,
  language: 'Español', stock_loan: 0, stock_sale: 0, sale_price: 0,
  is_active: true,
  allowed_loan_types: ['express', 'weekly', 'monthly'] as string[],
};

const LOAN_TYPE_OPTIONS = [
  { value: 'express', label: 'Diario',  desc: '1 día',   icon: '⚡' },
  { value: 'weekly',  label: 'Semanal', desc: '7 días',  icon: '📅' },
  { value: 'monthly', label: 'Mensual', desc: '30 días', icon: '🗓️' },
];

export function AdminBookForm() {
  const navigate = useNavigate();
  const { bookId } = useParams();
  const isEditing = !!bookId;

  const [form, setForm] = useState<typeof emptyBook>(emptyBook);
  const [categories, setCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    fetchCategories();
    if (isEditing) fetchBook();
  }, [bookId]);

  const fetchBook = async () => {
    const { data } = await supabase.from('books').select('*').eq('id', bookId).single();
    if (data) {
      setForm({ ...data, allowed_loan_types: data.allowed_loan_types ?? ['express', 'weekly', 'monthly'] });
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('books').select('category').not('category', 'is', null).neq('category', '');
    if (data) {
      setCategories([...new Set(data.map(b => b.category))].sort());
    }
  };

  const f = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const toggleLoanType = (type: string) => {
    setForm(prev => {
      const current: string[] = prev.allowed_loan_types || [];
      if (current.includes(type)) {
        if (current.length === 1) { toast.error('Debe haber al menos un tipo de préstamo habilitado'); return prev; }
        return { ...prev, allowed_loan_types: current.filter(t => t !== type) };
      }
      return { ...prev, allowed_loan_types: [...current, type] };
    });
  };

  const handleSave = async () => {
    if (!form.title || !form.author) { toast.error('Título y autor son obligatorios'); return; }
    if (!form.allowed_loan_types || form.allowed_loan_types.length === 0) {
      toast.error('Selecciona al menos un tipo de préstamo'); return;
    }
    setSaving(true);

    if (isEditing) {
      const { error } = await supabase.from('books').update(form).eq('id', bookId);
      if (error) { toast.error('Error al actualizar: ' + error.message); setSaving(false); return; }
      toast.success('Libro actualizado exitosamente');
    } else {
      const { error } = await supabase.from('books').insert([form]);
      if (error) { toast.error('Error al agregar: ' + error.message); setSaving(false); return; }
      toast.success('Libro agregado exitosamente');
    }

    setSaving(false);
    navigate('/admin/catalog');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <p className="text-gray-500">Cargando libro...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Botón volver */}
      <button onClick={() => navigate('/admin/catalog')}
        className="flex items-center gap-2 text-[#1A3A5C] hover:text-[#E8A020] transition-colors font-medium">
        <ArrowLeft className="w-5 h-5" />Volver al catálogo
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A3A5C] to-[#0D5C63] rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-1">{isEditing ? 'Editar libro' : 'Agregar libro'}</h1>
        <p className="text-blue-200 text-sm">{isEditing ? 'Modifica los datos del libro' : 'Completa la información del nuevo libro'}</p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">

        {/* Datos básicos */}
        <div>
          <h2 className="text-lg font-bold text-[#1A3A5C] mb-4">Información básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Título *',        key: 'title',            type: 'text'   },
              { label: 'Autor *',         key: 'author',           type: 'text'   },
              { label: 'ISBN',            key: 'isbn',             type: 'text'   },
              { label: 'Editorial',       key: 'publisher',        type: 'text'   },
              { label: 'Año publicación', key: 'publication_year', type: 'number' },
              { label: 'Páginas',         key: 'pages',            type: 'number' },
              { label: 'Idioma',          key: 'language',         type: 'text'   },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  value={(form as any)[key] || ''}
                  onChange={e => f(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
                />
              </div>
            ))}

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={categories.includes(form.category) ? form.category : '__nueva__'}
                onChange={e => {
                  if (e.target.value !== '__nueva__') f('category', e.target.value);
                  else f('category', '');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020] mb-2"
              >
                <option value="">Sin categoría</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                <option value="__nueva__">+ Nueva categoría...</option>
              </select>
              {(!categories.includes(form.category) || form.category === '') && (
                <input
                  type="text"
                  placeholder="Escribe la categoría..."
                  value={form.category}
                  onChange={e => f('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
                />
              )}
            </div>
          </div>
        </div>

        {/* Stock y precio */}
        <div>
          <h2 className="text-lg font-bold text-[#1A3A5C] mb-4">Stock y precio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Stock préstamo', key: 'stock_loan',  type: 'number' },
              { label: 'Stock venta',    key: 'stock_sale',  type: 'number' },
              { label: 'Precio venta',   key: 'sale_price',  type: 'number' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  value={(form as any)[key] || ''}
                  onChange={e => f(key, Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de préstamo */}
        <div>
          <h2 className="text-lg font-bold text-[#1A3A5C] mb-1">Tipos de préstamo permitidos <span className="text-red-500">*</span></h2>
          <p className="text-xs text-gray-500 mb-4">Selecciona los tipos de préstamo que se pueden solicitar para este libro.</p>
          <div className="grid grid-cols-3 gap-4">
            {LOAN_TYPE_OPTIONS.map(opt => {
              const active = (form.allowed_loan_types || []).includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleLoanType(opt.value)}
                  className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 font-medium transition-all select-none ${
                    active ? 'border-[#1A3A5C] bg-[#1A3A5C] text-white shadow-md' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="font-bold text-sm">{opt.label}</span>
                  <span className={`text-xs ${active ? 'text-blue-200' : 'text-gray-400'}`}>{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <h2 className="text-lg font-bold text-[#1A3A5C] mb-4">Descripción</h2>
          <textarea
            rows={4}
            value={form.description}
            onChange={e => f('description', e.target.value)}
            placeholder="Escribe una descripción del libro..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
          />
        </div>

        {/* Activo */}
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => f('is_active', e.target.checked)}
            className="w-4 h-4 accent-[#E8A020]" />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Libro activo</label>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button onClick={() => navigate('/admin/catalog')}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 font-medium">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-[#E8A020] text-white py-3 rounded-xl hover:bg-[#d4911c] disabled:opacity-50 flex items-center justify-center gap-2 font-semibold">
            <Save className="w-4 h-4" />{saving ? 'Guardando...' : (isEditing ? 'Actualizar libro' : 'Agregar libro')}
          </button>
        </div>
      </div>
    </div>
  );
}
