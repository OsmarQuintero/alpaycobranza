import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ApiAlpayService } from '../../services/api-alpay';

const STORAGE_KEY = 'alpay_subscription_active';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly api = inject(ApiAlpayService);
  private readonly platformId = inject(PLATFORM_ID);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  isActiveLocal(): boolean {
    if (!this.isBrowser()) return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }

  setActiveLocal(active: boolean): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEY, String(active));
  }

  clearLocal(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEY);
  }

  checkActive(): Observable<boolean> {
    if (!this.isBrowser()) {
      return of(true);
    }

    return this.api.getSubscriptionStatus().pipe(
      map(resp => !!resp?.active),
      tap(active => this.setActiveLocal(active)),
      catchError(() => of(this.isActiveLocal()))
    );
  }
}
