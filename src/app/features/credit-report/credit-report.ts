import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

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
import { IBatchResult } from '../../models/interfaces/ibatch-result';

@Component({
  selector: 'app-credit-report',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner, Header, Footer, HistoryChart, MetricCards, RejectedChecks, EntityDetails],
  templateUrl: './credit-report.html',
  styleUrl: './credit-report.scss',
})
export class CreditReport {

  cuit = signal<string>('');
  loading = signal<boolean>(false);
  result = signal<ICreditSummary | null>(null);
  errorMessage = signal<string | null>(null);
  errorType = signal<'warning' | 'danger' | null>(null);
  historicalData = signal<IHistoricalItem[]>([]);
  resultsArray = signal<IBatchItem[]>([]);

  private readonly creditReportService = inject(CreditReportService);

  readonly getSituationClass = getSituationClass;
  readonly getSituationLabel = getSituationLabel;

  // Computed signals
  cleanCuits = computed(() => this.cuit().split(/[\s,]+/).filter(c => c.length > 0));

  isValidCuit = computed(() => {
    const cuits = this.cleanCuits();
    return cuits.length > 0 && cuits.every(c => /^\d{11}$/.test(c));
  });

  isBatchMode = computed(() => this.cleanCuits().length > 1);
  
  /**
   * Executes a query based on the CUIT entered by the user.
   * @returns void.
   */
  consult(): void {
    const cuits = this.cleanCuits();

    if (cuits.length === 0 || !this.isValidCuit()) {
      this.setError('Formato de CUIT inválido. Use 11 dígitos numéricos.', 'warning');
      return;
    }

    if (cuits.length > 5) {
      this.setError('El límite máximo es de 5 CUITs por consulta.', 'warning');
      return;
    }

    this.resetState();
    this.loading.set(true);

    this.isBatchMode() ? this.executeBatchConsult(cuits) : this.executeSingleConsult(cuits[0]);
  }

  /**
   * Performs a simple query of the CUIT entered by the user.
   * @param cuit The CUIT entered by the user.
   * @returns Promise<void>.
   */
  private async executeSingleConsult(cuit: string): Promise<void> {
    try {
      const [summaryData, historyData] = await Promise.all([
        firstValueFrom(this.creditReportService.getCreditSummary(cuit)),
        firstValueFrom(this.creditReportService.getHistoricalEvolution(cuit))
      ]);

      this.result.set(summaryData);
      
      let history = historyData || [];
      const alreadyExists = history.some(h => h.periodo === summaryData.periodo);
      
      if (!alreadyExists) {
        history.push({
          periodo: summaryData.periodo,
          deudaTotal: summaryData.deudaTotal ?? 0,
          situacion: summaryData.situacion ?? 1,
          isCurrent: true
        });
      }
      history.sort((a, b) => Number(b.periodo) - Number(a.periodo));
      
      this.historicalData.set(history);
      this.cuit.set('');

    }
    catch (error: unknown) {
      this.handleHttpError(error);
    }
    finally {
      this.loading.set(false);
    }
  }

  /**
   * Execute a batch of CUITs.
   * @param cuits The batch of CUITs.
   * @returns Promise<void>.
   */
  private async executeBatchConsult(cuits: string[]): Promise<void> {
    try {
      const responses: IBatchResult[] = await firstValueFrom(this.creditReportService.getBatchCreditSummary(cuits));
      
      const batchItems: IBatchItem[] = responses.map((res) => {
        const isError = 'error' in res;
        
        return {
          cuit: isError ? res.cuit : res.cuit,
          denominacion: isError ? undefined : res.denominacion,
          success: !isError,
          data: isError ? null : res,
          errorMessage: isError ? res.message : null,
          showDetail: false,
          loadingHistory: false,
          historicalData: [],
          historyError: null
        };
      });

      const allFailed = batchItems.length > 0 && batchItems.every(r => !r.success);
      if (allFailed) {
        this.setError('Ninguno de los CUITs ingresados registra información activa.', 'warning');
      } 
      
      this.resultsArray.set(batchItems);
    }
    catch (error: unknown) {
      this.handleHttpError(error);
    }
    finally {
      this.loading.set(false);
    }
  }

  /**
   * Show or hide the CUIT detail.
   * @param item The item of the Batch.
   * @returns Promise<void> 
   */
  async toggleDetail(itemCuit: string): Promise<void> {
    const item = this.resultsArray().find(i => i.cuit === itemCuit);
    if (!item) return;

    this.updateBatchItem(itemCuit, { showDetail: !item.showDetail });

    if (!item.showDetail || item.historicalData.length > 0 || item.loadingHistory) return;

    this.updateBatchItem(itemCuit, { loadingHistory: true, historyError: null });

    try {
      const historyData = await firstValueFrom(this.creditReportService.getHistoricalEvolution(itemCuit));
      let history = historyData || [];

      if (item.data) {
        const alreadyExists = history.some(h => h.periodo === item.data!.periodo);
        if (!alreadyExists) {
          history.push({
            periodo: item.data.periodo,
            deudaTotal: item.data.deudaTotal,
            situacion: item.data.situacion,
            isCurrent: true
          });
        }
        history.sort((a, b) => Number(b.periodo) - Number(a.periodo));
      }

      this.updateBatchItem(itemCuit, { historicalData: history });
    }
    catch {
      this.updateBatchItem(itemCuit, { 
        historicalData: [], 
        historyError: 'No se puede cargar el historial en este momento.' 
      });
    }
    finally {
      this.updateBatchItem(itemCuit, { loadingHistory: false });
    }
  }

  /**
   * Reset properties.
   * @returns void.
   */
  private resetState(): void {
    this.result.set(null);
    this.historicalData.set([]);
    this.resultsArray.set([]);
    this.errorMessage.set(null);
    this.errorType.set(null);
  }

  /**
   * Event that validates the CUIT entry and limits it to 5 CUITs.
   * @param event The event triggered.
   */
  onCuitChange(value: string): void {
    let sanitizedValue = value.replace(/,/g, ' ').replace(/[^0-9\s]/g, '').replace(/\s+/g, ' ');
    let cuits = sanitizedValue.split(' ');

    if (cuits.length > 5) {
      sanitizedValue = cuits.slice(0, 5).join(' ');
    }
    
    this.cuit.set(sanitizedValue);
  }

  /**
   * Set the message error.
   * @param message The message to set.
   * @param type The type of message.
   * @returns void.
   */
  private setError(message: string, type: 'warning' | 'danger'): void {
    this.errorMessage.set(message);
    this.errorType.set(type);
  }

  /**
   * Processes HTTP response errors and categorizes them by severity.
   * Specifically handles 404 (Not Found) as a warning, while other errors default to danger.
   * @param error The error object captured from the service call.
   * @returns void.
   */
  private handleHttpError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message || 'Error al obtener los datos del servidor.';
      const isNotFound = error.status === 404;
      
      this.setError(message, isNotFound ? 'warning' : 'danger');
    }
    else {
      this.setError('No se pudo establecer comunicación con la pasarela de servicios.', 'danger');
    }
  }

  /**
   * Updates a specific IBatchItem within the results signal using an immutable merge.
   * @param cuit The unique identifier (CUIT) of the item to update.
   * @param changes A partial object containing the properties to be updated.
   */
  private updateBatchItem(cuit: string, changes: Partial<IBatchItem>): void {
    this.resultsArray.update(items => 
      items.map(item => item.cuit === cuit ? { ...item, ...changes } : item)
    );
  }
}