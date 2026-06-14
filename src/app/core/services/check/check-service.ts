import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IBankEntity } from '../../../models/interfaces/ibank-entity';
import { IReportedCheck } from '../../../models/interfaces/ireportedcheck';

import { APP_CONFIG } from '../../../models/constants/app-config';

@Injectable({
  providedIn: 'root'
})
export class CheckService {

  private readonly apiUrl = `${APP_CONFIG.api.baseUrl}/checks`;

  constructor(private http: HttpClient) { }

  /**
   * Get the list of banking entities to translate codes to names.
   * @returns The list of banking entities.
   */
  getBankingEntities(): Observable<IBankEntity[]> {
    return this.http.get<IBankEntity[]>(`${this.apiUrl}/banks`);
  }

  /**
   * Check the status of a specific check.
   * @returns The status of the check checked.
   */
  searchCheck(entity: string, checkNumber: string): Observable<IReportedCheck> {
    return this.http.get<IReportedCheck>(
      `${this.apiUrl}/search/${entity}/${checkNumber}`
    );
  }
}