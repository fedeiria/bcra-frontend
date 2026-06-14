import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { ICreditCard } from '../../../models/interfaces/itransparency';
import { PaginationStateManager } from '../../../shared/utils/pagination-state-manager.util';
import { Paginator } from '../../../shared/components/paginator/paginator';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-credit-cards',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DecimalPipe, Paginator],
  templateUrl: './credit-cards.html',
  styleUrl: './credit-cards.scss',
})
export class CreditCards implements OnInit {
  private readonly transparencyService = inject(TransparencyService);
  readonly itemsPerPage = 8;

  // State signals
  cards = signal<ICreditCard[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // Filter
  searchTerm = signal<string>('');

  constructor() {
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

  async ngOnInit(): Promise<void> {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    try {
      const response = await firstValueFrom(this.transparencyService.getCreditCards());
      const safeData = Array.isArray(response) ? response : (response as any)?.results || [];
      this.cards.set(safeData);
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
      this.errorMessage.set(error.error?.message || 'Se produjo un error al intentar cargar las tarjetas de crédito.');
    }
    else {
      this.errorMessage.set('Se produjo un error inesperado. Por favor, inténtelo de nuevo más tarde.');
    }
  }
}