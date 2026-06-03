import { Routes } from '@angular/router';

import { Transparency } from './transparency';

export const TRANSPARENCY_ROUTES: Routes = [
  {
    path: '',
    component: Transparency,
    children: [
      {
        path: 'product-packages',
        loadComponent: () => import('./product-packages/product-packages').then(m => m.ProductPackages)
      },
      {
        path: 'credit-cards',
        loadComponent: () => import('./credit-cards/credit-cards').then(m => m.CreditCards)
      },
      {
        path: 'fixed-terms',
        loadComponent: () => import('./fixed-terms/fixed-terms').then(m => m.FixedTerms)
      },
      {
        path: 'savings-accounts',
        loadComponent: () => import('./savings-accounts/savings-accounts').then(m => m.SavingsAccounts)
      },
      {
        path: '',
        redirectTo: 'product-packages',
        pathMatch: 'full'
      }
    ]
  }
];