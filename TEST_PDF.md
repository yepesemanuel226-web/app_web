# 🧪 Probar Exportación a PDF

## Cómo probar que los PDFs funcionan:

### Opción 1: Desde la Interfaz (Recomendado)

1. Inicia la aplicación:
```bash
pnpm dev
```

2. Abre el navegador en `http://localhost:5173`

3. Inicia sesión como admin:
   - Email: `admin@edu.co`
   - Password: `admin123`

4. Ve a **Reportes** (en el menú lateral)

5. Selecciona cualquier pestaña:
   - Préstamos por período
   - Libros más solicitados
   - Usuarios con mora
   - Inventario actual
   - Ingresos por ventas

6. Haz clic en el botón **"PDF"** (arriba a la derecha)

7. ✅ Debería descargarse un archivo PDF con:
   - Encabezado "SGB - Sistema de Gestión Bibliotecaria"
   - Título del reporte
   - Tabla con los datos
   - Resumen al final
   - Número de página

### Opción 2: Desde la Consola (Para debugging)

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Importar la función
import { exportLoansToPDF } from './src/lib/pdfExport';

// Datos de ejemplo
const testData = [
  { period: 'Semana 1', cantidad: 24 },
  { period: 'Semana 2', cantidad: 32 },
  { period: 'Semana 3', cantidad: 28 }
];

// Exportar
exportLoansToPDF(testData, { start: '2026-04-01', end: '2026-05-08' });
```

## ✅ Qué Esperar

El PDF generado debe tener:

1. **Encabezado azul marino** con el logo SGB
2. **Título del reporte** centrado
3. **Rango de fechas** (si aplica)
4. **Tabla con datos** con:
   - Encabezado azul (#1A3A5C)
   - Filas alternadas (gris claro)
   - Texto bien formateado
5. **Sección de resumen** al final
6. **Pie de página** con número de página

## 🎨 Personalización del PDF

Si quieres cambiar el diseño del PDF, edita:
`src/lib/pdfExport.ts`

Opciones de personalización:
- Colores de encabezado
- Fuentes y tamaños
- Márgenes
- Contenido del encabezado/pie de página

## 📊 Tipos de Reportes Disponibles

1. **Préstamos por período**: Lista de préstamos en un rango de fechas
2. **Libros más solicitados**: Top de libros con más solicitudes
3. **Usuarios con mora**: Usuarios con pagos pendientes
4. **Inventario actual**: Stock de préstamos vs ventas
5. **Ingresos por ventas**: Análisis financiero mensual

Cada uno genera un PDF con formato específico.
