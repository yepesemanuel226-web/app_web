# 📚 Base de Datos Supabase - SGB

## 🚀 Configuración Inicial

### 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Guarda tu **Project URL** y **API Key (anon/public)**

### 2. Ejecutar el Schema SQL

1. En el panel de Supabase, ve a **SQL Editor**
2. Copia todo el contenido de `schema.sql`
3. Pégalo en el editor y ejecuta el script
4. Esto creará todas las tablas, índices, triggers y políticas de seguridad

### 3. Insertar Datos de Prueba

1. En el **SQL Editor**, abre una nueva query
2. Copia todo el contenido de `seed.sql`
3. Pégalo y ejecuta el script
4. Esto insertará usuarios, libros, préstamos y otros datos de ejemplo

### 4. Configurar Storage para Imágenes

#### Crear Bucket para Portadas de Libros

1. Ve a **Storage** en el panel de Supabase
2. Clic en **Create a new bucket**
3. Nombre: `book-covers`
4. **Público**: ✅ Marca como público para que las imágenes sean accesibles
5. Clic en **Create bucket**

#### Políticas de Storage

```sql
-- Permitir que todos lean las imágenes
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'book-covers' );

-- Permitir que los admins suban imágenes
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'book-covers' AND
    auth.role() = 'authenticated' AND
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
);
```

### 5. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_project_url
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## 📊 Estructura de la Base de Datos

### Tablas Principales

1. **users** - Usuarios del sistema (admin y user)
2. **books** - Catálogo de libros con imágenes
3. **loans** - Préstamos activos y históricos
4. **reservations** - Reservas en cola
5. **sales** - Transacciones de venta
6. **notifications** - Notificaciones del sistema
7. **mora_config** - Configuración de tarifas de mora

## 🖼️ Subir Imágenes de Libros

### Opción 1: Desde la Interfaz de Supabase

1. Ve a **Storage** > **book-covers**
2. Clic en **Upload file**
3. Selecciona la imagen de portada
4. Copia la URL pública de la imagen
5. Actualiza el libro en la tabla `books`:

```sql
UPDATE books
SET cover_image_url = 'https://tuproyecto.supabase.co/storage/v1/object/public/book-covers/nombre-imagen.jpg'
WHERE id = 'id-del-libro';
```

### Opción 2: Programáticamente

```typescript
import { supabase } from './supabaseClient';

async function uploadBookCover(file: File, bookId: string) {
  // Subir la imagen
  const { data, error } = await supabase.storage
    .from('book-covers')
    .upload(`${bookId}.jpg`, file);

  if (error) {
    console.error('Error subiendo imagen:', error);
    return;
  }

  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('book-covers')
    .getPublicUrl(`${bookId}.jpg`);

  // Actualizar el libro con la URL
  await supabase
    .from('books')
    .update({ cover_image_url: publicUrl })
    .eq('id', bookId);
}
```

## 👤 Usuarios de Prueba

### Administrador
- **Email**: admin@edu.co
- **Contraseña**: admin123
- **Rol**: admin

### Usuario Normal
- **Email**: usuario@gmail.com
- **Contraseña**: usuario123
- **Rol**: user

## 🔐 Autenticación

El sistema usa autenticación personalizada. Para integrar con Supabase Auth:

1. Habilita **Email Auth** en Supabase
2. Opcionalmente, desactiva confirmación de email para desarrollo
3. Los usuarios se crean con el rol basado en su dominio de email:
   - `@edu.co`, `@edu.co.com`, etc. → **admin**
   - Otros dominios → **user**

## 📝 Notas Importantes

- **Contraseñas**: En los datos de prueba, las contraseñas están hasheadas con bcrypt. En producción, usa Supabase Auth.
- **Imágenes**: Las URLs de imágenes en `seed.sql` están como `NULL`. Debes subirlas y actualizarlas.
- **Row Level Security (RLS)**: Todas las políticas están configuradas para proteger los datos según el rol del usuario.
- **Triggers**: Los triggers calculan automáticamente las moras cuando los préstamos vencen.

## 🔄 Actualizar la Base de Datos

Si necesitas resetear la base de datos:

```sql
-- CUIDADO: Esto borra todos los datos
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Luego ejecuta schema.sql y seed.sql nuevamente
```

## 📚 Consultas Útiles

### Ver todos los préstamos vencidos
```sql
SELECT u.name, b.title, l.due_date, l.mora_amount
FROM loans l
JOIN users u ON l.user_id = u.id
JOIN books b ON l.book_id = b.id
WHERE l.status = 'overdue';
```

### Libros más prestados
```sql
SELECT b.title, COUNT(*) as total_prestamos
FROM loans l
JOIN books b ON l.book_id = b.id
GROUP BY b.id, b.title
ORDER BY total_prestamos DESC;
```

### Ingresos totales por ventas
```sql
SELECT SUM(total_amount) as ingresos_totales
FROM sales
WHERE status = 'delivered';
```
