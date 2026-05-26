import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { IHistoricalItem } from '../../../models/interfaces/ihistorical-item';
import { CREDIT_SITUATUION_CONFIG } from '../../../models/constants/credit-situation-config';
import { formatPeriod } from '../../../shared/utils/date-formatters';

@Injectable({
  providedIn: 'root',
})
export class ExportService {

  /**
   * Exports the historical data to an Excel file with a structured format and basic styling. The file will be named "Historial_Credito_{CUIT}.xlsx".
   * If there is no historical data, the function will simply return without doing anything.
   * The exported Excel file will contain columns for "Período", "Deuda Total (ARS)", "Situación BCRA", and "Estado" (which includes the label for the situation).  
   * @returns void
   */
  async exportToExcel(data: IHistoricalItem[], clientName: string, cuit: string, chartImageBase64?: string): Promise<void> {
    if (!data || data.length === 0) return;

    // 1. Create a new workbook and add a worksheet for the credit history data.
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Historial Crediticio');

    // Ensure gridlines are visible for better readability (Excel default is to show them, but this explicitly sets it in case the library defaults change)
    worksheet.views = [{ showGridLines: true }];

    // 2. Institutional color palette for styling (using the same blue as the header and a light gray for zebra striping)
    const institutionalBlue = 'FF002B5C';
    const white = 'FFFFFFFF';
    const grayZebra = 'FFF8F9FA';
    const borderGray = 'FFDEE2E6';

    // 3. Add Institutional Header (Titles and Client Info)
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'REPORTE HISTÓRICO DE SITUACIÓN CREDITICIA';
    titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: institutionalBlue } };

    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = 'Consulta consolidada desde la Central de Deudores (BCRA)';
    subtitleCell.font = { name: 'Segoe UI', size: 11, italic: true, color: { argb: 'FF555555' } };

    // 4. Block of Information for the Taxpayer
    const metadata = [
      { label: 'Razón Social / Denominación:', value: clientName || 'N/A' },
      { label: 'CUIT:', value: cuit || 'N/A' },
      { label: 'Fecha de emisión:', value: new Date().toLocaleDateString('es-AR') }
    ];

    metadata.forEach((item, index) => {
      const rowNum = 4 + index;
      const labelCell = worksheet.getCell(`A${rowNum}`);
      const valueCell = worksheet.getCell(`B${rowNum}`);

      labelCell.value = item.label;
      labelCell.font = { name: 'Segoe UI', size: 10, bold: true };

      valueCell.value = item.value;
      valueCell.font = { name: 'Segoe UI', size: 10 };
    });

    // 5. Add Table Headers with Styling
    const startRow = 8;

    // Styles for the header row
    worksheet.columns = [
      { header: 'Período', key: 'periodo', width: 15 },
      { header: 'Deuda Total (ARS)', key: 'deuda', width: 24 },
      { header: 'Situación BCRA', key: 'situacion', width: 18 },
      { header: 'Estado', key: 'estado', width: 25 }
    ];

    // Move the header row to the desired starting row and apply styles
    const headerRow = worksheet.getRow(startRow);
    headerRow.values = ['Mes / Año', 'Deuda Consolidada', 'Clasificación de Riesgo', 'Estado'];
    headerRow.height = 25;

    // Apply styles to header cells (background color, font, alignment, borders)
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: institutionalBlue } };
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: white } };
      cell.alignment = { vertical: 'middle', horizontal: colNumber === 2 ? 'right' : 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: borderGray } },
        bottom: { style: 'medium', color: { argb: institutionalBlue } },
        left: { style: 'thin', color: { argb: borderGray } },
        right: { style: 'thin', color: { argb: borderGray } }
      };
    });

    // 6. Load the historical data into the worksheet starting from the row below the header, applying styles and formatting for each cell
    data.forEach((item, index) => {
      const currentRowNum = startRow + 1 + index;
      const row = worksheet.getRow(currentRowNum);

      row.values = [
        formatPeriod(item.periodo),
        item.deudaTotal,
        item.situacion,
        this.getSituationLabel(item.situacion)
      ];
      row.height = 20;

      // Apply styles to each cell in the row (font, borders, alignment, zebra striping)
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.border = {
          top: { style: 'thin', color: { argb: borderGray } },
          bottom: { style: 'thin', color: { argb: borderGray } },
          left: { style: 'thin', color: { argb: borderGray } },
          right: { style: 'thin', color: { argb: borderGray } }
        };

        // Zebra striping
        if (index % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: grayZebra } };
        }

        // Alignment and specific formatting based on the column
        if (colNumber === 1) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.font = { name: 'Consolas', size: 10 };
        }
        else if (colNumber === 2) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          // Format the cell as currency with the appropriate locale settings for Argentina, ensuring it displays with the correct thousand separators and currency symbol
          cell.numFmt = '"$"#,##0';
        }
        else if (colNumber === 3) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        else if (colNumber === 4) {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        }
      });
    });

    // 7. Add the chart image below the data table, ensuring it does not overlap with the data and is properly sized and positioned
    let nextAvailableRow = startRow + data.length + 3;

    if (chartImageBase64) {
      try {
        const imageId = workbook.addImage({
          base64: chartImageBase64,
          extension: 'png',
        });

        const chartTitleCell = worksheet.getCell(`A${nextAvailableRow - 1}`);
        chartTitleCell.value = 'Gráfico de Análisis Evolutivo Histórico (Últimos 24 Meses):';
        chartTitleCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF333333' } };

        worksheet.addImage(imageId, {
          tl: { col: 0, row: nextAvailableRow },
          ext: { width: 550, height: 260 }
        });
      }
      catch (chartError) {
        console.error('No se pudo acoplar el gráfico al reporte de Excel:', chartError);
      }
    }

    // 8. Create a binary Excel file from the workbook and trigger a download in the browser with a dynamic filename that includes the client's CUIT
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const fileName = `Reporte_Crediticio_${cuit || 'Cliente'}.xlsx`;
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    window.URL.revokeObjectURL(url);
  }

  /**
   * Exports the historical data to a PDF file with a structured format and basic styling. The file will be named "Reporte_Crediticio_{CUIT}.pdf".
   * If there is no historical data, the function will simply return without doing anything.
   * The exported PDF will contain a header with the title "REPORTE HISTÓRICO DE SITUACIÓN CREDITICIA", the client's name and CUIT, a table with the historical data, and the evolution chart image appended at the end.
   * @returns void
   */
  exportToPdf(data: IHistoricalItem[], clientName: string, cuit: string, chartImageBase64?: string): void {
    if (!data || data.length === 0) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Institutional header
    doc.setFillColor(0, 43, 92); // #002b5c
    doc.rect(0, 0, 210, 35, 'F');

    // PDF Title and Client Info
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('REPORTE HISTÓRICO DE SITUACIÓN CREDITICIA', 14, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Consulta consolidada desde la Central de Deudores (BCRA)', 14, 22);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, 14, 28);

    // Client Information Section
    doc.setTextColor(33, 37, 41);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Información del Contribuyente:', 14, 48);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Razon Social / Denominación: ${clientName || 'N/A'}`, 14, 55);
    doc.text(`CUIT: ${cuit || 'N/A'}`, 14, 61);

    // Separator Line
    doc.setDrawColor(222, 226, 230);
    doc.line(14, 68, 196, 68);

    // Table Header for Historical Data
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Evolución de Períodos Informados:', 14, 76);

    // Table Body
    const tableBody = data.map(item => [
      formatPeriod(item.periodo),
      new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(item.deudaTotal),
      `${this.getSituationLabel(item.situacion)}`
    ]);

    // Render the table using autoTable
    autoTable(doc, {
      startY: 81,
      head: [['Mes / Año', 'Deuda Consolidada', 'Clasificación de Riesgo']],
      body: tableBody,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 43, 92],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: {
          cellWidth: 35,
          halign: 'left'
        },
        1: {
          cellWidth: 55,
          halign: 'right' // Alinea el contenido del body
        },
        2: {
          cellWidth: 'auto',
          halign: 'left'
        }
      },
      // Force right alignment for the "Deuda Consolidada" column in the body, while keeping the header centered
      didParseCell: (data) => {
        if (data.column.index === 1) {
          data.cell.styles.halign = 'right';
        }
      }
    });

    // Append the chart image below the table, checking if it fits on the current page and adding a new page if necessary
    if (chartImageBase64) {
      try {
        const finalY = (doc as any).lastAutoTable.finalY || 81;

        if (finalY + 85 > 275) {
          doc.addPage();
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text('Gráfico de Análisis Evolutivo:', 14, 20);
          doc.addImage(chartImageBase64, 'PNG', 14, 25, 182, 75);
        } else {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text('Gráfico de Análisis Evolutivo (Últimos 24 Meses):', 14, finalY + 12);
          doc.addImage(chartImageBase64, 'PNG', 14, finalY + 17, 182, 75);
        }
      }
      catch (error) {
        console.error('Error al intentar acoplar el gráfico al PDF:', error);
      }
    }

    // Dynamic Footer with Page Numbers
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(108, 117, 125); // grey color (#6c757d)

      // Footer Line separator
      doc.setDrawColor(230, 233, 237);
      doc.line(14, 284, 196, 284);

      // Left text (Confidentiality notice)
      doc.text('Sistema Interno de Consulta Crediticia - Confidencial', 14, 289);

      // Right text (Total pages updated safely)
      const pageText = `Página ${i} de ${totalPages}`;
      doc.text(pageText, 196, 289, { align: 'right' });
    }

    // Download the PDF file
    doc.save(`Reporte_Crediticio_${cuit || 'Cliente'}.pdf`);
  }

  /**
   * Renders the chart based on the provided historical data
   * @returns void
   */
  getSituationLabel(situation: number): string {
    return CREDIT_SITUATUION_CONFIG[situation]?.label || 'Desconocido';
  }
}
