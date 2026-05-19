import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { ConsultationService } from '../../core/services/consultation/consultation-service';
import { Spinner } from "../../shared/components/spinner/spinner";
import { Header } from "../../shared/components/header/header";
import { HistoryChart } from './components/history-chart/history-chart';

import { ICreditSummary } from '../../models/interfaces/icredit-summary';
import { IHistoricalItem } from '../../models/interfaces/ihistorical-item';
import { CREDIT_SITUATUION_CONFIG } from '../../models/constants/credit-situation-config';
import { REJECTED_CHECKS_CONFIG } from '../../models/constants/rejected-checks-config';
import { ICheckStatusConfig } from '../../models/interfaces/icheck-status-config';

@Component({
  selector: 'app-consultation',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner, Header, HistoryChart],
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

  constructor(private consultationService: ConsultationService) { }

  consult() {
    if (!this.isValidCuit()) {
      this.errorMessage = 'Formato de CUIT inválido';
      this.errorType = 'warning';
      return;
    }

    this.loading = true;
    this.result = null;
    this.historicalData = [];
    this.errorMessage = null;
    this.errorType = null;

    // Executes in parallel both the summary and historical data requests, and waits for both to complete before processing the results and updating the UI.
    forkJoin({
      summary: this.consultationService.getCreditSummary(this.cuit),
      history: this.consultationService.getHistoricalEvolution(this.cuit)
    }).subscribe({
      next: (response: any) => {
        if (response.summary.error) {
          this.errorMessage = response.summary.message || 'Error al consultar.';
          this.errorType = response.summary.type || 'danger';
          this.loading = false;
          return;
        }

        // The backend has already consolidated the debts and detailed checks within .data
        this.result = response.summary.data ?? null;
        
        // Save the historical data for the chart, handling potential errors and ensuring we have an array to work with in the chart component.
        this.historicalData = response.history?.error ? [] : (response.history?.data ?? []);
        this.loading = false;

        this.cuit = ''; // Clear the input after a successful consultation
      },
      error: () => {
        this.errorMessage = 'No se pudo establecer comunicación con la pasarela de servicios.';
        this.errorType = 'danger';
        this.loading = false;
      }
    });
  }

  /**
   * Gets the CSS class for the credit situation based on the configuration
   * @param situation The credit situation
   * @returns The CSS class for the given situation
   */
  getSituationClass(situation: number): string {
    const validSituation = situation > 5 ? 0 : situation;
    return CREDIT_SITUATUION_CONFIG[validSituation]?.class || 'situacion-0';
  }

  /**
   * Gets the label for the credit situation based on the configuration
   * @param situation The credit situation
   * @returns The label for the given situation
   */
  getSituationLabel(situation: number): string {
    const validSituation = situation > 5 ? 0 : situation;
    return CREDIT_SITUATUION_CONFIG[validSituation]?.label || 'Sin clasificación';
  }

  /**
   * Gets the configuration for the check status based on the cheque data, determining if it has a BCRA fine, if it has been regularized, or if no penalty applies, and returns the appropriate label and CSS class for display
   * @param cheque The cheque object to evaluate
   * @returns An object with the label and CSS class corresponding
   */
  getCheckStatusConfig(cheque: any): ICheckStatusConfig {
    if (cheque.estadoMulta) {
      return REJECTED_CHECKS_CONFIG[cheque.estadoMulta] || REJECTED_CHECKS_CONFIG['NO_APLICA'];
    }

    if (cheque.fechaPago || cheque.fechaPagoMulta) {
      return REJECTED_CHECKS_CONFIG['REGULARIZADO'];
    }

    return REJECTED_CHECKS_CONFIG['NO_APLICA'];
  }

  /**
   * Handles the input event for the CUIT field, preventing letters and keeping 11 digits
   * @param event The input event
   */
  onCuitInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.slice(0, 11);
    this.cuit = value;
  }

  /**
   * Validates if the CUIT is in the correct format
   * @returns True if the CUIT is valid, false otherwise
   */
  isValidCuit(): boolean {
    return /^\d{11}$/.test(this.cuit);
  }
}
