import { Routes } from '@angular/router';

import { authGuard } from './core/services/auth/auth-guard-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(c => c.Login),
  },
  {
    path: 'consultation',
    loadComponent: () => import('./features/consultation/consultation').then(c => c.Consultation),
    canActivate: [authGuard]
  },
  {
    path: 'checks',
    loadComponent: () => import('./features/check/check-consultation').then(c => c.ChecksConsultation),
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