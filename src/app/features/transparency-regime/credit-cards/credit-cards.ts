import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { ICreditCard } from '../../../models/interfaces/itransparency';
import { PaginationStateManager } from '../../../shared/utils/pagination-state-manager.util';
import { Paginator } from '../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-credit-cards',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe, Paginator],
  templateUrl: './credit-cards.html',
  styleUrl: './credit-cards.scss',
})
export class CreditCards implements OnInit {

  itemsPerPage = 8;

  // State signals
  cards = signal<ICreditCard[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // Filter
  searchTerm = signal<string>('');

  constructor(private transparencyService: TransparencyService) {
    effect(() => {
      this.pager.updateData(this.filteredCards());
    });
  }

  pager = new PaginationStateManager<ICreditCard>(this.itemsPerPage);

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
          this.errorMessage.set('Se produjo un error al intentar cargar los datos de tarjetas de crédito. Por favor, inténtelo de nuevo más tarde.');
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
  }
}