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
    loadComponent: () => import('./features/monetary-variables/monetary-variables').then(c => c.MonetaryVariables),
  },
  {
    path: 'exchange-stats',
    loadComponent: () => import('./features/exchange-stats/exchange-stats').then(c => c.ExchangeStats),
  },
  {
    path: 'transparency-regime',
    loadChildren: () => import('./features/transparency-regime/transparency-regime.routes').then(r => r.TRANSPARENCY_ROUTES),
  },
  {
    path: '**',
    redirectTo: ''
  }
];