import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UiNotificationService } from '../services/ui-notification.service';

const SILENT_URLS = ['/suscripciones/planes'];

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/reset-password') ||
    url.includes('/usuarios/registro')
  );
}

function isSilent(url: string): boolean {
  return SILENT_URLS.some(u => url.includes(u));
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const ui = inject(UiNotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (!isAuthEndpoint(req.url)) {
          auth.clearSession(false);
          const returnUrl = router.url && !router.url.startsWith('/login') ? router.url : '/dashboard';
          void router.navigate(['/login'], { queryParams: { returnUrl } });
          ui.warning('Tu sesion expiro. Inicia sesion de nuevo.');
        }
      } else if (error.status === 403) {
        if (!isSilent(req.url)) {
          ui.warning('No tienes permisos para esta accion.');
        }
      } else if (error.status === 0) {
        if (!isSilent(req.url)) {
          ui.error('No se pudo conectar con el servidor. Verifica red o backend.');
        }
      } else if (error.status >= 500) {
        if (!isSilent(req.url)) {
          ui.error('Ocurrio un error en el servidor. Intenta de nuevo en unos segundos.');
        }
      }

      return throwError(() => error);
    })
  );
};
