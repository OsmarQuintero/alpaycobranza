import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { AuthResponse } from '../../models/auth.model';
import { ApiAlpayService } from '../../services/api-alpay';

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

  currentUser = signal<Usuario | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.checkAuthStatus();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private normalizeUser(raw: any): Usuario {
    const normalized: Usuario = {
      id: raw?.id ?? raw?.id_usuario ?? raw?.idUsuario,
      nombre: raw?.nombre ?? '',
      email: raw?.email ?? '',
      telefono: raw?.telefono ?? '',
      rol: (raw?.rol ?? 'COBRADOR').toString().toUpperCase() as 'ADMIN' | 'COBRADOR' | 'OFICINA',
      estado: raw?.estado,
      creadoEn: raw?.creadoEn ?? raw?.creado_en,
      foto_url: raw?.foto_url ?? raw?.fotoUrl
    };

    return normalized;
  }

  private checkAuthStatus(): void {
    if (!this.isBrowser()) return;

    const token = this.getToken();
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      if (token.split('.').length !== 3) {
        this.logout();
        return;
      }
      try {
        const user = this.normalizeUser(JSON.parse(userStr));
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        localStorage.setItem('user', JSON.stringify(user));
      } catch {
        this.logout();
      }
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

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
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


