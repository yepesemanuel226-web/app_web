# 🖼️ Guía de Imágenes - SGB

## Lugares donde van las imágenes

### 1. **Portadas de Libros**

#### Ubicación en el código:
- `src/app/pages/user/Catalog.tsx` - Líneas 259-260, 307-309
- `src/app/pages/user/LoanRequest.tsx` - Similar estructura
- `src/app/pages/user/Purchase.tsx` - Similar estructura
- `src/app/pages/admin/CatalogManagement.tsx` - Vista administrativa

#### Reemplazar:
```tsx
// ❌ ESTO ES UN PLACEHOLDER:
<div className="aspect-[3/4] bg-gradient-to-br from-[#1A3A5C] to-[#0D5C63] rounded-lg">
  <span className="text-white text-4xl opacity-30">📖</span>
</div>

// ✅ REEMPLAZAR CON:
<div className="aspect-[3/4] rounded-lg overflow-hidden">
  <img 
    src={book.cover_image_url || '/placeholder-book.jpg'} 
    alt={book.title}
    className="w-full h-full object-cover"
  />
</div>
```

### 2. **Avatar de Usuario (Login y Perfil)**

#### Ubicación en el código:
- `src/app/pages/user/UserProfile.tsx` - Línea 37
- `src/app/layouts/AdminLayout.tsx` - Línea 115

#### Reemplazar:
```tsx
// ❌ PLACEHOLDER:
<div className="bg-gradient-to-br from-[#1A3A5C] to-[#0D5C63] w-24 h-24 rounded-full">
  <User className="w-12 h-12 text-white" />
</div>

// ✅ REEMPLAZAR CON:
<img 
  src={user?.avatar_url || '/default-avatar.png'} 
  alt={user?.name}
  className="w-24 h-24 rounded-full object-cover"
/>
```

### 3. **Logo del Sistema**

#### Ubicación en el código:
- `src/app/pages/Login.tsx` - Línea 81
- `src/app/layouts/UserLayout.tsx` - Línea 24
- `src/app/layouts/AdminLayout.tsx` - Línea 38

#### Reemplazar:
```tsx
// ❌ PLACEHOLDER:
<div className="bg-[#E8A020] p-3 rounded-full">
  <BookOpen className="w-8 h-8 text-white" />
</div>

// ✅ REEMPLAZAR CON:
<img 
  src="/logo-sgb.png" 
  alt="SGB Logo"
  className="w-12 h-12"
/>
```

## 📁 Estructura de Carpetas Recomendada

```
public/
├── logo-sgb.png                    # Logo principal del sistema
├── logo-sgb-white.png              # Logo versión blanca
├── default-avatar.png              # Avatar por defecto
├── placeholder-book.jpg            # Placeholder para libros sin portada
└── images/
    └── banners/
        ├── home-banner.jpg         # Banner del dashboard
        └── catalog-banner.jpg      # Banner del catálogo
```

## 🎨 Especificaciones de Imágenes

### Portadas de Libros
- **Tamaño recomendado**: 400x600px (ratio 2:3)
- **Formato**: JPG o PNG
- **Peso máximo**: 500KB
- **Storage**: Supabase Storage bucket `book-covers`

### Logo del Sistema
- **Tamaño**: 200x200px
- **Formato**: PNG con transparencia
- **Versiones**: Color y blanco

### Avatar de Usuario
- **Tamaño**: 200x200px
- **Formato**: JPG o PNG
- **Circular**: Sí
- **Storage**: Supabase Storage bucket `avatars`

## 🔧 Crear Componente de Imagen con Fallback

Crea este componente para manejar imágenes que no cargan:

\`\`\`tsx
// src/app/components/ui/ImageWithFallback.tsx
import React, { useState } from 'react';

interface ImageWithFallbackProps {
  src: string | null;
  fallback: string;
  alt: string;
  className?: string;
}

export function ImageWithFallback({ 
  src, 
  fallback, 
  alt, 
  className 
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  
  return (
    <img
      src={error || !src ? fallback : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
\`\`\`

### Uso:
\`\`\`tsx
<ImageWithFallback
  src={book.cover_image_url}
  fallback="/placeholder-book.jpg"
  alt={book.title}
  className="w-full h-full object-cover"
/>
\`\`\`

## 📤 Subir Imágenes a Supabase

### Desde el Panel de Supabase:
1. Storage → book-covers → Upload
2. Arrastra tu imagen
3. Copia la URL pública
4. Actualiza el campo `cover_image_url` en la tabla `books`

### Programáticamente:
\`\`\`typescript
const uploadImage = async (file: File) => {
  const { data, error } = await supabase.storage
    .from('book-covers')
    .upload(\`\${Date.now()}_\${file.name}\`, file);
    
  if (data) {
    const { data: { publicUrl } } = supabase.storage
      .from('book-covers')
      .getPublicUrl(data.path);
      
    return publicUrl;
  }
};
\`\`\`

## ✅ Checklist de Implementación

- [ ] Crear bucket `book-covers` en Supabase Storage
- [ ] Crear bucket `avatars` en Supabase Storage
- [ ] Subir logo del sistema a `/public`
- [ ] Crear placeholder para libros sin portada
- [ ] Crear avatar por defecto
- [ ] Actualizar componente `Catalog.tsx` con imágenes reales
- [ ] Actualizar `UserProfile.tsx` con avatares
- [ ] Actualizar layouts con logo real
- [ ] Crear componente `ImageWithFallback`
- [ ] Subir portadas de libros de ejemplo
- [ ] Actualizar base de datos con URLs de imágenes

## 🎯 URLs de Ejemplo

Una vez subidas las imágenes a Supabase, las URLs se verán así:

\`\`\`
https://tuproyecto.supabase.co/storage/v1/object/public/book-covers/cien-anos-soledad.jpg
https://tuproyecto.supabase.co/storage/v1/object/public/avatars/user-123.jpg
\`\`\`
