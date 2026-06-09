import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { CreditReportService } from '../../core/services/credit-report/credit-report-service';
import { Spinner } from "../../shared/components/spinner/spinner";
import { Header } from "../../shared/components/header/header";
import { Footer } from '../../shared/components/footer/footer';
import { HistoryChart } from './components/history-chart/history-chart';
import { MetricCards } from './components/metric-cards/metric-cards';
import { RejectedChecks } from './components/rejected-checks/rejected-checks';
import { EntityDetails } from './components/entity-details/entity-details';

import { ICreditSummary } from '../../models/interfaces/icredit-summary';
import { IHistoricalItem } from '../../models/interfaces/ihistorical-item';
import { IBatchItem } from '../../models/interfaces/ibatch-item';

import { getSituationClass, getSituationLabel } from '../../shared/utils/credit-formatters.util';

@Component({
  selector: 'app-credit-report',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner, Header, Footer, HistoryChart, MetricCards, RejectedChecks, EntityDetails],
  templateUrl: './credit-report.html',
  styleUrl: './credit-report.scss',
})
export class CreditReport {

  cuit: string = '';
  loading: boolean = false;
  
  result: ICreditSummary | null = null;
  errorMessage: string | null = null;
  errorType: 'warning' | 'danger' | null = null;
  historicalData: IHistoricalItem[] = [];

  isBatchMode: boolean = false;
  resultsArray: IBatchItem[] = [];

  constructor(private creditReportService: CreditReportService) { }

  getSituationClass = getSituationClass;
  getSituationLabel = getSituationLabel;

  /**
   * Executes a query based on the CUIT entered by the user.
   * @returns void.
   */
  consult(): void {
    const cuits = this.getCleanCuits();

    if (cuits.length === 0 || !this.isValidCuit()) {
      this.errorMessage = 'Formato de CUIT inválido. Use 11 dígitos numéricos.';
      this.errorType = 'warning';
      return;
    }

    if (cuits.length > 5) {
      this.errorMessage = 'El límite máximo es de 5 CUITs por consulta.';
      this.errorType = 'warning';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.errorType = null;
    this.isBatchMode = cuits.length > 1;

    this.isBatchMode ? this.executeBatchConsult(cuits) : this.executeSingleConsult(cuits[0]);
  }

  /**
   * Performs a simple query of the CUIT entered by the user.
   * @param cuit The CUIT entered by the user.
   * @returns Promise<void>.
   */
  private async executeSingleConsult(cuit: string): Promise<void> {
    this.result = null;
    this.historicalData = [];

    try {
      const [summaryRes, historyRes] = await Promise.all([
        firstValueFrom(this.creditReportService.getCreditSummary(cuit)),
        firstValueFrom(this.creditReportService.getHistoricalEvolution(cuit))
      ]);

      if (summaryRes.error) {
        this.errorMessage = summaryRes.message ?? 'Error desconocido';
        this.errorType = summaryRes.type as 'warning' | 'danger';
        return; 
      }

      this.result = summaryRes.data ?? null;
      let history: IHistoricalItem[] = historyRes.data ?? [];

      if (this.result) {
        const currentPeriod = this.result.periodo;
        const alreadyExists = history.some((h: IHistoricalItem) => h.periodo === currentPeriod);

        if (!alreadyExists) {
          history.push({
            periodo: currentPeriod,
            deudaTotal: this.result?.deudaTotal ?? 0,
            situacion: this.result?.situacion ?? 1,
            isCurrent: true
          });
        }
        history.sort((a, b) => Number(b.periodo) - Number(a.periodo));
      }

      this.historicalData = history;
      this.cuit = '';
    }
    catch (error) {
      this.handleConnectionError();
      
    }
    finally {
      this.loading = false;
    }
  }

  /**
   * Execute a batch of CUITs.
   * @param cuits The batch of CUITs.
   * @returns Promise<void>.
   */
  private async executeBatchConsult(cuits: string[]): Promise<void> {
    this.resultsArray = [];

    try {
      const responses = await firstValueFrom(this.creditReportService.getBatchCreditSummary(cuits));

      this.resultsArray = responses.map((res, index) => ({
        cuit: cuits[index],
        denominacion: res.data?.denominacion,
        success: !res.error,
        data: res.data ?? null,
        errorMessage: res.error ? (res.message || 'Error en la consulta') : null,
        showDetail: false,
        loadingHistory: false,
        historicalData: [],
        historyError: null
      }));

      const allFailed = this.resultsArray.length > 0 && this.resultsArray.every(r => !r.success);

      if (allFailed) {
        this.errorMessage = 'No se pudo obtener información de los CUITs solicitados. La conexión con el API del BCRA fue interrumpida.';
        this.errorType = 'danger';
        this.resultsArray = [];
      }
    }
    catch (error) {
      this.handleConnectionError();
      
    }
    finally {
      this.loading = false;
    }
  }

  /**
   * Show or hide the CUIT detail.
   * @param item The item of the Batch.
   * @returns Promise<void> 
   */
  async toggleDetail(item: any): Promise<void> {
    item.showDetail = !item.showDetail;

    if (!item.showDetail || item.historicalData.length > 0 || item.loadingHistory) {
      return;
    }

    item.loadingHistory = true;
    item.historyError = null;

    try {
      const response = await firstValueFrom(this.creditReportService.getHistoricalEvolution(item.cuit));

      let history: IHistoricalItem[] = response.data ?? [];

      if (item.data) {
        const currentPeriod = item.data.periodo;
        const alreadyExists = history.some((h: IHistoricalItem) => h.periodo === currentPeriod);

        if (!alreadyExists) {
          history.push({
            periodo: currentPeriod,
            deudaTotal: item.data.deudaTotal ?? 0,
            situacion: item.data.situacion ?? 1,
            isCurrent: true
          });
        }
        history.sort((a, b) => Number(b.periodo) - Number(a.periodo));
      }

      item.historicalData = history;
    }
    catch (error) {
      console.error(`Error obteniendo historial para ${item.cuit}:`, error);

      item.historicalData = [];
      item.historyError = 'No se pudo cargar el historial en este momento.';
    }
    finally {
      item.loadingHistory = false;
    }
  }

  /**
   * Handler for connections errors with the API.
   * @returns void.
   */
  private handleConnectionError(): void {
    this.errorMessage = 'No se pudo establecer comunicación con la pasarela de servicios.';
    this.errorType = 'danger';
    this.loading = false;
  }

  /**
   * Get a valid CUIT.
   * @returns A string with the valid CUIT/CUITs.
   */
  private getCleanCuits(): string[] {
    return this.cuit.split(/[\s,]+/).filter(c => c.length > 0);
  }

  /**
   * Check if the entered CUIT is a valid CUIT. 
   * @returns True or false.
   */
  isValidCuit(): boolean {
    const cuits = this.getCleanCuits();
    return cuits.length > 0 && cuits.every(c => /^\d{11}$/.test(c));
  }

  /**
   * Event that validates the CUIT entry and limits it to 5 CUITs.
   * @param event The event triggered.
   */
  onCuitInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    // 1. replace any commas with spaces and leave only numbers and spaces
    let sanitizedValue = input.value.replace(/,/g, ' ').replace(/[^0-9\s]/g, '');
    
    // 2. normalize multiple consecutive spaces to a single space
    sanitizedValue = sanitizedValue.replace(/\s+/g, ' ');

    // 3. split the string by spaces to analyze the individual CUITs.
    let cuits = sanitizedValue.split(' ');

    // 4. if the array has more than 5 elements, I trim it.
    if (cuits.length > 5) {
      cuits = cuits.slice(0, 5);
      sanitizedValue = cuits.join(' ');
    }

    // 5. update the component variable and force the value into the input
    this.cuit = sanitizedValue;
    input.value = this.cuit; 
  }
}