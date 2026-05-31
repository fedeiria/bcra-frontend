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
    path: 'monetary',
    loadComponent: () => import('./features/monetary/monetary').then(c => c.Monetary),
  },
  {
    path: '**',
    redirectTo: ''
  }
];