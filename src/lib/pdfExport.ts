import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  title: string;
  dateRange?: { start: string; end: string };
  headers: string[];
  rows: any[][];
  summary?: { label: string; value: string | number }[];
}

export function exportToPDF(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Encabezado
  doc.setFontSize(20);
  doc.setTextColor(26, 58, 92); // Color #1A3A5C
  doc.text('SGB - Sistema de Gestión Bibliotecaria', pageWidth / 2, 20, { align: 'center' });

  // Título del reporte
  doc.setFontSize(16);
  doc.text(data.title, pageWidth / 2, 35, { align: 'center' });

  // Rango de fechas (si existe)
  if (data.dateRange) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Período: ${data.dateRange.start} - ${data.dateRange.end}`,
      pageWidth / 2,
      45,
      { align: 'center' }
    );
  }

  // Fecha de generación
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(`Generado el: ${new Date().toLocaleString('es-CO')}`, pageWidth / 2, 52, {
    align: 'center',
  });

  // Tabla de datos
  autoTable(doc, {
    head: [data.headers],
    body: data.rows,
    startY: 60,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 58, 92], // #1A3A5C
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 9,
      cellPadding: 5,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250], // #F5F7FA
    },
    margin: { top: 60, left: 14, right: 14 },
  });

  // Resumen (si existe)
  if (data.summary && data.summary.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 60;

    doc.setFontSize(12);
    doc.setTextColor(26, 58, 92);
    doc.text('Resumen', 14, finalY + 15);

    const summaryData = data.summary.map((item) => [item.label, String(item.value)]);

    autoTable(doc, {
      body: summaryData,
      startY: finalY + 20,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { halign: 'right', fontStyle: 'bold', textColor: [232, 160, 32] }, // #E8A020
      },
      margin: { left: 14, right: 14 },
    });
  }

  // Pie de página
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Descargar el PDF
  const fileName = `${data.title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}

// Funciones específicas para cada tipo de reporte

export function exportLoansToPDF(loans: any[], dateRange: { start: string; end: string }) {
  const data: ReportData = {
    title: 'Reporte de Préstamos',
    dateRange,
    headers: ['Período', 'Cantidad'],
    rows: loans.map((item) => [item.period, item.cantidad.toString()]),
    summary: [
      { label: 'Total de préstamos', value: loans.reduce((sum, item) => sum + item.cantidad, 0) },
    ],
  };
  exportToPDF(data);
}

export function exportPopularBooksToPDF(books: any[]) {
  const data: ReportData = {
    title: 'Libros Más Solicitados',
    headers: ['Libro', 'Solicitudes'],
    rows: books.map((item) => [item.title, item.solicitudes.toString()]),
    summary: [
      { label: 'Total de solicitudes', value: books.reduce((sum, item) => sum + item.solicitudes, 0) },
    ],
  };
  exportToPDF(data);
}

export function exportMoraUsersToPDF(users: any[]) {
  const data: ReportData = {
    title: 'Usuarios con Mora Activa',
    headers: ['Usuario', 'Email', 'Días Vencido', 'Monto Mora'],
    rows: users.map((item) => [
      item.name,
      item.email,
      item.daysOverdue.toString(),
      `$${item.moraAmount.toLocaleString('es-CO')}`,
    ]),
    summary: [
      { label: 'Total usuarios con mora', value: users.length },
      {
        label: 'Mora total acumulada',
        value: `$${users.reduce((sum, item) => sum + item.moraAmount, 0).toLocaleString('es-CO')}`,
      },
    ],
  };
  exportToPDF(data);
}

export function exportInventoryToPDF(inventory: any[]) {
  const data: ReportData = {
    title: 'Inventario Actual (Préstamo vs. Venta)',
    headers: ['Libro', 'Stock Préstamo', 'Stock Venta'],
    rows: inventory.map((item) => [item.book, item.loanStock.toString(), item.saleStock.toString()]),
    summary: [
      {
        label: 'Total libros en préstamo',
        value: inventory.reduce((sum, item) => sum + item.loanStock, 0),
      },
      {
        label: 'Total libros en venta',
        value: inventory.reduce((sum, item) => sum + item.saleStock, 0),
      },
    ],
  };
  exportToPDF(data);
}

export function exportRevenueToPDF(revenue: any[], dateRange: { start: string; end: string }) {
  const data: ReportData = {
    title: 'Ingresos por Ventas',
    dateRange,
    headers: ['Mes', 'Ingresos'],
    rows: revenue.map((item) => [item.month, `$${item.ingresos.toLocaleString('es-CO')}`]),
    summary: [
      {
        label: 'Ingresos totales',
        value: `$${revenue.reduce((sum, item) => sum + item.ingresos, 0).toLocaleString('es-CO')}`,
      },
      {
        label: 'Promedio mensual',
        value: `$${Math.round(revenue.reduce((sum, item) => sum + item.ingresos, 0) / revenue.length).toLocaleString('es-CO')}`,
      },
    ],
  };
  exportToPDF(data);
}
