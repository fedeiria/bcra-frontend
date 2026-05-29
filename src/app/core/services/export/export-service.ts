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

  private currentYear: number = new Date().getFullYear();

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
    const worksheet = workbook.addWorksheet('Reporte Crediticio');

    // Ensure gridlines are visible for better readability (Excel default is to show them, but this explicitly sets it in case the library defaults change)
    worksheet.views = [{ showGridLines: true }];

    // 2. Institutional color palette for styling (using the same blue as the header and a light gray for zebra striping)
    const institutionalBlue = 'FF002B5C';
    const white = 'FFFFFFFF';
    const grayZebra = 'FFF8F9FA';
    const borderGray = 'FFDEE2E6';

    // 3. Block of Information for the Taxpayer
    const metadata = [
      { label: 'Razón Social / Denominación:', value: clientName || 'N/A' },
      { label: 'CUIT:', value: cuit || 'N/A' },
      { label: 'Fecha de emisión:', value: new Date().toLocaleDateString('es-AR') }
    ];

    metadata.forEach((item, index) => {
      const rowNum = 1 + index;
      const labelCell = worksheet.getCell(`A${rowNum}`);
      const valueCell = worksheet.getCell(`B${rowNum}`);

      labelCell.value = item.label;
      labelCell.font = { name: 'Segoe UI', size: 10, bold: true };

      valueCell.value = item.value;
      valueCell.font = { name: 'Segoe UI', size: 10 };
    });

    // 5. Add Table Headers with Styling
    const startRow = 5;

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

    // 8. Add Disclaimer at the end of the report
    const disclaimerRowStart = chartImageBase64 ? nextAvailableRow + 15 : startRow + data.length + 3;
    
    const disclaimerCell = worksheet.getCell(`A${disclaimerRowStart}`);
    disclaimerCell.value = 'AVISO LEGAL Y ORIGEN DE DATOS:';
    disclaimerCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF666666' } };

    const disclaimerTextCell = worksheet.getCell(`A${disclaimerRowStart + 1}`);
    disclaimerTextCell.value = 'Este reporte es una visualización independiente de datos obtenidos a través de la API Pública del Banco Central de la República Argentina (BCRA). La información reflejada es suministrada por las entidades financieras y procesada por el BCRA. Esta plataforma no modifica ni garantiza la exactitud de los datos de origen.';
    disclaimerTextCell.font = { name: 'Segoe UI', size: 8, italic: true, color: { argb: 'FF888888' } };
    
    // Merge cells so that the text is legible across the width of the report
    worksheet.mergeCells(`A${disclaimerRowStart + 1}:D${disclaimerRowStart + 2}`);
    disclaimerTextCell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };

    // 9. Create a binary Excel file from the workbook and trigger a download in the browser with a dynamic filename that includes the client's CUIT
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
          halign: 'right'
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

    this.addFooter(doc);
    doc.save(`Reporte_Crediticio_${cuit || 'Cliente'}.pdf`);
  }

  /**
   * Export the report of a reported check to PDF.
   * @param details List of grounds for the complaint.
   * @param bankName Name of the banking entity.
   * @param bankCode Bank code.
   * @param checkNumber Check number inquired.
   */
  exportToPdfCheck(details: any[], bankName: string, bankCode: string, checkNumber: string): void {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('es-AR');

    // 1. Header
    doc.setFillColor(10, 58, 96); // #0a3a60
    doc.rect(0, 0, 210, 40, 'F');

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE CHEQUE DENUNCIADO', 14, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de consulta: ${date}`, 14, 33);

    // 2. Bank and check information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles de la Consulta:', 14, 50);

    doc.setFont('helvetica', 'normal');
    doc.text(`Banco: ${bankName} (${bankCode})`, 14, 57);
    doc.text(`Número de Cheque: ${checkNumber}`, 14, 63);

    // 3. 'Causales' table
    const tableData = details.map(d => [
      `#${d.sucursal}`,
      d.numeroCuenta,
      d.causal
    ]);

    autoTable(doc, {
      startY: 72,
      head: [['Sucursal', 'Número de Cuenta', 'Motivo de la Denuncia']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [220, 53, 69], // Red
        textColor: 255,
        halign: 'center', // Header align
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { halign: 'left' },   // 'Sucursal' with left direction
        1: { halign: 'center' }, // 'Cuenta' with center direction
        2: { halign: 'right' }  // 'Motivo' with right direction
      },
      // Force the headers of each column to follow the same alignment as the content
      didParseCell: (data) => {
        if (data.section === 'head') {
          if (data.column.index === 0) data.cell.styles.halign = 'left';
          if (data.column.index === 1) data.cell.styles.halign = 'center';
          if (data.column.index === 2) data.cell.styles.halign = 'right';
        }
      }
    });

    this.addFooter(doc);
    doc.save(`Cheque_Denunciado_${checkNumber}.pdf`);
  }

  /**
   * Add the footer with the Legal Disclaimer.
   * @returns void.
   */
  private addFooter(doc: jsPDF): void {
  const totalPages = (doc as any).internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(108, 117, 125);

    // 1. Legal Disclaimer
    const disclaimer = 'Este reporte es una visualización independiente de datos obtenidos a través de la API Pública del Banco Central de la República Argentina (BCRA). La información reflejada es suministrada por las entidades financieras y procesada por el BCRA. Esta plataforma no modifica ni garantiza la exactitud de los datos de origen.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 182);
    doc.text(splitDisclaimer, 14, 278);

    // 2. Separator line
    doc.setDrawColor(230, 233, 237);
    doc.line(14, 284, 196, 284);

    // 3. Left text (Copyright)
    doc.setFontSize(8);
    doc.text('BCRA Consultas - Plataforma Integral Crediticia © ' + this.currentYear, 14, 289);

    // 4. Right text (Pagination)
    const pageText = `Página ${i} de ${totalPages}`;
    doc.text(pageText, 196, 289, { align: 'right' });
  }
}

  /**
   * Renders the chart based on the provided historical data
   * @returns void
   */
  getSituationLabel(situation: number): string {
    return CREDIT_SITUATUION_CONFIG[situation]?.label || 'Desconocido';
  }
}