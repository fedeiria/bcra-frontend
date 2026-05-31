import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { MonetaryService } from '../../core/services/monetary/monetary-service';
import { IMonetaryVariable, IMonetaryApiResponse, IMonetaryHistoryItem, IMonetaryHistoryResult, IMonetaryMethodology } from '../../models/interfaces/imonetary';
import { MONETARY_UI_CONFIG } from '../../models/constants/monetary';

import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-monetary',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './monetary.html',
  styleUrl: './monetary.scss'
})
export class Monetary implements OnInit {
  private monetaryService = inject(MonetaryService);

  variables: IMonetaryVariable[] = [];
  selectedVariable: IMonetaryVariable | null = null;
  historyData: IMonetaryHistoryItem[] = [];

  loading = true;
  loadingHistory = false;
  uiConfig = MONETARY_UI_CONFIG;

  // Search term for filtering variables
  searchTerm: string = '';
  filteredVariables: IMonetaryVariable[] = [];

  async ngOnInit() {
    await this.loadInitialData();
  }

  /**
   * Loads the initial data for the component, including monetary variables and their methodologies.
   * @returns A promise that resolves when the data has been loaded and processed.
   */
  private async loadInitialData(): Promise<void> {
    this.loading = true;
    
    try {
      const [variablesRes, methodologiesRes] = await Promise.all([
        firstValueFrom(this.monetaryService.getVariables()) as Promise<IMonetaryApiResponse<IMonetaryVariable[]>>,
        firstValueFrom(this.monetaryService.getMethodologies()) as Promise<IMonetaryApiResponse<IMonetaryMethodology[]>>
      ]);

      if (!variablesRes.error && !methodologiesRes.error) {
        const variablesList = variablesRes.data || [];
        const methodologiesList = methodologiesRes.data || [];
        
        this.variables = variablesList.map(v => {
          const met = methodologiesList.find(m => m.id === v.idVariable);
          return { 
            ...v, 
            metodologia: met ? met.detalle : 'Sin descripción disponible.' 
          };
        });

        this.filteredVariables = [...this.variables];
      }
    }
    catch (error) {
      console.error('Error cargando datos del BCRA', error);
    }
    finally {
      this.loading = false;
    }
  }

  /**
   * Views the history for a specific monetary variable.
   * @param variable The monetary variable for which to view the history.
   * @returns A promise that resolves when the history data has been loaded.
   */
  async viewHistory(variable: IMonetaryVariable): Promise<void> {
    this.selectedVariable = variable;
    this.loadingHistory = true;
    
    const hoy = new Date();
    const haceUnMes = new Date(hoy);
    haceUnMes.setMonth(hoy.getMonth() - 1);
    
    const hasta = hoy.toISOString().split('T')[0];
    const desde = haceUnMes.toISOString().split('T')[0];

    try {
      const res = await firstValueFrom(this.monetaryService.getVariableHistory(variable.idVariable, desde, hasta)) as IMonetaryApiResponse<IMonetaryHistoryResult[]>;
      
      if (!res.error && res.data && res.data.length > 0) {
        this.historyData = res.data[0].detalle;
      }
      else {
        this.historyData = [];
      }
    }
    catch (error) {
      console.error('Error cargando historial', error);
      this.historyData = [];
    }
    finally {
      this.loadingHistory = false;
    }
  }

  /**
   * Filters the monetary variables based on the search term.
   * @returns void.
   */
  filterVariables(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredVariables = [...this.variables];
      return;
    }

    this.filteredVariables = this.variables.filter(v =>
      (v.descripcion || '').toLowerCase().includes(term) ||
      (v.categoria || '').toLowerCase().includes(term)
    );
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
}