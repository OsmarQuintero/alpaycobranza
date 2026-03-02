import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowed = (route.data?.['roles'] as string[]) || [];
  const user = authService.getCurrentUser();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (allowed.length === 0 || allowed.includes(user.rol)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};


