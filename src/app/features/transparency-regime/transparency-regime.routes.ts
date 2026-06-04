import { Routes } from '@angular/router';

import { TransparencyRegime } from './transparency-regime';

export const TRANSPARENCY_ROUTES: Routes = [
  {
    path: '',
    component: TransparencyRegime,
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
        path: 'personal-loans',
        loadComponent: () => import('./personal-loans/personal-loans').then(m => m.PersonalLoans)
      },
      {
        path: 'mortgage-loans',
        loadComponent: () => import('./mortgage-loans/mortgage-loans').then(m => m.MortgageLoans)
      },
      {
        path: 'pledge-loans',
        loadComponent: () => import('./pledge-loans/pledge-loans').then(m => m.PledgeLoans)
      },
      {
        path: '',
        redirectTo: 'product-packages',
        pathMatch: 'full'
      }
    ]
  }
];