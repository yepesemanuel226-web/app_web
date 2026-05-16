# ✅ Checklist de Configuración Supabase

Marca cada paso cuando lo completes:

## 🗄️ Base de Datos

- [ ] **Script 1**: Ejecutar `schema.sql` en SQL Editor
  - Resultado esperado: "Success. No rows returned"
  - Crea: 7 tablas + triggers + RLS

- [ ] **Script 2**: Ejecutar `functions.sql` en SQL Editor
  - Resultado esperado: "Success"
  - Crea: 8 funciones SQL

- [ ] **Script 3**: Ejecutar `seed.sql` en SQL Editor
  - Resultado esperado: "Success. X rows affected"
  - Inserta: 7 usuarios + 6 libros + datos de ejemplo

- [ ] **Verificar**: Ir a Table Editor → books → Ver 6 libros
- [ ] **Verificar**: Ir a Table Editor → users → Ver 7 usuarios

---

## 💾 Storage (Imágenes)

- [ ] **Bucket 1**: Crear `book-covers` (público ✅)
- [ ] **Bucket 2**: Crear `avatars` (público ✅)
- [ ] **Políticas**: Ejecutar script de políticas de storage

---

## 🔧 Aplicación

- [ ] **Variables**: `.env.local` ya está creado ✅
- [ ] **Reiniciar**: Ctrl+C y luego `pnpm dev`
- [ ] **Probar**: Login con `admin@edu.co` / `admin123`
- [ ] **Verificar**: Banner amarillo debe desaparecer

---

## 🎯 Resultado Final

Si todos los checkboxes están marcados:
- ✅ La aplicación usa datos reales de Supabase
- ✅ Puedes crear préstamos, ventas, etc.
- ✅ Las estadísticas son reales
- ✅ Todo funciona conectado a la BD

---

## 📊 Estado Actual

**Completados:** _____ / 11

**Falta:**
- Ejecutar scripts SQL
- Crear buckets
- Reiniciar servidor
