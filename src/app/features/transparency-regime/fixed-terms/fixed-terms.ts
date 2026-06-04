import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CurrencyPipe, TitleCasePipe, DatePipe } from '@angular/common';

import { IFixedTerm } from '../../../models/interfaces/itransparency';
import { TransparencyService } from '../../../core/services/transparency/transparency-service';

@Component({
  selector: 'app-fixed-terms',
  imports: [CurrencyPipe, TitleCasePipe, DatePipe],
  templateUrl: './fixed-terms.html',
  styleUrl: './fixed-terms.scss',
})
export class FixedTerms implements OnInit {

  fixedTerms = signal<IFixedTerm[]>([]);
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
   * Loads fixed terms data from the TransparencyService and updates the component state accordingly.
   * Handles loading state and error messages based on the success or failure of the data retrieval.
   * @returns void. Updates the fixedTerms signal with the retrieved data, sets isLoading to false, and handles any errors by setting an appropriate error message.
   */
  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.transparencyService.getFixedTerms().subscribe({
      next: (data) => {
        this.fixedTerms.set(data);
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

  // Pagination logic
  totalPages = computed(() => Math.ceil(this.filteredTerms().length / this.itemsPerPage));

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
  paginatedTerms = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    return this.filteredTerms().slice(startIndex, endIndex);
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
}