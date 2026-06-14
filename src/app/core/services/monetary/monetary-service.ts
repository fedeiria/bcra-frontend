import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { IMonetaryVariable, IMonetaryMethodology, IMonetaryHistoryResult } from '../../../models/interfaces/imonetary';

@Injectable({
  providedIn: 'root'
})
export class MonetaryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/monetary`;

  /**
   * Get the list of monetary variables.
   * @returns An observable of the API response containing an array of monetary variables.
   */
  getVariables(): Observable<IMonetaryVariable[]> {
    return this.http.get<IMonetaryVariable[]>(`${this.apiUrl}/variables`);
  }

  /**
   * Get the list of methodologies.
   * @returns An observable of the API response containing an array of methodologies.
   */
  getMethodologies(): Observable<IMonetaryMethodology[]> {
    return this.http.get<IMonetaryMethodology[]>(`${this.apiUrl}/methodologies`);
  }

  /**
   * Get the historical data for a specific variable, optionally filtered by date range.
   * @param id The ID of the variable to retrieve history for.
   * @param desde The start date for the historical data (optional, format: YYYY-MM-DD).
   * @param hasta The end date for the historical data (optional, format: YYYY-MM-DD).
   * @returns An observable of the API response containing the historical data for the specified variable.
   */
  getVariableHistory(id: number, desde?: string, hasta?: string): Observable<IMonetaryHistoryResult[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get<IMonetaryHistoryResult[]>(`${this.apiUrl}/variables/${id}`, { params });
  }
}