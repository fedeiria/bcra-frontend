import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin, firstValueFrom } from 'rxjs';

import { ConsultationService } from '../../core/services/consultation/consultation-service';
import { Spinner } from "../../shared/components/spinner/spinner";
import { Header } from "../../shared/components/header/header";
import { HistoryChart } from './components/history-chart/history-chart';
import { MetricCards } from './components/metric-cards/metric-cards';
import { RejectedChecks } from './components/rejected-checks/rejected-checks';
import { EntityDetails } from './components/entity-details/entity-details';

import { ICreditSummary } from '../../models/interfaces/icredit-summary';
import { IHistoricalItem } from '../../models/interfaces/ihistorical-item';
import { IApiResponse } from '../../models/interfaces/iapi-response';
import { IBatchItem } from '../../models/interfaces/ibatch-item';

import { getSituationClass, getSituationLabel } from '../../shared/utils/credit-formatters';

@Component({
  selector: 'app-consultation',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner, Header, HistoryChart, MetricCards, RejectedChecks, EntityDetails],
  templateUrl: './consultation.html',
  styleUrl: './consultation.scss',
})
export class Consultation {

  cuit: string = '';
  loading: boolean = false;
  
  result: ICreditSummary | null = null;
  errorMessage: string | null = null;
  errorType: 'warning' | 'danger' | null = null;
  historicalData: IHistoricalItem[] = [];

  isBatchMode: boolean = false;
  resultsArray: IBatchItem[] = [];

  constructor(private consultationService: ConsultationService) { }

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
   * @returns void.
   */
  private executeSingleConsult(cuit: string): void {
    this.result = null;
    this.historicalData = [];

    forkJoin({
      summary: this.consultationService.getCreditSummary(cuit),
      history: this.consultationService.getHistoricalEvolution(cuit)
    }).subscribe({
      next: (response) => {
        if (response.summary.error) {
          this.errorMessage = response.summary.message ?? 'Error desconocido';
          this.errorType = response.summary.type as 'warning' | 'danger';
        }
        else {
          this.result = response.summary.data ?? null;
          this.historicalData = response.history.data ?? [];
          this.cuit = '';
        }

        this.loading = false;
      },
      error: () => this.handleConnectionError()
    });
  }

  /**
   * Execute a batch of CUITs.
   * @param cuits The batch of CUITs.
   * @returns void.
   */
  private executeBatchConsult(cuits: string[]): void {
    this.resultsArray = [];
    this.loading = true;

    this.consultationService.getBatchCreditSummary(cuits).subscribe({
      next: (responses: IApiResponse<ICreditSummary>[]) => {

        this.resultsArray = responses.map((res, index) => ({
          cuit: cuits[index],
          denominacion: res.data?.denominacion,
          success: !res.error,
          data: res.data ?? null,
          errorMessage: res.error ? (res.message || 'Error en la consulta') : null,
          showDetail: false,
          loadingHistory: false,
          historicalData: []
        }));

        if (this.resultsArray.length > 0 && this.resultsArray.every(r => !r.success)) {
          this.errorMessage = 'No se pudo obtener información de los CUITs solicitados. La conexión con el API del BCRA fue interrumpida.';
          this.errorType = 'danger';
        }

        if (this.resultsArray.every(r => !r.success)) {
          this.resultsArray = []; 
        }

        this.loading = false;
      },
      error: () => this.handleConnectionError()
    });
  }

  /**
   * Show or hide the CUIT detail.
   * @param item The item of the Batch.
   * @returns Promise<void> 
   */
  async toggleDetail(item: IBatchItem): Promise<void> {
    item.showDetail = !item.showDetail;
    
    if (item.showDetail && (!item.historicalData || item.historicalData.length === 0)) {
      item.loadingHistory = true;
      
      try {
        const response = await firstValueFrom(this.consultationService.getHistoricalEvolution(item.cuit));
        
        if (response && !response.error) {
          item.historicalData = [...(response.data ?? [])];
        }
        else {
          item.historicalData = [];
        }
      }
      catch {
        item.historicalData = [];
      }
      finally {
        setTimeout(() => {
          item.loadingHistory = false;
        }, 50);
      }
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
   * Event that validates the CUIT entry.
   * @param event The event triggered.
   */
  onCuitInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.cuit = input.value.replace(/[^0-9,\s]/g, '');
  }
}