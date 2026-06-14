import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { MonetaryService } from '../../core/services/monetary/monetary-service';
import { IMonetaryVariable, IMonetaryHistoryItem, IMonetaryHistoryResult, IMonetaryMethodology } from '../../models/interfaces/imonetary';
import { MONETARY_UI_CONFIG } from '../../models/constants/monetary';

import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-monetary-variables',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, Header, Footer, NgClass],
  templateUrl: './monetary-variables.html',
  styleUrl: './monetary-variables.scss'
})
export class MonetaryVariables implements OnInit {
  
  private readonly monetaryService = inject(MonetaryService);
  private readonly uiConfig = MONETARY_UI_CONFIG;

  // Signal states
  loading = signal<boolean>(true);
  loadingHistory = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  variables = signal<IMonetaryVariable[]>([]);
  selectedVariable = signal<IMonetaryVariable | null>(null);
  historyData = signal<IMonetaryHistoryItem[]>([]);
  searchTerm = signal<string>('');

  // Signal computed
  filteredVariables = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allVars = this.variables();

    if (!term) return allVars;

    return allVars.filter(v =>
      (v.descripcion || '').toLowerCase().includes(term) ||
      (v.categoria || '').toLowerCase().includes(term)
    );
  });

  async ngOnInit() {
    await this.loadInitialData();
  }

  /**
   * Loads the initial data for the component, including monetary variables and their methodologies.
   * @returns A promise that resolves when the data has been loaded and processed.
   */
  private async loadInitialData(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    
    try {
      const [variablesList, methodologiesList] = await Promise.all([
        firstValueFrom(this.monetaryService.getVariables()),
        firstValueFrom(this.monetaryService.getMethodologies())
      ]);

      // Mapeamos defensivamente por si el backend nos enviara la data anidada accidentalmente
      const safeVariables = Array.isArray(variablesList) ? variablesList : (variablesList as any)?.results || [];
      const safeMethodologies = Array.isArray(methodologiesList) ? methodologiesList : (methodologiesList as any)?.results || [];
      
      const mergedVariables = safeVariables.map((v: IMonetaryVariable) => {
        const met = safeMethodologies.find((m: IMonetaryMethodology) => m.id === v.idVariable);
        return { 
          ...v, metodologia: met ? met.detalle : 'Sin descripción disponible.' 
        };
      });

      this.variables.set(mergedVariables);
    }
    catch (error: unknown) {
      this.handleHttpError(error, 'No se pudo conectar con el servidor para obtener las variables monetarias.');
    }
    finally {
      this.loading.set(false);
    }
  }

  /**
   * Views the history for a specific monetary variable.
   * @param variable The monetary variable for which to view the history.
   * @returns A promise that resolves when the history data has been loaded.
   */
  async viewHistory(variable: IMonetaryVariable): Promise<void> {
    this.selectedVariable.set(variable);
    this.errorMessage.set(null);
    this.loadingHistory.set(true);
    
    const today = new Date();
    const aMonthAgo = new Date(today);
    aMonthAgo.setMonth(today.getMonth() - 1);
    
    const to = today.toISOString().split('T')[0];
    const from = aMonthAgo.toISOString().split('T')[0];

    try {
      const response = await firstValueFrom(
        this.monetaryService.getVariableHistory(variable.idVariable, from, to)
      );
      
      const resultsArray: IMonetaryHistoryResult[] = Array.isArray(response) ? response : (response as any)?.results || [];
      
      if (resultsArray.length > 0 && resultsArray[0].detalle) {
        this.historyData.set(resultsArray[0].detalle);
      }
      else {
        this.historyData.set([]);
      }
    }
    catch (error: unknown) {
      this.handleHttpError(error, 'Error cargando historial de la variable.');
      this.historyData.set([]);
    }
    finally {
      this.loadingHistory.set(false);
    }
  }

  /**
   * Gets the icon for a specific monetary variable based on its ID.
   * @param id The ID of the monetary variable.
   * @returns The icon class for the variable.
   */
  getIconFor(id: number): string {
    return this.uiConfig[id]?.icon || this.uiConfig['default'].icon;
  }

  /**
   * Gets the color class for a specific monetary variable based on its ID.
   * @param id The ID of the monetary variable.
   * @returns The color class for the variable.
   */
  getColorFor(id: number): string {
    return this.uiConfig[id]?.colorClass || this.uiConfig['default'].colorClass;
  }

  /**
   * Handle HTTP errors.
   * @param error Error to handle.
   * @param defaultMsg The message to show.
   */
  private handleHttpError(error: unknown, defaultMsg: string): void {
    if (error instanceof HttpErrorResponse) {
      this.errorMessage.set(error.error?.message || defaultMsg);
    }
    else {
      this.errorMessage.set(defaultMsg);
    }
  }
}