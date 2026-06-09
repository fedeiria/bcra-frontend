import { Component, OnInit, computed, signal, effect } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { IMortgageLoan } from '../../../models/interfaces/itransparency';
import { PaginationStateManager } from '../../../shared/utils/pagination-state-manager.util';
import { Paginator } from '../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-mortgage-loans',
  imports: [CurrencyPipe, Paginator],
  templateUrl: './mortgage-loans.html',
  styleUrl: './mortgage-loans.scss',
})
export class MortgageLoans implements OnInit {

  itemsPerPage = 6;

  // State signals
  loans = signal<IMortgageLoan[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Filter
  searchTerm = signal<string>('');

  selectedLoan = signal<IMortgageLoan | null>(null);

  constructor(private transparencyService: TransparencyService) {
    effect(() => {
      this.pager.updateData(this.filteredLoans());
    });
  }

  pager = new PaginationStateManager<IMortgageLoan>(this.itemsPerPage);

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
          this.errorMessage.set('Se produjo un error al intentar cargar los datos de créditos hipotecarios. Por favor, inténtelo de nuevo más tarde.');
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

  /**
   * Handles the search input event and updates the search term.
   * @param event The input event from the search field. The value of the input is used to filter the packages.
   * @returns void.
   */
  onSearch(event: Event): void {
    const element = event.target as HTMLInputElement;
    this.searchTerm.set(element.value);
  }

  /**
   * Open modal with loan details.
   * @param loan The loan object containing the details to be displayed in the modal.
   * @returns void. Sets the selectedLoan signal to the provided loan and adds a CSS class to the body to display the modal.
   */
  openModal(loan: IMortgageLoan): void {
    this.selectedLoan.set(loan);
    document.body.classList.add('modal-open');
  }

  /**
   * Close the modal and clear the selected loan.
   * @returns void. Resets the selectedLoan signal to null and removes the CSS class from the body to hide the modal.
   */
  closeModal(): void {
    this.selectedLoan.set(null);
    document.body.classList.remove('modal-open');
  }
}