import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { IExchangeApiResponse, ICurrency, IRatesResponse, IEvolutionResponse } from '../../../models/interfaces/iexchange';

@Injectable({
  providedIn: 'root'
})
export class ExchangeService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/exchange`;
  
  /**
   * Get the list of available currencies.
   * @returns Observable with the list of currencies.
   */
  getCurrencies(): Observable<IExchangeApiResponse<ICurrency[]>> {
    return this.http.get<IExchangeApiResponse<ICurrency[]>>(`${this.API_URL}/currencies`);
  }

  /**
   * Get exchange rates for a specific date.
   * @param fecha Format 'yyyy-MM-dd'
   * @returns Observable with the exchange rates.
   */
  getRatesByDate(fecha?: string): Observable<IExchangeApiResponse<IRatesResponse>> {
    let params = new HttpParams();

    if (fecha) {
      params = params.set('fecha', fecha);
    }
    return this.http.get<IExchangeApiResponse<IRatesResponse>>(`${this.API_URL}/rates`, { params });
  }

  /**
   * Get the historical evolution of a specific currency.
   * @param moneda Código ISO (ej: 'USD', 'EUR')
   * @param desde Format 'yyyy-MM-dd'
   * @param hasta Format 'yyyy-MM-dd'
   * @returns Observable with the currency evolution data.
   */
  getCurrencyEvolution(moneda: string, desde?: string, hasta?: string): Observable<IExchangeApiResponse<IEvolutionResponse>> {
    let params = new HttpParams();

    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get<IExchangeApiResponse<IEvolutionResponse>>(
      `${this.API_URL}/evolution/${moneda}`, { params });
  }
}