import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth/auth-service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading: boolean = false;
  errorMessage: string = '';
  currentYear: number = new Date().getFullYear();

  /**
   * Check the credentials login.
   * @returns void.
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
      next: (response) => {
        if (!response.error && response.data?.accessToken) {
          this.router.navigate(['/credit-report']).then(() => {
             this.isLoading = false;
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Credenciales inválidas. Intente nuevamente.';
        console.error(err);
      }
    });
    }
  }
}