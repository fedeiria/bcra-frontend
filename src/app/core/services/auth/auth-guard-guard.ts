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
      // Check if either of the two tokens exists in localStorage
      const hasAccessToken = !!authService.getToken();
      const hasRefreshToken = !!localStorage.getItem('refresh_token');

      // If a user exists in memory, or if there is at least one token that allows attempting to restore the session, then I allow the passage.
      if (user || hasAccessToken || hasRefreshToken) {
        return true;
      }

      console.warn('Acceso denegado por el Guard: No hay tokens para restaurar la sesión.');

      authService.logout(); 
      router.navigate(['/login']);
      
      return false;
    })
  );
};