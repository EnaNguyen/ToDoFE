import { Routes } from '@angular/router';
import { ADMIN_ROUTES } from './features/admins/admin.routes';
import { USER_ROUTES } from './features/users/user.routes';
export const routes: Routes = [
  {
    path: 'admin',
    children: ADMIN_ROUTES
  },
  {
    path: 'login',
    loadComponent: () => import('../app/features/users/login/login').then(m => m.Login)
  },
  {
    path: '',
    children: USER_ROUTES
  }
];
