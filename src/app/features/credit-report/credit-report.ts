import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom, lastValueFrom } from 'rxjs';
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

import { IBatchResult, isBatchError } from '../../models/interfaces/ibatch-result';

import { getSituationClass, getSituationLabel } from '../../shared/utils/credit-formatters.util';

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
   * Performs a single CUIT query combining summary and historical data.
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
   * Executes a batch query for multiple CUITs.
   */
  private async executeBatchConsult(cuits: string[]): Promise<void> {
    try {
      const responses: IBatchResult[] = await firstValueFrom(
        this.creditReportService.getBatchCreditSummary(cuits)
      );

      const batchItems: IBatchItem[] = responses.map((res) => {
        if (isBatchError(res)) {
          return {
            cuit: res.cuit,
            success: false,
            data: null,
            errorMessage: res.message,
            showDetail: false,
            loadingHistory: false,
            historicalData: [],
            historyError: null
          };
        }

        return {
          cuit: res.cuit,
          success: true,
          data: res,
          errorMessage: null,
          showDetail: false,
          loadingHistory: false,
          historicalData: [],
          historyError: null
        };
      });

      const allFailed = batchItems.every(item => !item.success);

      if (allFailed) {
        const hasTransient = responses.some(
          res => isBatchError(res) && res.isTransient === true
        );

        this.setError(
          hasTransient
            ? 'Se interrumpió la comunicación con el API del BCRA debido al volumen de consultas simultáneas. Por favor, reintente en unos instantes.'
            : 'Ninguno de los CUITs ingresados registra información activa en el BCRA.',
          hasTransient ? 'danger' : 'warning'
        );

        return;
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
   * Toggles the detail row for a CUIT in batch mode.
   * Loads historical data on first expand, or retries if a previous attempt failed.
   */
  async toggleDetail(itemCuit: string): Promise<void> {
    const item = this.resultsArray().find(i => i.cuit === itemCuit);
    if (!item) return;
 
    const nowOpen = !item.showDetail;
    this.updateBatchItem(itemCuit, { showDetail: nowOpen });
 
    // Don't fetch if: closing, already loaded successfully, or already loading
    if (!nowOpen || item.historicalData.length > 0 || item.loadingHistory) return;
 
    // Clear any previous error (e.g. 429 from a prior attempt) so the user
    // can retry by closing and reopening the detail row
    this.updateBatchItem(itemCuit, { loadingHistory: true, historyError: null });
 
    try {
      const historyData = await firstValueFrom(
        this.creditReportService.getHistoricalEvolution(itemCuit)
      );
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
    catch (err: unknown) {
      const is429 = err instanceof HttpErrorResponse && err.status === 429;
      this.updateBatchItem(itemCuit, {
        historicalData: [],
        historyError: is429
          ? 'El BCRA limita las consultas simultáneas. Cerrá y volvé a abrir para reintentar.'
          : 'No se puede cargar el historial en este momento.'
      });
    }
    finally {
      this.updateBatchItem(itemCuit, { loadingHistory: false });
    }
  }

  /**
   * Sanitizes and limits the CUIT input to a maximum of 5 entries.
   */
  onCuitChange(value: string): void {
    let sanitizedValue = value.replace(/,/g, ' ').replace(/[^0-9\s]/g, '').replace(/\s+/g, ' ');
    let cuits = sanitizedValue.split(' ');

    if (cuits.length > 5) {
      sanitizedValue = cuits.slice(0, 5).join(' ');
    }

    this.cuit.set(sanitizedValue);
  }

  // ---------------------------------------------------------------------------
  // Template helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns the count of failed items in the current batch result.
   * Used in the template to render the error/success summary badges.
   */
  getErrorCount(): number {
    return this.resultsArray().filter(item => !item.success).length;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private resetState(): void {
    this.result.set(null);
    this.historicalData.set([]);
    this.resultsArray.set([]);
    this.errorMessage.set(null);
    this.errorType.set(null);
  }

  private setError(message: string, type: 'warning' | 'danger'): void {
    this.errorMessage.set(message);
    this.errorType.set(type);
  }

  /**
   * Handles HTTP-level errors (network failures, gateway errors).
   * Per-CUIT errors in batch mode never reach here — they arrive as IBatchError inside responses[].
   */
  private handleHttpError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      
      const body = error.error;
      const message = typeof body === 'object' && body !== null
        ? body.message || body.errorMessages?.[0] || 'Error al obtener los datos del servidor.'
        : typeof body === 'string' && body.length > 0
          ? body
          : error.message || 'Error al obtener los datos del servidor.';

      const type = (error.status === 404 || body?.type === 'warning') ? 'warning' : 'danger';

      this.setError(message, type);
    }
    else {
      this.setError('No se pudo establecer comunicación con la pasarela de servicios.', 'danger');
    }
  }

  /**
   * Immutable update of a single IBatchItem within resultsArray.
   */
  private updateBatchItem(cuit: string, changes: Partial<IBatchItem>): void {
    this.resultsArray.update(items =>
      items.map(item => item.cuit === cuit ? { ...item, ...changes } : item)
    );
  }
}