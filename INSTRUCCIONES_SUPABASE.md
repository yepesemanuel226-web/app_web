# 🚀 Guía Rápida de Implementación con Supabase

## Paso 1: Configurar Supabase

### 1.1 Crear cuenta y proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Guarda: **Project URL** y **API Key**

### 1.2 Ejecutar el schema
1. En Supabase, ve a **SQL Editor**
2. Abre `supabase/schema.sql`
3. Copia todo el contenido
4. Pégalo en el editor y ejecuta
5. ✅ Deberías ver: "Success. No rows returned"

### 1.3 Insertar datos de prueba
1. En **SQL Editor**, nueva query
2. Abre `supabase/seed.sql`
3. Copia todo el contenido
4. Pégalo y ejecuta
5. ✅ Deberías ver: "Success. 13 rows affected" (o similar)

## Paso 2: Configurar Storage (Para Imágenes)

### 2.1 Crear buckets
1. Ve a **Storage** en Supabase
2. Crea bucket `book-covers` (público ✅)
3. Crea bucket `avatars` (público ✅)

### 2.2 Configurar políticas
En **SQL Editor**:

```sql
-- Políticas para book-covers
CREATE POLICY "Public can view covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-covers');

CREATE POLICY "Admins can upload covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'book-covers');

-- Políticas para avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');
```

## Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo .env.local
```bash
cp .env.example .env.local
```

### 3.2 Editar .env.local
```env
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

📍 **Encuentra estos valores en**: Settings > API

## Paso 4: Subir Imágenes de Libros

### Opción A: Interfaz de Supabase (Rápida)

1. Ve a **Storage** > **book-covers**
2. Arrastra imágenes de portadas (400x600px recomendado)
3. Haz clic derecho → "Copy URL"
4. Ve a **Table Editor** > **books**
5. Edita el libro
6. Pega la URL en `cover_image_url`
7. Guarda

### Opción B: Actualizar por SQL

```sql
UPDATE books 
SET cover_image_url = 'https://tuproyecto.supabase.co/storage/v1/object/public/book-covers/cien-anos-soledad.jpg'
WHERE title = 'Cien años de soledad';
```

## Paso 5: Instalar Cliente de Supabase

```bash
pnpm add @supabase/supabase-js
```

## Paso 6: Crear Cliente de Supabase

Crea `src/lib/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Paso 7: Verificar que todo funciona

### 7.1 Probar conexión
En cualquier componente:

```typescript
import { supabase } from '../lib/supabaseClient';

// Listar libros
const { data, error } = await supabase
  .from('books')
  .select('*')
  .limit(5);

console.log('Libros:', data);
```

### 7.2 Usuarios de prueba
- **Admin**: admin@edu.co / admin123
- **Usuario**: usuario@gmail.com / usuario123

## ✅ Checklist de Implementación

- [ ] Proyecto creado en Supabase
- [ ] Schema ejecutado (tablas creadas)
- [ ] Datos de prueba insertados
- [ ] Buckets creados (book-covers, avatars)
- [ ] Políticas de storage configuradas
- [ ] Variables de entorno configuradas (.env.local)
- [ ] Cliente de Supabase instalado
- [ ] Imágenes de libros subidas
- [ ] URLs de imágenes actualizadas en BD
- [ ] Conexión probada

## 🎯 Próximos Pasos

1. **Integrar autenticación real** (reemplazar mock con Supabase Auth)
2. **Conectar componentes a Supabase** (reemplazar datos hardcodeados)
3. **Implementar CRUD completo** (crear, leer, actualizar, eliminar)
4. **Subir imágenes desde la app** (función de upload)
5. **Implementar búsqueda en tiempo real**

## 🐛 Solución de Problemas

### "Error: relation 'books' does not exist"
➡️ El schema no se ejecutó correctamente. Vuelve a ejecutar `schema.sql`

### "Error: permission denied for table users"
➡️ Las políticas RLS están bloqueando el acceso. Verifica que el usuario esté autenticado.

### "Las imágenes no cargan"
➡️ Verifica que el bucket sea **público** y que la URL esté correcta.

### "VITE_SUPABASE_URL is not defined"
➡️ Creaste `.env.local` en la raíz del proyecto? Reinicia el servidor: `pnpm dev`

## 📚 Recursos

- [Documentación Supabase](https://supabase.com/docs)
- [Guía de Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
