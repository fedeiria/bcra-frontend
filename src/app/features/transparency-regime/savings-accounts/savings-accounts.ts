import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { ISavingsAccount } from '../../../models/interfaces/itransparency';

@Component({
  selector: 'app-savings-accounts',
  imports: [DatePipe],
  templateUrl: './savings-accounts.html',
  styleUrl: './savings-accounts.scss',
})
export class SavingsAccounts implements OnInit {

  accounts = signal<ISavingsAccount[]>([]);
  searchTerm = signal('');
  currentPage = signal(1);
  itemsPerPage = 10;
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  private transparencyService = inject(TransparencyService);

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Loads savings accounts data from the TransparencyService and updates the component state accordingly.
   * Handles loading state and error messages based on the success or failure of the data retrieval.
   * @returns void. Updates the accounts signal with the retrieved data, sets isLoading to false, and handles any errors by setting an appropriate error message.
   */
  loadData() {
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

  totalPages = computed(() => Math.ceil(this.filteredAccounts().length / this.itemsPerPage));

  paginatedAccounts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredAccounts().slice(start, start + this.itemsPerPage);
  });

  /**
   * Handles the search input event and updates the search term.
   * @param event The input event from the search field. The value of the input is used to filter the packages.
   * @returns void.
   */
  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  /**
   * Navigates to a specific page.
   * @param page The page number to navigate to.
   * @return void. Updates the currentPage signal to the specified page number if it's within valid range.
   */
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
