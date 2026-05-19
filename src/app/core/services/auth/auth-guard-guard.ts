import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, take } from 'rxjs';

import { AuthService } from './auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      // Get token existence directly from the service to ensure we check the actual stored token, not just the in-memory user state.
      const hasToken = !!authService.getToken();

      // If we have a user and a token, allow access.
      if (user && hasToken) {
        return true;
      }

      // If the user is not authenticated or the token is missing, redirect to the login page.
      console.warn('Acceso denegado por el Guard: Sesión inválida o inexistente.');

      authService.logout(); 
      router.navigate(['/login']);
      
      return false;
    })
  );
};