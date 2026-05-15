import { Routes } from '@angular/router';
import { Consultation } from './features/consultation/consultation';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/consultation',
        pathMatch: 'full'
    },
    {
        path: 'consultation',
        component: Consultation
    }
];
