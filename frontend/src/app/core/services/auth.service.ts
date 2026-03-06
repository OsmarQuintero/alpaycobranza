import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { AuthResponse } from '../../models/auth.model';
import { ApiAlpayService } from '../../services/api-alpay';
import { SubscriptionService } from './subscription.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  rol?: 'ADMIN' | 'COBRADOR' | 'OFICINA';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiAlpayService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private subscription = inject(SubscriptionService);

  currentUser = signal<Usuario | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.checkAuthStatus();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private normalizeRole(role: unknown): 'ADMIN' | 'COBRADOR' | 'OFICINA' {
    const raw = (role ?? 'COBRADOR').toString().toUpperCase();
    const normalized = raw.replace(/^ROLE_/, '');
    if (normalized === 'ADMIN' || normalized === 'OFICINA' || normalized === 'COBRADOR') {
      return normalized;
    }
    return 'COBRADOR';
  }

  private normalizeUser(raw: any): Usuario {
    return {
      id: raw?.id ?? raw?.id_usuario ?? raw?.idUsuario,
      nombre: raw?.nombre ?? '',
      email: raw?.email ?? '',
      telefono: raw?.telefono ?? '',
      rol: this.normalizeRole(raw?.rol),
      estado: raw?.estado,
      creadoEn: raw?.creadoEn ?? raw?.creado_en,
      foto_url: raw?.foto_url ?? raw?.fotoUrl
    };
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const json = atob(padded);
      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeJwtPayload(token);
    const exp = Number(payload?.['exp']);

    if (!Number.isFinite(exp) || exp <= 0) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return exp <= now;
  }

  private checkAuthStatus(): void {
    if (!this.isBrowser()) return;

    const token = this.getToken();
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      this.clearSession(false);
      return;
    }

    if (this.isTokenExpired(token)) {
      this.clearSession(false);
      return;
    }

    try {
      const user = this.normalizeUser(JSON.parse(userStr));
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      localStorage.setItem('user', JSON.stringify(user));
    } catch {
      this.clearSession(false);
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.apiService.login(credentials).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  register(userData: RegisterData): Observable<AuthResponse> {
    return this.apiService.register(userData).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  private setSession(authResult: AuthResponse): void {
    const normalizedUser = this.normalizeUser(authResult.user as any);

    if (this.isBrowser()) {
      localStorage.setItem('authToken', authResult.token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    }

    this.currentUser.set(normalizedUser);
    this.isAuthenticated.set(true);
  }

  clearSession(redirectToLogin = false): void {
    if (this.isBrowser()) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }

    this.currentUser.set(null);
    this.isAuthenticated.set(false);

    if (redirectToLogin) {
      void this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.subscription.clearLocal();
    this.clearSession(true);
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    if (this.isTokenExpired(token)) {
      this.clearSession(false);
      return false;
    }

    return this.isAuthenticated();
  }

  getCurrentUser(): Usuario | null {
    return this.currentUser();
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user ? user.rol === role : false;
  }
}
