import { Component, OnInit, computed, signal, effect, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { IFixedTerm } from '../../../models/interfaces/itransparency';
import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { PaginationStateManager } from '../../../shared/utils/pagination-state-manager.util';
import { Paginator } from '../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-fixed-terms',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, Paginator],
  templateUrl: './fixed-terms.html',
  styleUrl: './fixed-terms.scss',
})
export class FixedTerms implements OnInit {
  private readonly transparencyService = inject(TransparencyService);
  readonly itemsPerPage = 10;

  // State signals
  fixedTerms = signal<IFixedTerm[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Filter
  searchTerm = signal<string>('');

  constructor() {
    effect(() => {
      this.pager.updateData(this.filteredTerms());
    });
  }

  pager = new PaginationStateManager<IFixedTerm>(this.itemsPerPage);

  // Filter logic
  filteredTerms = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const all = this.fixedTerms();

    if (!term) return all;

    return all.filter(item => {
      const entidad = (item.descripcionEntidad ?? '').toLowerCase();
      const nombreCompleto = (item.nombreCompleto ?? '').toLowerCase();
      const nombreCorto = (item.nombreCorto ?? '').toLowerCase();
      const canal = (item.canalConstitucion ?? '').toLowerCase();

      return entidad.includes(term) || nombreCompleto.includes(term) || nombreCorto.includes(term) || canal.includes(term);
    });
  });

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  /**
   * Loads fixed terms data from the TransparencyService and updates the component state accordingly.
   * Handles loading state and error messages based on the success or failure of the data retrieval.
   * @returns Promise<void>. Updates the fixedTerms signal with the retrieved data, sets isLoading to false, and handles any errors by setting an appropriate error message.
   */
  async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(this.transparencyService.getFixedTerms());
      const safeData = Array.isArray(response) ? response : (response as any)?.results || [];
      this.fixedTerms.set(safeData);
    }
    catch (error: unknown) {
      this.handleHttpError(error);
    }
    finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handle HTTP errors.
   * @param error The error to handle.
   * @returns void.
   */
  private handleHttpError(error: unknown): void {
    if (!navigator.onLine) {
      this.errorMessage.set('Parece que no tenés conexión a internet. Verificá tu red y reintentá.');
      return;
    }

    if (error instanceof HttpErrorResponse) {
      this.errorMessage.set(error.error?.message || 'Se produjo un error al intentar cargar los datos de plazos fijos.');
    }
    else {
      this.errorMessage.set('Se produjo un error inesperado. Por favor, inténtelo de nuevo más tarde.');
    }
  }
}