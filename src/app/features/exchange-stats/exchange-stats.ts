import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { ExchangeService } from '../../core/services/exchange/exchange-service';
import { ICurrency, IRatesResponse } from '../../models/interfaces/iexchange';
import { Header } from "../../shared/components/header/header";
import { Footer } from "../../shared/components/footer/footer";
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-exchange-stats',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe, Header, Footer],
  templateUrl: './exchange-stats.html',
  styleUrl: './exchange-stats.scss',
})
export class ExchangeStats implements OnInit {
  // Signal states
  currencies = signal<ICurrency[]>([]);
  evolutionData = signal<IRatesResponse[]>([]);

  selectedCurrency = signal<string>('');
  fromDate = signal<string>('');
  toDate = signal<string>('');

  loading = signal<boolean>(false);
  alreadySearched = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  private readonly exchangeService = inject(ExchangeService);

  ngOnInit(): void {
    this.loadExchangeList();
  }

  /**
   * Load the list of available currencies from the backend and populate the dropdown selector.
   * @returns void
   */
  async loadExchangeList(): Promise<void> {
    try {
      const currencies = await firstValueFrom(this.exchangeService.getCurrencies());
      this.currencies.set(currencies);
    }
    catch (error: unknown) {
      this.handleHttpError(error, 'No se pudo conectar con el servidor para obtener las monedas.');
    }
  }

  /**
   * Consult the historical evolution of the selected currency based on the provided date range.
   * @returns A Promise that resolves when the data is loaded and the component state is updated.
   */
  async checkCurrencyEvolution(): Promise<void> {
    if (!this.selectedCurrency()) return;

    this.loading.set(true);
    this.alreadySearched.set(true);
    this.errorMessage.set(null);
    this.evolutionData.set([]);

    try {
      const response = await firstValueFrom(
        this.exchangeService.getCurrencyEvolution(this.selectedCurrency(), this.fromDate(), this.toDate())
      );

      const dataArray = response?.results || [];
      this.evolutionData.set(dataArray);
    }
    catch (error: unknown) {
      this.handleHttpError(error, 'Ocurrió un error inesperado al consultar las estadísticas.');
    }
    finally {
      this.loading.set(false);
    }
  }

  /**
   * Handle HTTP error messages.
   * @param error Error to handle. 
   * @param defaultMsg The message to show.
   * @returns void.
   */
  private handleHttpError(error: unknown, defaultMsg: string): void {
    if (error instanceof HttpErrorResponse) {
      this.errorMessage.set(error.error?.message || defaultMsg);
    }
    else {
      this.errorMessage.set(defaultMsg);
    }
  }
}