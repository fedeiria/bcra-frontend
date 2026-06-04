import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject, signal, computed } from '@angular/core';

import { TransparencyService } from '../../../core/services/transparency/transparency-service';
import { IProductPackage } from '../../../models/interfaces/itransparency';

@Component({
  selector: 'app-product-packages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-packages.html',
  styleUrl: './product-packages.scss',
})
export class ProductPackages implements OnInit {

  private transparencyService = inject(TransparencyService);

  // Search signals
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);

  packages = signal<IProductPackage[]>([]);
  isLoading = signal<boolean>(true);

  errorMessage = signal<string | null>(null);

  readonly itemsPerPage = 6;

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

  // Paginate the filtered results
  paginatedPackages = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    return this.filteredPackages().slice(startIndex, endIndex);
  });

  // Calc total pages based on filtered results
  totalPages = computed(() => {
    return Math.ceil(this.filteredPackages().length / this.itemsPerPage);
  });

  // Generate an array of page numbers for pagination controls
  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 5; // Cantidad máxima de números a mostrar

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    // Adjust start if we are near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
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
          this.errorMessage.set('Se produjo un error al cargar los paquetes de productos. Por favor, inténtelo de nuevo más tarde.');
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