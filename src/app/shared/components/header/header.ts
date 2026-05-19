import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Component, inject } from '@angular/core';

import { AuthService } from '../../../core/services/auth/auth-service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  public authService = inject(AuthService);
  private router = inject(Router);

  onLogout(): void {
    // Clear the authentication state by calling the logout method in the AuthService, which typically removes the token and any user information from storage.
    this.authService.logout();
    // Redirect the user to the login page after logging out to ensure they cannot access protected routes without re-authenticating.
    this.router.navigate(['/login']);
  }
}
