import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IApiResponse } from '../../../models/interfaces/iapi-response';
import { ICreditSummary } from '../../../models/interfaces/icredit-summary';
import { IHistoricalItem } from '../../../models/interfaces/ihistorical-item';

import { APP_CONFIG } from '../../../models/constants/app-config';

@Injectable({
  providedIn: 'root',
})
export class CreditReportService {

  private readonly apiUrl = `${APP_CONFIG.api.baseUrl}/debts`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Gets the credit summary for a given CUIT (Current debt + Flattened Rejected Checks).
   * @param cuit - The CUIT of the entity we want to consult.
   * @returns An observable that emits the API response containing the credit summary.
   */
  getCreditSummary(cuit: string): Observable<IApiResponse<ICreditSummary>> {
    return this.http.post<IApiResponse<ICreditSummary>>(`${this.apiUrl}/summary`, { cuit });
  }

  /**
   * Gets the credit summaries for multiple CUITs in batch mode, allowing for a comparative analysis of their credit situations.
   * @param cuits An array of CUIT strings to consult.
   * @returns An observable that emits the API response containing an array of credit summaries.
   */
  getBatchCreditSummary(cuits: string[]): Observable<IApiResponse<ICreditSummary>[]> {
    return this.http.post<IApiResponse<ICreditSummary>[]>(`${this.apiUrl}/batch-summary`, { cuits });
  }
  
  /**
   * Gets the historical evolution of the credit situation for the last months to render the chart.
   * @param cuit - The CUIT of the entity we want to consult.
   * @returns An observable that emits the API response containing an array of historical items.
   */
  getHistoricalEvolution(cuit: string): Observable<IApiResponse<IHistoricalItem[]>> {
    return this.http.post<IApiResponse<IHistoricalItem[]>>(`${this.apiUrl}/history`, { cuit });
  }
}