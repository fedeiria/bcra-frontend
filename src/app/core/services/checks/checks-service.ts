import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IApiResponse } from '../../../models/interfaces/iapi-response';
import { IBankEntity } from '../../../models/interfaces/ibank-entity';
import { IReportedCheck } from '../../../models/interfaces/ireportedcheck';

@Injectable({
  providedIn: 'root'
})
export class ChecksService {

  private readonly apiUrl = 'http://localhost:3000/checks';

  constructor(private http: HttpClient) { }

  /**
   * Get the list of banking entities to translate codes to names.
   * @returns The list of banking entities.
   */
  getBankingEntities(): Observable<IApiResponse<IBankEntity[]>> {
    return this.http.get<IApiResponse<IBankEntity[]>>(`${this.apiUrl}/banks`);
  }

  /**
   * Check the status of a specific check.
   * @returns The status of the check checked.
   */
  searchCheck(entity: string, checkNumber: string): Observable<IApiResponse<IReportedCheck>> {
    return this.http.get<IApiResponse<IReportedCheck>>(
      `${this.apiUrl}/search/${entity}/${checkNumber}`
    );
  }
}