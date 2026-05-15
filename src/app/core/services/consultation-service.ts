import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IApiResponse } from '../../models/interfaces/iapi-response';
import { ICreditSummary } from '../../models/interfaces/icredit-summary';

@Injectable({
  providedIn: 'root',
})
export class ConsultationService {

  private apiUrl = 'http://localhost:3000/consultation';

  constructor(private http: HttpClient) {}

  getSummary(cuit: string): Observable<IApiResponse<ICreditSummary>> {
    return this.http.post<IApiResponse<ICreditSummary>>(`${this.apiUrl}/summary`, { cuit });
  }
}
