import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(c => c.Login),
  },
  {
    path: 'credit-report',
    loadComponent: () => import('./features/credit-report/credit-report').then(c => c.CreditReport),
    canActivate: [authGuard]
  },
  {
    path: 'check-verification',
    loadComponent: () => import('./features/check-verification/check-verification').then(c => c.CheckVerification),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];