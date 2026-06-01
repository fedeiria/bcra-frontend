import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/credit-report/credit-report').then(c => c.CreditReport),
  },
  {
    path: 'credit-report',
    loadComponent: () => import('./features/credit-report/credit-report').then(c => c.CreditReport),
  },
  {
    path: 'check-verification',
    loadComponent: () => import('./features/check-verification/check-verification').then(c => c.CheckVerification),
  },
  {
    path: 'monetary-variables',
    loadComponent: () => import('./features/monetary/monetary').then(c => c.Monetary),
  },
  {
    path: 'exchange-stats',
    loadComponent: () => import('./features/exchange/exchange').then(c => c.Exchange),
  },
  {
    path: '**',
    redirectTo: ''
  }
];