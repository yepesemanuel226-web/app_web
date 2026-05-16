# 🚀 Ejecutar en Supabase - PASOS EXACTOS

## ✅ Credenciales ya configuradas en .env.local

Ahora solo necesitas ejecutar los scripts SQL en tu proyecto de Supabase.

---

## 📋 PASO 1: Ejecutar Schema (Crear Tablas)

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard/project/abfaliozdwlkbjiiviam

2. En el menú izquierdo, clic en **SQL Editor**

3. Clic en **"+ New query"** (arriba a la izquierda)

4. **Abre el archivo** `supabase/schema.sql` de este proyecto

5. **Copia TODO el contenido** (Ctrl+A, Ctrl+C)

6. **Pégalo** en el editor SQL de Supabase (Ctrl+V)

7. Clic en **"Run"** (botón verde abajo a la derecha, o Ctrl+Enter)

8. ✅ Deberías ver: **"Success. No rows returned"**

Esto creó:
- ✅ 7 tablas (users, books, loans, reservations, sales, notifications, mora_config)
- ✅ Índices para búsquedas rápidas
- ✅ Triggers automáticos
- ✅ Políticas de seguridad (RLS)

---

## 📋 PASO 2: Ejecutar Functions (Funciones Útiles)

1. En el mismo **SQL Editor**, clic en **"+ New query"**

2. **Abre el archivo** `supabase/functions.sql`

3. **Copia TODO el contenido**

4. **Pégalo** en el editor

5. Clic en **"Run"**

6. ✅ Deberías ver: **"Success"**

Esto creó:
- ✅ Funciones para manejar stock
- ✅ Funciones para estadísticas
- ✅ Función para procesar devoluciones
- ✅ Función para actualizar colas de reservas

---

## 📋 PASO 3: Insertar Datos de Prueba

1. **Nueva query** en SQL Editor

2. **Abre el archivo** `supabase/seed.sql`

3. **Copia TODO el contenido**

4. **Pégalo** en el editor

5. Clic en **"Run"**

6. ✅ Deberías ver: **"Success. X rows affected"** (donde X es 20+)

Esto insertó:
- ✅ 7 usuarios (1 admin, 6 usuarios)
- ✅ 6 libros de ejemplo
- ✅ 3 préstamos
- ✅ 2 reservas
- ✅ 2 ventas
- ✅ 3 notificaciones

---

## 📋 PASO 4: Crear Buckets de Storage (Para Imágenes)

### Bucket para Portadas de Libros

1. En Supabase, ve a **Storage** (menú izquierdo)

2. Clic en **"Create a new bucket"**

3. Configuración:
   - **Name**: `book-covers`
   - **Public bucket**: ✅ **ACTIVAR** (muy importante!)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: image/*

4. Clic en **"Create bucket"**

### Bucket para Avatares

1. Clic en **"Create a new bucket"** de nuevo

2. Configuración:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **ACTIVAR**
   - **File size limit**: 2 MB
   - **Allowed MIME types**: image/*

3. Clic en **"Create bucket"**

---

## 📋 PASO 5: Configurar Políticas de Storage

1. En **SQL Editor**, **nueva query**

2. Copia y ejecuta esto:

```sql
-- Permitir que todos vean las imágenes de portadas
CREATE POLICY "Public can view book covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-covers');

-- Permitir que usuarios autenticados suban portadas
CREATE POLICY "Authenticated users can upload book covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'book-covers' AND auth.role() = 'authenticated');

-- Permitir que todos vean avatares
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Permitir que usuarios suban sus avatares
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
```

---

## ✅ VERIFICAR QUE TODO FUNCIONA

### 1. Verificar Tablas Creadas

1. En Supabase, ve a **Table Editor** (menú izquierdo)

2. Deberías ver estas 7 tablas:
   - ✅ users
   - ✅ books
   - ✅ loans
   - ✅ reservations
   - ✅ sales
   - ✅ notifications
   - ✅ mora_config

3. Clic en **books**, deberías ver **6 libros**

4. Clic en **users**, deberías ver **7 usuarios**

### 2. Verificar Storage

1. Ve a **Storage**

2. Deberías ver:
   - ✅ book-covers (público)
   - ✅ avatars (público)

### 3. Probar la Aplicación

1. En tu terminal, **reinicia el servidor**:
```bash
# Presiona Ctrl+C para detener
# Luego ejecuta:
pnpm dev
```

2. Abre el navegador en `http://localhost:5173`

3. **Login de prueba**:
   - Admin: `admin@edu.co` / `admin123`
   - Usuario: `usuario@gmail.com` / `usuario123`

4. ✅ El banner amarillo de "Supabase no configurado" **debería desaparecer**

5. ✅ Los datos ahora son **reales de la base de datos**

---

## 🎉 ¡Listo!

Si completaste todos los pasos:
- ✅ Base de datos creada
- ✅ Funciones instaladas
- ✅ Datos de prueba insertados
- ✅ Storage configurado
- ✅ Aplicación conectada

---

## ❓ Problemas Comunes

### "Error: relation 'users' does not exist"
➡️ El script `schema.sql` no se ejecutó correctamente. Vuelve a ejecutarlo.

### "Error: function does not exist"
➡️ El script `functions.sql` faltó. Ejecútalo ahora.

### "No veo los libros de ejemplo"
➡️ El script `seed.sql` faltó. Ejecútalo ahora.

### "El banner sigue apareciendo"
➡️ Reinicia el servidor: Ctrl+C y luego `pnpm dev`

### "Cannot read .env"
➡️ El archivo `.env.local` ya está creado, solo reinicia el servidor.

---

## 📞 Avísame Cuando:

- ✅ Hayas ejecutado los 3 scripts SQL
- ✅ Hayas creado los 2 buckets de storage
- ✅ La app esté funcionando con datos reales

¡Y conectamos el resto de funcionalidades! 🚀
