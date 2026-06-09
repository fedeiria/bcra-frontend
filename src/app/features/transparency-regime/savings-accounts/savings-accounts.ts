import { Component, OnInit, computed, signal, effect } from '@angular/core';
import { DatePipe } from '@angular/common';

import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { ISavingsAccount } from '../../../models/interfaces/itransparency';
import { PaginationStateManager } from '../../../shared/utils/pagination-state-manager.util';
import { Paginator } from '../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-savings-accounts',
  imports: [DatePipe, Paginator],
  templateUrl: './savings-accounts.html',
  styleUrl: './savings-accounts.scss',
})
export class SavingsAccounts implements OnInit {

  itemsPerPage = 10;

  // State signals
  isLoading = signal(true);
  accounts = signal<ISavingsAccount[]>([]);
  errorMessage = signal<string | null>(null);

  // Filter
  searchTerm = signal<string>('');

  constructor(private transparencyService: TransparencyService) {
    effect(() => {
      this.pager.updateData(this.filteredAccounts());
    });
  }

  pager = new PaginationStateManager<ISavingsAccount>(this.itemsPerPage);

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Loads savings accounts data from the TransparencyService and updates the component state accordingly.
   * Handles loading state and error messages based on the success or failure of the data retrieval.
   * @returns void. Updates the accounts signal with the retrieved data, sets isLoading to false, and handles any errors by setting an appropriate error message.
   */
  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.transparencyService.getSavingsAccounts().subscribe({
      next: (data) => {
        this.accounts.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        if (!navigator.onLine) {
          this.errorMessage.set('Parece que no tenés conexión a internet. Verificá tu red y reintentá.');
        }
        else {
          this.errorMessage.set('Se produjo un error al intentar cargar los datos de cajas de ahorro. Por favor, inténtelo de nuevo más tarde.');
        }
        this.isLoading.set(false);
        console.error('savings-accounts.ts: ', err);
      }
    });
  }

  // Filter logic
  filteredAccounts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const all = this.accounts();
    
    if (!term) return all;

    return all.filter(acc => 
      (acc.descripcionEntidad ?? '').toLowerCase().includes(term)
    );
  });

  /**
   * Handles the search input event and updates the search term.
   * @param event The input event from the search field. The value of the input is used to filter the packages.
   * @returns void.
   */
  onSearch(event: Event): void {
    const element = event.target as HTMLInputElement;
    this.searchTerm.set(element.value);
  }
}