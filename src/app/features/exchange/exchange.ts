import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { ExchangeService } from '../../core/services/exchange/exchange-service';
import { ICurrency, IRatesResponse } from '../../models/interfaces/iexchange';
import { Header } from "../../shared/components/header/header";
import { Footer } from "../../shared/components/footer/footer";

@Component({
  selector: 'app-exchange',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe, Header, Footer],
  templateUrl: './exchange.html',
  styleUrl: './exchange.scss',
})
export class Exchange implements OnInit {
  currencies: ICurrency[] = [];
  evolutionData: IRatesResponse[] = [];

  selectedCurrency: string = '';
  fromDate: string = '';
  toDate: string = '';

  loading: boolean = false;
  alreadySearched: boolean = false;
  errorMessage: string = '';

  constructor(private exchangeService: ExchangeService) { }

  ngOnInit(): void {
    this.loadExchangeList();
  }

  /**
   * Load the list of available currencies from the backend and populate the dropdown selector.
   * @returns void
   */
  async loadExchangeList(): Promise<void> {
    try {
      const res = await firstValueFrom(this.exchangeService.getCurrencies());
      
      if (!res.error) {
        this.currencies = res.data;
      }
      else {
        this.errorMessage = res.message || 'Error al cargar el listado de monedas.';
      }
    }
    catch (error) {
      this.errorMessage = 'No se pudo conectar con el servidor para obtener las monedas.';
    }
  }

  /**
   * Consult the historical evolution of the selected currency based on the provided date range.
   * @returns A Promise that resolves when the data is loaded and the component state is updated.
   */
  async checkCurrencyEvolution(): Promise<void> {
    if (!this.selectedCurrency) return;

    this.loading = true;
    this.alreadySearched = true;
    this.errorMessage = '';
    this.evolutionData = [];

    try {
      const res = await firstValueFrom(
        this.exchangeService.getCurrencyEvolution(this.selectedCurrency, this.fromDate, this.toDate)
      );

      if (!res.error) {
        this.evolutionData = res.data.results;
        this.alreadySearched = true;
      }
      else {
        this.errorMessage = res.message || 'El BCRA no pudo procesar la consulta.';
      }
    }
    catch (error) {
      this.errorMessage = 'Ocurrió un error inesperado al consultar las estadísticas.';
    }
    finally {
      this.loading = false;
    }
  }
}