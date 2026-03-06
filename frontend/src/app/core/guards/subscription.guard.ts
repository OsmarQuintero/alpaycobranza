import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SubscriptionService } from '../services/subscription.service';

export const subscriptionGuard: CanActivateFn = (_route, state) => {
  if (!environment.subscriptionEnforced) {
    return true;
  }

  const subscription = inject(SubscriptionService);
  const router = inject(Router);

  return subscription.checkActive().pipe(
    map(active => {
      if (active) return true;

      const raw = state.url || '/dashboard';
      const returnUrl = raw === '/login' || raw === '/register' ? '/dashboard' : raw;

      return router.createUrlTree(['/planes'], {
        queryParams: { returnUrl }
      });
    })
  );
};
