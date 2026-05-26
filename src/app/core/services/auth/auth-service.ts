import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ILoginResponse } from '../../../models/interfaces/ilogin-response';
import { APP_CONFIG } from '../../../models/constants/app-config';
import { IUser } from '../../../models/interfaces/iuser';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private logoutTimer: any;

  private readonly API_URL = APP_CONFIG.api.authEndpoint;
  private readonly TOKEN_KEY = APP_CONFIG.session.tokenKey;
  private readonly REFRESH_TOKEN_KEY = APP_CONFIG.session.refreshTokenKey;
  private readonly USER_KEY = APP_CONFIG.session.userKey;

  private currentUserSubject = new BehaviorSubject<IUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkToken();
  }

  /**
   * Logs in the user with the provided email and password.
   * @param email The email of the user trying to log in.
   * @param passwordPlain The plain text password of the user trying to log in.
   * @returns Observable that emits the login response from the API, which includes the access token and user information if successful, or an error message if not.
   */
  login(email: string, passwordPlain: string): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(`${this.API_URL}/login`, { email, passwordPlain }).pipe(
      tap(response => {
        if (!response.error && response.data?.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, response.data.accessToken);

          if (response.data.refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, response.data.refreshToken);
          }

          localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  /**
   * Request dedicated to requesting a new access token using the update token.
   * @returns Observable<any> with the new access token.
   */
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    return this.http.post<any>(`${this.API_URL}/refresh`, { refreshToken }).pipe(
      tap(response => {
        if (!response.error && response.data?.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, response.data.accessToken);
        }
      })
    );
  }

  /**
   * Logs out the current user by removing the token from localStorage and resetting the current user subject.
   * This will effectively end the user's session and update any subscribed components to reflect that no user is currently logged in.
   * @returns void.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Retrieves the stored authentication token from localStorage. This can be used by HTTP interceptors to attach the token to outgoing requests for authenticated endpoints.
   * @returns The authentication token if it exists, otherwise null.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Decode the JWT payload to extract user data.
   * @returns any.
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      return JSON.parse(window.atob(base64));
    }
    catch (error) {
      console.error('Error al decodificar el token', error);
      return null;
    }
  }

  /**
   * Checks if there is a valid token in localStorage when the service is initialized.
   * @returns void.
   */
  private checkToken(): void {
    const token = this.getToken();
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const storedUser = localStorage.getItem(this.USER_KEY);

    // If there is a token (of any type) and the user data is saved
    if ((token || refreshToken) && storedUser) {
      try {
        // Restore the user in memory (BehaviorSubject)
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
      catch (e) {
        this.logout();
      }
    }
    else {
      this.logout();
    }
  }
}