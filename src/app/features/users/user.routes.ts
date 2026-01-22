import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./to-do/to-do').then(m => m.ToDoUser)
  }
]