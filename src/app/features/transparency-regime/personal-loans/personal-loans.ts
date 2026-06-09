import { Component, OnInit, computed, signal, effect } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { IPersonalLoan } from '../../../models/interfaces/itransparency';
import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { PaginationStateManager } from '../../../shared/utils/pagination-state-manager.util';
import { Paginator } from '../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-personal-loans',
  imports: [CurrencyPipe, Paginator],
  templateUrl: './personal-loans.html',
  styleUrl: './personal-loans.scss',
})
export class PersonalLoans implements OnInit {

  itemsPerPage = 10;

  // State signals
  loans = signal<IPersonalLoan[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Filter
  searchTerm = signal<string>('');

  constructor(private transparencyService: TransparencyService) {
    effect(() => {
      this.pager.updateData(this.filteredLoans());
    });
  }

  pager = new PaginationStateManager<IPersonalLoan>(this.itemsPerPage);
  
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
          this.errorMessage.set('Se produjo un error al intentar cargar los datos de préstamos personales. Por favor, inténtelo de nuevo más tarde.');
        }
        this.isLoading.set(false);
        console.error('personal-loans.ts: ', err);
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