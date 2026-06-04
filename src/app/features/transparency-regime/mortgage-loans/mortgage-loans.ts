import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { IMortgageLoan } from '../../../models/interfaces/itransparency';

@Component({
  selector: 'app-mortgage-loans',
  imports: [CurrencyPipe],
  templateUrl: './mortgage-loans.html',
  styleUrl: './mortgage-loans.scss',
})
export class MortgageLoans implements OnInit {

  loans = signal<IMortgageLoan[]>([]);
  searchTerm = signal('');
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  currentPage = signal(1);
  itemsPerPage = 6;

  selectedLoan = signal<IMortgageLoan | null>(null);

  private transparencyService = inject(TransparencyService);

  ngOnInit(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.transparencyService.getMortgageLoans().subscribe({
      next: (data) => {
        this.loans.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        if (!navigator.onLine) {
          this.errorMessage.set('Parece que no tenés conexión a internet. Verificá tu red y reintentá.');
        }
        else {
          this.errorMessage.set('Se produjo un error al cargar los préstamos hipotecarios. Por favor, inténtelo de nuevo más tarde.');
        }
        this.isLoading.set(false);
        console.error('mortgage-loans.ts: ', err);
      }
    });
  }

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

  // Pagination logic
  totalPages = computed(() => Math.ceil(this.filteredLoans().length / this.itemsPerPage));

  // Generate page numbers for pagination controls
  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) { pages.push(i); }
    return pages;
  });

  // Filter paginated results
  paginatedLoans = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    return this.filteredLoans().slice(startIndex, endIndex);
  });

  /**
   * Handles the search input event and updates the search term.
   * @param event The input event from the search field. The value of the input is used to filter the packages.
   * @returns void.
   */
  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
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

  /**
   * Open modal with loan details.
   * @param loan The loan object containing the details to be displayed in the modal.
   * @returns void. Sets the selectedLoan signal to the provided loan and adds a CSS class to the body to display the modal.
   */
  openModal(loan: IMortgageLoan) {
    this.selectedLoan.set(loan);
    document.body.classList.add('modal-open');
  }

  /**
   * Close the modal and clear the selected loan.
   * @returns void. Resets the selectedLoan signal to null and removes the CSS class from the body to hide the modal.
   */
  closeModal() {
    this.selectedLoan.set(null);
    document.body.classList.remove('modal-open');
  }
}
