import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

function getHomeRouteByRole(role?: string): string {
  if (role === 'ADMIN') return '/admin';
  return '/dashboard';
}

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  void router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

export const publicGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  void router.navigate([getHomeRouteByRole(authService.getCurrentUser()?.rol)]);
  return false;
};
