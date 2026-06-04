import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ICreditCard, IProductPackage, IFixedTerm, ISavingsAccount, IPersonalLoan, IMortgageLoan, IPledgeLoan } from '../../../models/interfaces/itransparency';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransparencyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/transparency`;

  /**
   * Get packages from the API, optionally filtered by entity code.
   * @param entityCode The code of the entity to filter packages by. If not provided, all packages will be returned.
   * @returns An Observable of an array of IProductPackage objects.
   */
  getPackages(entityCode?: number): Observable<IProductPackage[]> {
    let params = new HttpParams();

    if (entityCode) {
      params = params.set('codigoEntidad', entityCode.toString());
    }

    return this.http.get<IProductPackage[]>(`${this.apiUrl}/packages`, { params });
  }

  /**
   * Get credit cards from the API, optionally filtered by entity code.
   * @param entityCode The code of the entity to filter credit cards by. If not provided, all credit cards will be returned.
   * @returns An Observable of an array of ICreditCard objects.
   */
  getCreditCards(entityCode?: number): Observable<ICreditCard[]> {
    let params = new HttpParams();

    if (entityCode) {
      params = params.set('codigoEntidad', entityCode.toString());
    }

    return this.http.get<ICreditCard[]>(`${this.apiUrl}/cards`, { params });
  }

  /**
   * Get fixed terms from the API.
   * @returns An Observable of an array of IFixedTerm objects.
   */
  getFixedTerms(): Observable<IFixedTerm[]> {
    return this.http.get<IFixedTerm[]>(`${this.apiUrl}/fixed-terms`);
  }

  /**
   * Get savings accounts from the API.
   * @returns An Observable of an array of ISavingsAccount objects.
   */
  getSavingsAccounts(): Observable<ISavingsAccount[]> {
    return this.http.get<ISavingsAccount[]>(`${this.apiUrl}/savings-accounts`);
  }

  /**
   * Get personal loans from the API.
   * @returns An observable of an array of IPersonalLoan objects.
   */
  getPersonalLoans(): Observable<IPersonalLoan[]> {
    return this.http.get<IPersonalLoan[]>(`${this.apiUrl}/personal-loans`);
  }

  /**
   * Get mortgage loans from the API.
   * @returns An observable of an array of IMortgageLoan objects.
   */
  getMortgageLoans(): Observable<IMortgageLoan[]> {
    return this.http.get<IMortgageLoan[]>(`${this.apiUrl}/mortgage-loans`);
  }

  /**
   * Get pledge loans from the API.
   * @returns An observable of an array of IPledgeLoan objects.
   */
  getPledgeLoans(): Observable<IPledgeLoan[]> {
    return this.http.get<IPledgeLoan[]>(`${this.apiUrl}/pledge-loans`);
  }
}