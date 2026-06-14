import { Component, OnInit, computed, signal, effect, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { IMortgageLoan } from '../../../models/interfaces/itransparency';
import { PaginationStateManager } from '../../../shared/utils/pagination-state-manager.util';
import { Paginator } from '../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-mortgage-loans',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, Paginator],
  templateUrl: './mortgage-loans.html',
  styleUrl: './mortgage-loans.scss',
})
export class MortgageLoans implements OnInit {
  private readonly transparencyService = inject(TransparencyService);
  readonly itemsPerPage = 6;

  // State signals
  loans = signal<IMortgageLoan[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Filter
  searchTerm = signal<string>('');

  selectedLoan = signal<IMortgageLoan | null>(null);

  constructor() {
    effect(() => {
      this.pager.updateData(this.filteredLoans());
    });
  }

  pager = new PaginationStateManager<IMortgageLoan>(this.itemsPerPage);

  // Filter logic
  filteredLoans = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const all = this.loans();

    if (!term) return all;

    return all.filter(item => {
      const descripcionEntidad = (item.descripcionEntidad ?? '').toLowerCase();
      const destinoFondos = (item.destinoFondos ?? '').toLowerCase();

      return descripcionEntidad.includes(term) || destinoFondos.includes(term);
    });
  });

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  /**
   * Loads mortgage loans data from the TransparencyService and updates the component state accordingly.
   * Handles loading state and error messages based on the success or failure of the data retrieval.
   * @returns Promise<void>. Updates the fixedTerms signal with the retrieved data, sets isLoading to false, and handles any errors by setting an appropriate error message.
   */
  async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(this.transparencyService.getMortgageLoans());
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
      this.errorMessage.set(error.error?.message || 'Se produjo un error al intentar cargar los datos de créditos hipotecarios.');
    }
    else {
      this.errorMessage.set('Se produjo un error inesperado. Por favor, inténtelo de nuevo más tarde.');
    }
  }

  /**
   * Open modal with loan details.
   * @param loan The loan object containing the details to be displayed in the modal.
   * @returns void. Sets the selectedLoan signal to the provided loan and adds a CSS class to the body to display the modal.
   */
  openModal(loan: IMortgageLoan): void {
    this.selectedLoan.set(loan);
    document.body.classList.add('modal-open');
  }

  /**
   * Close the modal and clear the selected loan.
   * @returns void. Resets the selectedLoan signal to null and removes the CSS class from the body to hide the modal.
   */
  closeModal(): void {
    this.selectedLoan.set(null);
    document.body.classList.remove('modal-open');
  }
}