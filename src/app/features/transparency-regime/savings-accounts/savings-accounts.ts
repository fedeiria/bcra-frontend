import { Component, OnInit, computed, signal, effect, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { ISavingsAccount } from '../../../models/interfaces/itransparency';
import { PaginationStateManager } from '../../../shared/utils/pagination-state-manager.util';
import { Paginator } from '../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-savings-accounts',
  standalone: true,
  imports: [DatePipe, FormsModule, Paginator],
  templateUrl: './savings-accounts.html',
  styleUrl: './savings-accounts.scss',
})
export class SavingsAccounts implements OnInit {
  private readonly transparencyService = inject(TransparencyService);
  readonly itemsPerPage = 10;

  // State signals
  isLoading = signal(true);
  accounts = signal<ISavingsAccount[]>([]);
  errorMessage = signal<string | null>(null);

  // Filter
  searchTerm = signal<string>('');

  constructor() {
    effect(() => {
      this.pager.updateData(this.filteredAccounts());
    });
  }

  pager = new PaginationStateManager<ISavingsAccount>(this.itemsPerPage);

  // Filter logic
  filteredAccounts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const all = this.accounts();
    
    if (!term) return all;

    return all.filter(acc => 
      (acc.descripcionEntidad ?? '').toLowerCase().includes(term)
    );
  });

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  /**
   * Loads savings accounts data from the TransparencyService and updates the component state accordingly.
   * Handles loading state and error messages based on the success or failure of the data retrieval.
   * @returns Promise<void>. Updates the fixedTerms signal with the retrieved data, sets isLoading to false, and handles any errors by setting an appropriate error message.
   */
  async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(this.transparencyService.getSavingsAccounts());
      const safeData = Array.isArray(response) ? response : (response as any)?.results || [];
      this.accounts.set(safeData);
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
      this.errorMessage.set(error.error?.message || 'Se produjo un error al intentar cargar los datos de cajas de ahorro.');
    }
    else {
      this.errorMessage.set('Se produjo un error inesperado. Por favor, inténtelo de nuevo más tarde.');
    }
  }
}