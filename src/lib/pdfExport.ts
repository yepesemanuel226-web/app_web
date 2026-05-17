import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Paleta
const C = {
  navy:      [26,  58,  92]  as [number, number, number],
  gold:      [232, 160,  32] as [number, number, number],
  goldLight: [255, 213, 102] as [number, number, number],
  gray:      [100, 110, 125] as [number, number, number],
  grayLight: [240, 243, 247] as [number, number, number],
  rowAlt:    [248, 250, 252] as [number, number, number],
  white:     [255, 255, 255] as [number, number, number],
  green:     [40,  167,  69] as [number, number, number],
  red:       [210,  50,  50] as [number, number, number],
  line:      [210, 218, 228] as [number, number, number],
};

interface CellValue {
  text: string;
  color?: [number, number, number];
  bold?: boolean;
}

interface ReportData {
  title: string;
  dateRange?: { start: string; end: string };
  headers: string[];
  colWidths?: number[];
  rows: (string | CellValue)[][];
  summary?: { label: string; value: string | number; color?: [number, number, number] }[];
  stats?: { label: string; value: string | number; color?: [number, number, number] }[];
}

// ─── Header ───────────────────────────────────────────────────────────────────
function drawHeader(doc: jsPDF, data: ReportData): number {
  const W = doc.internal.pageSize.getWidth();

  // Banda navy
  doc.setFillColor(...C.navy);
  doc.rect(0, 0, W, 22, 'F');

  // Linea dorada
  doc.setFillColor(...C.gold);
  doc.rect(0, 22, W, 2.5, 'F');

  // Nombre sistema
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.white);
  doc.text('SGB - Sistema de Gestion Bibliotecaria', W / 2, 11, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.goldLight);
  doc.text('Reporte oficial del sistema', W / 2, 18, { align: 'center' });

  // Titulo reporte
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...C.navy);
  doc.text(data.title, W / 2, 36, { align: 'center' });

  let y = 44;

  // Periodo
  if (data.dateRange) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.gray);
    doc.text(
      'Periodo: ' + data.dateRange.start + ' al ' + data.dateRange.end,
      W / 2, y, { align: 'center' }
    );
    y += 6;
  }

  // Fecha generacion
  doc.setFontSize(7.5);
  doc.setTextColor(170, 170, 170);
  doc.text('Generado el: ' + new Date().toLocaleString('es-CO'), W / 2, y, { align: 'center' });

  return y + 6;
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────
function drawStats(
  doc: jsPDF,
  stats: { label: string; value: string | number; color?: [number, number, number] }[],
  y: number
): number {
  const W = doc.internal.pageSize.getWidth();
  const margin = 14;
  const gap = 3;
  const n = stats.length;
  const cardW = (W - margin * 2 - gap * (n - 1)) / n;
  const cardH = 16;

  stats.forEach((s, i) => {
    const x = margin + i * (cardW + gap);
    const col = s.color ?? C.navy;

    // Fondo card
    doc.setFillColor(...C.grayLight);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'F');

    // Barra lateral coloreada
    doc.setFillColor(...col);
    doc.roundedRect(x, y, 3, cardH, 1, 1, 'F');

    // Valor
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...col);
    doc.text(String(s.value), x + cardW / 2 + 1.5, y + 8.5, { align: 'center' });

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.gray);
    doc.text(s.label, x + cardW / 2 + 1.5, y + 13.5, { align: 'center' });
  });

  return y + cardH + 5;
}

// ─── Tabla ────────────────────────────────────────────────────────────────────
function drawTable(doc: jsPDF, data: ReportData, startY: number): number {
  const W = doc.internal.pageSize.getWidth();

  const bodyRows = data.rows.map((row) =>
    row.map((cell) => (typeof cell === 'string' ? cell : cell.text))
  );

  autoTable(doc, {
    head: [data.headers],
    body: bodyRows,
    startY,
    theme: 'grid',
    tableWidth: W - 28,
    margin: { left: 14, right: 14, bottom: 18 },
    headStyles: {
      fillColor: C.navy,
      textColor: C.white,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
    },
    columnStyles: data.colWidths
      ? Object.fromEntries(data.colWidths.map((w, i) => [i, { cellWidth: w }]))
      : {},
    styles: {
      fontSize: 7.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
      textColor: [50, 60, 75] as [number, number, number],
      lineColor: C.line,
      lineWidth: 0.2,
    },
    alternateRowStyles: { fillColor: C.rowAlt },
    didParseCell(hook) {
      const raw = data.rows[hook.row.index]?.[hook.column.index];
      if (raw && typeof raw === 'object') {
        if (raw.color) hook.cell.styles.textColor = raw.color;
        if (raw.bold)  hook.cell.styles.fontStyle  = 'bold';
      }
    },
    didDrawPage(hookData) {
      // Solo en paginas adicionales (pag 2 en adelante)
      if (hookData.pageNumber === 1) return;
      doc.setFillColor(...C.navy);
      doc.rect(0, 0, W, 9, 'F');
      doc.setFillColor(...C.gold);
      doc.rect(0, 9, W, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(...C.white);
      doc.text('SGB  -  ' + data.title, W / 2, 6.5, { align: 'center' });
    },
  });

  return (doc as any).lastAutoTable.finalY as number;
}

// ─── Resumen ──────────────────────────────────────────────────────────────────
function drawSummary(
  doc: jsPDF,
  summary: { label: string; value: string | number; color?: [number, number, number] }[],
  afterY: number
) {
  const W = doc.internal.pageSize.getWidth();
  const m = 14;
  const H = doc.internal.pageSize.getHeight();
  const rowH = 8.5;
  const needed = summary.length * rowH + 22;

  if (afterY + needed > H - 18) {
    doc.addPage();
    afterY = 18;
  }

  // Titulo seccion
  doc.setFillColor(...C.navy);
  doc.rect(m, afterY + 7, 3, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.navy);
  doc.text('Resumen', m + 6, afterY + 14);

  // Linea separadora
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.3);
  doc.line(m, afterY + 18, W - m, afterY + 18);

  let y = afterY + 22;
  summary.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(...C.grayLight);
      doc.rect(m, y - 3, W - m * 2, rowH, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.navy);
    doc.text(item.label, m + 4, y + 2.5);

    doc.setTextColor(...(item.color ?? C.gold));
    doc.text(String(item.value), W - m - 4, y + 2.5, { align: 'right' });
    y += rowH;
  });
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function drawFooter(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const total = (doc as any).internal.getNumberOfPages();

  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFillColor(...C.grayLight);
    doc.rect(0, H - 11, W, 11, 'F');
    doc.setFillColor(...C.gold);
    doc.rect(0, H - 11, 3, 11, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.gray);
    doc.text('SGB - Documento generado automaticamente', m(8), H - 4.5);
    doc.text('Pagina ' + i + ' de ' + total, W - m(8), H - 4.5, { align: 'right' });
  }
}
const m = (v: number) => v; // alias para legibilidad

// ─── Export principal ─────────────────────────────────────────────────────────
export function exportToPDF(data: ReportData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = drawHeader(doc, data);
  if (data.stats?.length) y = drawStats(doc, data.stats, y);
  const finalY = drawTable(doc, data, y);
  if (data.summary?.length) drawSummary(doc, data.summary, finalY);
  drawFooter(doc);
  doc.save(data.title.replace(/\s+/g, '_') + '_' + Date.now() + '.pdf');
}

// ════════════════════════════════════════════════════════════════════════════════
// Funciones por reporte
// ════════════════════════════════════════════════════════════════════════════════

export function exportLoansToPDF(loans: any[], dateRange: { start: string; end: string }) {
  const weeks: Record<string, number> = {};
  loans.forEach((l) => {
    const d = new Date(l.created_at);
    const wk = Math.ceil(d.getDate() / 7);
    const key = d.toLocaleString('es-CO', { month: 'short' }) + ' S' + wk;
    weeks[key] = (weeks[key] || 0) + 1;
  });

  const activos   = loans.filter((l) => l.status === 'active').length;
  const vencidos  = loans.filter((l) => l.status === 'overdue').length;
  const devueltos = loans.filter((l) => l.status === 'returned').length;

  exportToPDF({
    title: 'Reporte de Prestamos',
    dateRange,
    stats: [
      { label: 'Total',     value: loans.length, color: C.navy  },
      { label: 'Activos',   value: activos,       color: C.green },
      { label: 'Vencidos',  value: vencidos,      color: C.red   },
      { label: 'Devueltos', value: devueltos,      color: C.gray  },
    ],
    headers: ['Periodo', 'Cantidad'],
    colWidths: [140, 38],
    rows: Object.entries(weeks).map(([period, cantidad]) => [
      period,
      { text: String(cantidad), bold: true, color: C.navy },
    ]),
    summary: [
      { label: 'Total de prestamos', value: loans.length },
      { label: 'Activos',            value: activos,  color: C.green },
      { label: 'Vencidos',           value: vencidos, color: C.red   },
      { label: 'Devueltos',          value: devueltos },
    ],
  });
}

export function exportPopularBooksToPDF(books: any[]) {
  exportToPDF({
    title: 'Libros Mas Solicitados',
    stats: [
      { label: 'Titulos',         value: books.length },
      { label: 'Total prestamos', value: books.reduce((s, b) => s + (b.loans_count || 0), 0), color: C.gold },
    ],
    headers: ['#', 'Titulo', 'Autor', 'Categoria', 'Prestamos', 'Stock'],
    colWidths: [8, 60, 44, 30, 20, 16],
    rows: books.map((b, i) => [
      String(i + 1),
      { text: b.title ?? '', bold: true },
      b.author ?? '',
      b.category ?? '',
      { text: String(b.loans_count ?? 0), bold: true, color: C.gold },
      { text: String(b.stock_loan ?? 0), color: (b.stock_loan ?? 0) === 0 ? C.red : C.green },
    ]),
    summary: [
      { label: 'Total titulos',             value: books.length },
      { label: 'Prestamos acumulados',      value: books.reduce((s, b) => s + (b.loans_count || 0), 0) },
    ],
  });
}

export function exportMoraUsersToPDF(users: any[]) {
  const totalMora = users.reduce((s, u) => s + (u.mora_amount || 0), 0);
  exportToPDF({
    title: 'Usuarios con Mora Activa',
    stats: [
      { label: 'En mora',      value: users.length,                                                                   color: C.red  },
      { label: 'Mora total',   value: '$' + totalMora.toLocaleString('es-CO'),                                        color: C.red  },
      { label: 'Promedio',     value: users.length ? '$' + Math.round(totalMora / users.length).toLocaleString('es-CO') : '$0', color: C.gray },
    ],
    headers: ['Usuario', 'Email', 'Libro', 'Vencio el', 'Dias', 'Mora'],
    colWidths: [32, 44, 40, 22, 13, 22],
    rows: users.map((u) => [
      { text: u.name ?? '',   bold: true, color: C.navy },
      u.email ?? '',
      u.bookTitle ?? '',
      { text: u.due_date ?? '',                                    color: C.red },
      { text: String(u.daysOverdue ?? 0),                          color: C.red, bold: true },
      { text: '$' + (u.mora_amount || 0).toLocaleString('es-CO'), color: C.red, bold: true },
    ]),
    summary: [
      { label: 'Total usuarios con mora',   value: users.length,                                                                   color: C.red },
      { label: 'Mora total acumulada',      value: '$' + totalMora.toLocaleString('es-CO'),                                        color: C.red },
      { label: 'Promedio mora por usuario', value: users.length ? '$' + Math.round(totalMora / users.length).toLocaleString('es-CO') : '$0' },
    ],
  });
}

export function exportInventoryToPDF(inventory: any[]) {
  const totalLoan = inventory.reduce((s, b) => s + (b.stock_loan || 0), 0);
  const totalSale = inventory.reduce((s, b) => s + (b.stock_sale || 0), 0);
  const sinStock  = inventory.filter((b) => (b.stock_loan ?? 0) === 0).length;

  exportToPDF({
    title: 'Inventario Actual',
    stats: [
      { label: 'Titulos',        value: inventory.length },
      { label: 'Stock prestamo', value: totalLoan, color: C.navy },
      { label: 'Stock venta',    value: totalSale, color: C.gold },
      { label: 'Sin stock',      value: sinStock,  color: sinStock > 0 ? C.red : C.green },
    ],
    headers: ['Titulo', 'Autor', 'Categoria', 'Stk. Prest.', 'Stk. Venta', 'Precio'],
    colWidths: [52, 36, 28, 20, 20, 22],
    rows: inventory.map((b) => [
      { text: b.title ?? '', bold: true },
      b.author ?? '',
      b.category ?? '',
      { text: String(b.stock_loan ?? 0), color: (b.stock_loan ?? 0) === 0 ? C.red : C.green, bold: (b.stock_loan ?? 0) === 0 },
      { text: String(b.stock_sale ?? 0), color: C.gold },
      b.sale_price ? '$' + Number(b.sale_price).toLocaleString('es-CO') : '-',
    ]),
    summary: [
      { label: 'Total titulos',            value: inventory.length },
      { label: 'Total libros en prestamo', value: totalLoan },
      { label: 'Total libros en venta',    value: totalSale },
      { label: 'Titulos sin stock',         value: sinStock, color: sinStock > 0 ? C.red : C.green },
    ],
  });
}

export function exportRevenueToPDF(sales: any[], dateRange: { start: string; end: string }) {
  const total      = sales.reduce((s, sale) => s + (sale.total_amount || 0), 0);
  const entregadas = sales.filter((s) => s.status === 'delivered').length;
  const pendientes = sales.filter((s) => s.status === 'pending').length;

  exportToPDF({
    title: 'Ingresos por Ventas',
    dateRange,
    stats: [
      { label: 'Ventas',      value: sales.length },
      { label: 'Ingresos',    value: '$' + total.toLocaleString('es-CO'), color: C.green },
      { label: 'Entregadas',  value: entregadas, color: C.green },
      { label: 'Pendientes',  value: pendientes, color: pendientes > 0 ? C.gold : C.gray },
    ],
    headers: ['Fecha', 'Usuario', 'Libro', 'Cant.', 'Total', 'Estado'],
    colWidths: [22, 36, 52, 11, 28, 22],
    rows: sales.map((s) => {
      const estado = s.status === 'delivered' ? 'Entregado' : s.status === 'pending' ? 'Pendiente' : 'Cancelado';
      const col: [number,number,number] = s.status === 'delivered' ? C.green : s.status === 'pending' ? C.gold : C.red;
      return [
        s.sale_date ?? '',
        s.user?.name ?? '',
        s.book?.title ?? '',
        String(s.quantity ?? 1),
        { text: '$' + (s.total_amount || 0).toLocaleString('es-CO'), bold: true, color: C.green },
        { text: estado, color: col, bold: true },
      ];
    }),
    summary: [
      { label: 'Total de ventas',    value: sales.length },
      { label: 'Ingresos totales',   value: '$' + total.toLocaleString('es-CO'), color: C.green },
      { label: 'Promedio por venta', value: sales.length ? '$' + Math.round(total / sales.length).toLocaleString('es-CO') : '$0' },
      { label: 'Ventas entregadas',  value: entregadas, color: C.green },
      { label: 'Ventas pendientes',  value: pendientes, color: pendientes > 0 ? C.gold : C.gray },
    ],
  });
}