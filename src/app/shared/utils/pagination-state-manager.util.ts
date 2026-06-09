import { signal, computed } from '@angular/core';

export class PaginationStateManager<T> {

    private INITIAL_PAGE_SIZE: number = 10;

    filteredItems = signal<T[]>([]);
    currentPage = signal<number>(1);
    pageSize = signal<number>(this.INITIAL_PAGE_SIZE);

    constructor(initialPageSize: number = this.INITIAL_PAGE_SIZE) {
        this.pageSize.set(initialPageSize);
    }

    // Total number of pages calculated dynamically
    totalPages = computed(() => {
        return Math.ceil(this.filteredItems().length / this.pageSize()) || 1;
    });

    // Items that will actually be rendered in the current view
    paginatedItems = computed(() => {
        const startIndex = (this.currentPage() - 1) * this.pageSize();
        return this.filteredItems().slice(startIndex, startIndex + this.pageSize());
    });

    // Array of page numbers for the @for loop of the <app-paginator> component
    pageNumbers = computed(() => {
        const total = this.totalPages();
        return Array.from({ length: total }, (_, i) => i + 1);
    });

    // Method to update data from the component
    updateData(newData: T[]) {
        this.filteredItems.set(newData);
        this.currentPage.set(1); // Reset to the first page if the data changes.
    }

    /**
     * Navigates to a specific page.
     * @param page The page number to navigate to.
     * @return void. Updates the currentPage signal to the specified page number if it's within valid range.
     */
    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }
}