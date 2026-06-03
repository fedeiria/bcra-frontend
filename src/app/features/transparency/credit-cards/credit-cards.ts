import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { ICreditCard } from '../../../models/interfaces/itransparency';

@Component({
  selector: 'app-credit-cards',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  templateUrl: './credit-cards.html',
  styleUrl: './credit-cards.scss',
})
export class CreditCards implements OnInit {

  private transparencyService = inject(TransparencyService);
  
  // State signals
  cards = signal<ICreditCard[]>([]);
  isLoading = signal<boolean>(true);

  // Filters and pagination
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);

  errorMessage = signal<string | null>(null);

  readonly itemsPerPage = 10;

  // Reactive filters
  filteredCards = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allCards = this.cards();

    if (!term) return allCards;

    return allCards.filter(card => {
      const entidad = (card.descripcionEntidad ?? '').toLowerCase();
      const nombre = (card.nombreCompleto ?? '').toLowerCase();
      const segmento = (card.segmento ?? '').toLowerCase();

      return entidad.includes(term) || nombre.includes(term) || segmento.includes(term);
    });
  });

  // Filter paginated results
  paginatedCards = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    return this.filteredCards().slice(startIndex, endIndex);
  });

  // Pagination logic
  totalPages = computed(() => Math.ceil(this.filteredCards().length / this.itemsPerPage));

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

  ngOnInit(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.transparencyService.getCreditCards().subscribe({
      next: (data) => {
        this.cards.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        if (!navigator.onLine) {
          this.errorMessage.set('Parece que no tenés conexión a internet. Verificá tu red y reintentá.');
        }
        else {
          this.errorMessage.set('Se produjo un error al cargar las tarjetas de crédito. Por favor, inténtelo de nuevo más tarde.');
        }
        this.isLoading.set(false);
        console.error('credit-cards.ts: ', err);
      }
    });
  }

  /**
   * Handles the search input event and updates the search term.
   * @param event The input event from the search field. The value of the input is used to filter the packages.
   * @returns void.
   */
  onSearch(event: Event): void {
    const element = event.target as HTMLInputElement;
    this.searchTerm.set(element.value);
    this.currentPage.set(1);
  }

  /**
   * Navigates to a specific page.
   * @param page The page number to navigate to.
   * @return void. Updates the currentPage signal to the specified page number if it's within valid range.
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}