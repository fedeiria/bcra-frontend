import { Component, OnInit, computed, signal, effect } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { IFixedTerm } from '../../../models/interfaces/itransparency';
import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { PaginationStateManager } from '../../../shared/utils/pagination-state-manager.util';
import { Paginator } from '../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-fixed-terms',
  imports: [CurrencyPipe, DatePipe, Paginator],
  templateUrl: './fixed-terms.html',
  styleUrl: './fixed-terms.scss',
})
export class FixedTerms implements OnInit {

  itemsPerPage = 10;

  // State signals
  fixedTerms = signal<IFixedTerm[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Filter
  searchTerm = signal<string>('');

  constructor(private transparencyService: TransparencyService) {
    effect(() => {
      this.pager.updateData(this.filteredTerms());
    });
  }

  pager = new PaginationStateManager<IFixedTerm>(this.itemsPerPage);

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
          this.errorMessage.set('Se produjo un error al intentar cargar los datos de plazos fijos. Por favor, inténtelo de nuevo más tarde.');
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