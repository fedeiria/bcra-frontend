import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { IMonetaryApiResponse, IMonetaryVariable, IMonetaryMethodology, IMonetaryHistoryResult } from '../../../models/interfaces/imonetary';

@Injectable({
  providedIn: 'root'
})
export class MonetaryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/monetary`;

  getVariables(): Observable<IMonetaryApiResponse<IMonetaryVariable[]>> {
    return this.http.get<IMonetaryApiResponse<IMonetaryVariable[]>>(`${this.apiUrl}/variables`);
  }

  getMethodologies(): Observable<IMonetaryApiResponse<IMonetaryMethodology[]>> {
    return this.http.get<IMonetaryApiResponse<IMonetaryMethodology[]>>(`${this.apiUrl}/methodologies`);
  }

  getVariableHistory(id: number, desde?: string, hasta?: string): Observable<IMonetaryApiResponse<IMonetaryHistoryResult[]>> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get<IMonetaryApiResponse<IMonetaryHistoryResult[]>>(`${this.apiUrl}/variables/${id}`, { params });
  }
}