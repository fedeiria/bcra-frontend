import { Component, OnInit, computed, signal, effect, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { IPersonalLoan } from '../../../models/interfaces/itransparency';
import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { PaginationStateManager } from '../../../shared/utils/pagination-state-manager.util';
import { Paginator } from '../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-personal-loans',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, Paginator],
  templateUrl: './personal-loans.html',
  styleUrl: './personal-loans.scss',
})
export class PersonalLoans implements OnInit {
  private readonly transparencyService = inject(TransparencyService);
  readonly itemsPerPage = 10;

  // State signals
  loans = signal<IPersonalLoan[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Filter
  searchTerm = signal<string>('');

  constructor() {
    effect(() => {
      this.pager.updateData(this.filteredLoans());
    });
  }

  pager = new PaginationStateManager<IPersonalLoan>(this.itemsPerPage);

  // Filter logic
  filteredLoans = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const all = this.loans();

    if (!term) return all;

    return all.filter(item => {
      const entity = (item.descripcionEntidad ?? '').toLowerCase();
      const denomination = (item.denominacion ?? '').toLowerCase();

      return entity.includes(term) || denomination.includes(term);
    });
  });
  
  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  /**
   * Loads personal loans data from the TransparencyService and updates the component state accordingly.
   * Handles loading state and error messages based on the success or failure of the data retrieval.
   * @returns Promise<void>. Updates the fixedTerms signal with the retrieved data, sets isLoading to false, and handles any errors by setting an appropriate error message.
   */
  async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(this.transparencyService.getPersonalLoans());
      const safeData = Array.isArray(response) ? response : (response as any)?.results || [];
      this.loans.set(safeData);
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
      this.errorMessage.set(error.error?.message || 'Se produjo un error al intentar cargar los datos de préstamos personales.');
    }
    else {
      this.errorMessage.set('Se produjo un error inesperado. Por favor, inténtelo de nuevo más tarde.');
    }
  }
}