import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [],
  templateUrl: './paginator.html',
  styleUrl: './paginator.scss',
})
export class Paginator {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pageNumbers = input.required<number[]>();

  // Event emit when the user change the page
  pageChange = output<number>();

  // Nuevo computado para evitar que el paginador explote horizontalmente
  visiblePages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const maxVisible = 5;
    
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    // Adjust the start if it's near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  });

  onPageClick(page: number): void {
    this.pageChange.emit(page);
  }
}