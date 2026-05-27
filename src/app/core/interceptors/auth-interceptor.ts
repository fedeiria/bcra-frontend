import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';

import { AuthService } from '../services/auth/auth-service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Omit login and refresh endpoints to avoid infinite loops
  if (request.url.includes('/login') || request.url.includes('/refresh')) {
    return next(request);
  }

  const token = authService.getToken();
  if (token) {
    request = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((response: any) => {
              isRefreshing = false;
              const newToken = response.data.accessToken;
              refreshTokenSubject.next(newToken);
              
              // Retry the original request with the new token
              return next(request.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              }));
            }),
            catchError((refreshError) => {
              // If the /refresh endpoint also returns an error, the session has completely died.
              isRefreshing = false;
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        }
        else {
          // If there is already a refresh process underway, I pause this secondary request and wait for the BehaviorSubject to issue the new token
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(newToken => {
              return next(request.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              }));
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};