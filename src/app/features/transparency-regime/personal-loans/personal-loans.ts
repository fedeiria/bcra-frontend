import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';

import { IPersonalLoan } from '../../../models/interfaces/itransparency';
import { TransparencyService } from '../../../core/services/transparency/transparency-service';

@Component({
  selector: 'app-personal-loans',
  imports: [CurrencyPipe, TitleCasePipe],
  templateUrl: './personal-loans.html',
  styleUrl: './personal-loans.scss',
})
export class PersonalLoans implements OnInit {

  loans = signal<IPersonalLoan[]>([]);
  searchTerm = signal('');
  currentPage = signal(1);
  itemsPerPage = 8;
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  private transparencyService = inject(TransparencyService);
  
  ngOnInit(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.transparencyService.getPersonalLoans().subscribe({
      next: (data) => {
        this.loans.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        if (!navigator.onLine) {
          this.errorMessage.set('Parece que no tenés conexión a internet. Verificá tu red y reintentá.');
        }
        else {
          this.errorMessage.set('Se produjo un error al cargar los plazos fijos. Por favor, inténtelo de nuevo más tarde.');
        }
        this.isLoading.set(false);
        console.error('fixed-terms.ts: ', err);
      }
    });
  }

  // Filter logic
  filteredLoans = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.loans();

    if (!term) return all;

    return all.filter(item => {
      const entity = (item.descripcionEntidad ?? '').toLowerCase();
      const denomination = (item.denominacion ?? '').toLowerCase();

      return entity.includes(term) || denomination.includes(term);
    });
  });

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

  totalPages = computed(() => Math.ceil(this.filteredLoans().length / this.itemsPerPage));

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
}