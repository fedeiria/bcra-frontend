import { Component, Input, ElementRef, ViewChild, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

import { IHistoricalItem } from '../../../../models/interfaces/ihistorical-item';
import { ExportService } from '../../../../core/services/export-data/export-service';

import { formatPeriod } from '../../../../shared/utils/date-formatters.util';
import { getSituationClass, getSituationLabel } from '../../../../shared/utils/credit-formatters.util';

Chart.register(...registerables);

@Component({
  selector: 'app-history-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-chart.html',
  styleUrl: './history-chart.scss',
})
export class HistoryChart implements OnChanges, OnDestroy {

  @Input() historyData: IHistoricalItem[] = [];
  @Input() clientName: string = '';
  @Input() clientCuit: string = '';

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  constructor(private exportService: ExportService) { }

  // Executes everytime when the input data changes, which is when the parent component fetches new historical data
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['historyData'] && this.historyData && this.historyData.length > 0) {
      // Add a slight delay to ensure the canvas element is rendered before trying to access it
      setTimeout(() => this.renderChart(), 50);
    }
  }

  /**
   * Get the chart in Base64 format
   * @returns string | undefined
   */
  private getChartBase64(): string | undefined {
    if (this.chartCanvas && this.chartCanvas.nativeElement) {
      return this.chartCanvas.nativeElement.toDataURL('image/png', 1.0);
    }
    return undefined;
  }

  /**
   * Call the formatPeriod method
   */
  formatPeriod = formatPeriod;

  /**
   * Get the situation class from method getSituationClass
   */
  getSituationClass = getSituationClass;

  /**
   * Get the situation label from method getSituationLabel
   */
  getSituationLabel = getSituationLabel;

  /**
   * Generates the template chart
   * @returns void
   */
  private renderChart(): void {
    if (!this.chartCanvas) {
        setTimeout(() => this.renderChart(), 50);
        return;
    }
    
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) return;
    if (!this.historyData || this.historyData.length === 0) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const orderedData = [...this.historyData].reverse();
    const labels = orderedData.map(item => formatPeriod(item.periodo)); 
    const debts = orderedData.map(item => item.deudaTotal);

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Evolución de Deuda ($)',
          data: debts,
          borderColor: '#002b5c',
          backgroundColor: 'rgba(0, 43, 92, 0.05)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#ffc107',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 750
        },
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#eaeaea' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  /**
   * Download the history chart data in Excel format
   * @returns Promise<vosd>
   */
  async exportToExcel(): Promise<void> {
    const base64 = this.getChartBase64();
    await this.exportService.exportToExcel(this.historyData, this.clientName, this.clientCuit, base64);
  }

  /**
   * Download the history chart data in PDF format
   * @returns Promise<vosd>
   */
  exportToPdf(): void {
    const base64 = this.getChartBase64();
    this.exportService.exportToPdf(this.historyData, this.clientName, this.clientCuit, base64);
  }

  /**
   * Destroy the component
   */
  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy;
    }
  }
}