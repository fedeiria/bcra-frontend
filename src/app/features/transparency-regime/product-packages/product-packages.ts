import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { IProductPackage } from '../../../models/interfaces/itransparency';
import { PaginationStateManager } from '../../../shared/utils/pagination-state-manager.util';
import { Paginator } from '../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-product-packages',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, Paginator, TitleCasePipe],
  templateUrl: './product-packages.html',
  styleUrl: './product-packages.scss',
})
export class ProductPackages implements OnInit {
  private readonly transparencyService = inject(TransparencyService);
  readonly itemsPerPage = 6;

  // State signals
  packages = signal<IProductPackage[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // Filter
  searchTerm = signal<string>('');

  constructor() {
    effect(() => {
      this.pager.updateData(this.filteredPackages());
    });
  }

  pager = new PaginationStateManager<IProductPackage>(this.itemsPerPage);

  // Computed signal that filters packages based on the search term.
  // It checks if the search term is included in either the descripcionEntidad or nombreCompleto fields of the package.
  filteredPackages = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allPackages = this.packages();
    
    if (!term) return allPackages;
    
    return allPackages.filter(p => {
      const entidad = (p.descripcionEntidad ?? '').toLowerCase();
      const nombre = (p.nombreCompleto ?? '').toLowerCase();
      const segmento = (p.segmento ?? '').toLowerCase();

      return entidad.includes(term) || nombre.includes(term) || segmento.includes(term);
    });
  });

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  /**
   * Loads mortgage loans data from the TransparencyService and updates the component state accordingly.
   * Handles loading state and error messages based on the success or failure of the data retrieval.
   * @returns Promise<void>. Updates the fixedTerms signal with the retrieved data, sets isLoading to false, and handles any errors by setting an appropriate error message.
   */
  async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(this.transparencyService.getPackages());
      const safeData = Array.isArray(response) ? response : (response as any)?.results || [];
      this.packages.set(safeData);
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
      this.errorMessage.set(error.error?.message || 'Se produjo un error al intentar cargar los datos de los paquetes de productos.');
    }
    else {
      this.errorMessage.set('Se produjo un error inesperado. Por favor, inténtelo de nuevo más tarde.');
    }
  }
}