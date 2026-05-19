import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ILoginResponse } from '../../../models/interfaces/ilogin-response';
import { APP_CONFIG } from '../../../models/constants/app-config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private logoutTimer: any;

  private readonly API_URL = APP_CONFIG.api.authEndpoint;
  private readonly TOKEN_KEY = APP_CONFIG.session.tokenKey;
  private readonly USER_KEY = APP_CONFIG.session.userKey;
  private readonly TIMESTAMP_KEY = APP_CONFIG.session.timestampKey;

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkToken();
  }

  /**
   * Logs in the user with the provided email and password.
   * @param email The email of the user trying to log in
   * @param passwordPlain The plain text password of the user trying to log in
   * @returns Observable that emits the login response from the API, which includes the access token and user information if successful, or an error message if not.
   */
  login(email: string, passwordPlain: string): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(`${this.API_URL}/login`, { email, passwordPlain }).pipe(
      tap(response => {
        if (!response.error && response.data?.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, response.data.accessToken);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
          localStorage.setItem(this.TIMESTAMP_KEY, Date.now().toString());

          this.currentUserSubject.next(response.data.user);
          this.startAutoLogoutTimer(APP_CONFIG.session.tokenExpirationMs);
        }
      })
    );
  }

  /**
   * Logs out the current user by removing the token from localStorage and resetting the current user subject. This will effectively end the user's session and update any subscribed components to reflect that no user is currently logged in.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TIMESTAMP_KEY);

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

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
   * Checks if there is a valid token in localStorage when the service is initialized. If a token exists, it assumes the user is logged in and updates the current user subject accordingly. In a real application, you might want to decode the token to get user information and check its validity (e.g., expiration) instead of just checking for its existence.
   */
  private checkToken(): void {
    const token = this.getToken();
    const currentUser = localStorage.getItem(this.USER_KEY);
    const loginTimestamp = localStorage.getItem(this.TIMESTAMP_KEY);

    if (token && currentUser && loginTimestamp) {
      const timeElapsed = Date.now() - parseInt(loginTimestamp, 10);
      const expirationLimit = APP_CONFIG.session.tokenExpirationMs; // <-- Tiempo parametrizado

      if (timeElapsed >= expirationLimit) {
        this.logout();
      }
      else {
        this.currentUserSubject.next(JSON.parse(currentUser));
        
        const timeLeft = expirationLimit - timeElapsed;
        this.startAutoLogoutTimer(timeLeft);
      }
    }
    else if (token) {
      this.currentUserSubject.next({ email: 'Usuario', loggedIn: true });
    }
  }

  /**
   * Set a timer to automatically log out the user after a specified duration. This is useful for implementing session timeouts. If the timer expires, the user will be logged out and redirected to the login page. If the user logs out manually or if a new timer is set, any existing timer will be cleared to prevent unintended logouts.
   * @param duration The duration (in milliseconds) after which the user should be automatically logged out.
   */
  private startAutoLogoutTimer(duration: number): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    this.logoutTimer = setTimeout(() => {
      console.warn('Tiempo de sesión cumplido de forma pasiva. Forzando logout...');
      this.logout();

      window.location.href = '/login';
    }, duration);
  }
}
