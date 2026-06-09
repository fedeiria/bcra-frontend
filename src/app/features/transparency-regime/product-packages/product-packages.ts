import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { IProductPackage } from '../../../models/interfaces/itransparency';
import { PaginationStateManager } from '../../../shared/utils/pagination-state-manager.util';
import { Paginator } from '../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-product-packages',
  standalone: true,
  imports: [CommonModule, Paginator],
  templateUrl: './product-packages.html',
  styleUrl: './product-packages.scss',
})
export class ProductPackages implements OnInit {

  itemsPerPage = 6;

  // State signals
  packages = signal<IProductPackage[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // Filter
  searchTerm = signal<string>('');

  constructor(private transparencyService: TransparencyService) {
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

  ngOnInit(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.transparencyService.getPackages().subscribe({
      next: (data) => {
        this.packages.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        if (!navigator.onLine) {
          this.errorMessage.set('Parece que no tenés conexión a internet. Verificá tu red y reintentá.');
        }
        else {
          this.errorMessage.set('Se produjo un error al intentar cargar los datos de paquetes de productos. Por favor, inténtelo de nuevo más tarde.');
        }
        this.isLoading.set(false);
        console.error('product-packages.ts: ', err);
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