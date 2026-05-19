import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth-service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Clone the request and add the Authorization header if the token exists.
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Fordward the request and handle errors, particularly 401 Unauthorized responses.
  return next(request).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse) {
        // If nestJS returns a 401, it means the token is invalid or expired
        if (error.status === 401) {
          console.warn('La sesión expiró o el token es inválido. Redirigiendo al login...');
          
          // Clean up the session (remove token, user info, etc.)
          authService.logout();
          
          // Redirect to the login page.
          router.navigate(['/login']);
        }
      }
      // Resend the error to be handled by other parts of the app if needed.
      return throwError(() => error);
    })
  );
};