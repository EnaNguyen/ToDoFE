import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'Demo',
    loadComponent: () => import('./to-do/to-do').then(m => m.ToDoAdminComponent)
  }
]