// src/app/core/layout/main-layout/main-layout.component.ts
import { Component, signal, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { resolveApiUrl } from '../../utils/api-url';
import { UiDialogService } from '../../services/ui-dialog.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout">
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()" [class.mobile-open]="mobileSidebarOpen()">
        <div class="brand">
          <img src="assets/img/features/logo.png" alt="ALPAY" class="brand-logo">
          @if (!isCompactMode()) {
            <div>
              <div class="brand-title">ALPAY</div>
              <div class="brand-subtitle">Sistema de cobranza</div>
            </div>
          }
        </div>

        <div class="nav-section">
          <p class="section-label" *ngIf="!isCompactMode()">Panel</p>
          @for (item of menuItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-item"
              [title]="item.label"
              (click)="closeMobileSidebar()">
              <i class="bi {{ item.icon }}"></i>
              @if (!isCompactMode()) {
                <span>{{ item.label }}</span>
              }
            </a>
          }
        </div>

        <div class="sidebar-footer">
          <button class="nav-item logout" (click)="onLogout()">
            <i class="bi bi-box-arrow-left"></i>
            @if (!isCompactMode()) {
              <span>Salir</span>
            }
          </button>
        </div>
      </aside>

      <button
        *ngIf="isMobileView() && mobileSidebarOpen()"
        type="button"
        class="mobile-backdrop"
        aria-label="Cerrar menu"
        (click)="closeMobileSidebar()"></button>

      <div class="content">
        <header class="topbar">
          <button class="icon-btn" (click)="toggleSidebar()">
            <i class="bi bi-list"></i>
          </button>
          <div class="page-title">
            <span>{{ currentSectionLabel() }}</span>
          </div>
          <div class="topbar-right">
            <div class="user-info">
              <div class="user-name">{{ currentUser()?.nombre || 'Usuario' }}</div>
              <div class="user-role">{{ currentUser()?.rol || 'COBRADOR' }}</div>
            </div>
            <div class="user-avatar" [class.has-photo]="hasUserPhoto()">
              @if (hasUserPhoto()) {
                <img [src]="getFotoUrl()" alt="Foto usuario">
              } @else {
                {{ getInitials() }}
              }
            </div>
          </div>
        </header>

        <main class="page">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
      background: radial-gradient(circle at top left, #0f172a, #05070f 60%);
      color: #e2e8f0;
      font-family: 'IBM Plex Sans', sans-serif;
    }

    .sidebar {
      width: 260px;
      background: rgba(8, 14, 25, 0.95);
      border-right: 1px solid rgba(57, 78, 105, 0.45);
      display: flex;
      flex-direction: column;
      position: fixed;
      inset: 0 auto 0 0;
      transition: width 0.3s ease, transform 0.3s ease;
      z-index: 1000;
    }

    .sidebar.collapsed {
      width: 78px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 18px;
      border-bottom: 1px solid rgba(57, 78, 105, 0.45);
    }

    .brand-logo {
      width: 44px;
      height: 44px;
      object-fit: contain;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      padding: 6px;
    }

    .brand-title {
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #f8fafc;
    }

    .brand-subtitle {
      font-size: 0.75rem;
      color: #8aa0b6;
    }

    .nav-section {
      padding: 16px 12px;
      flex: 1;
    }

    .section-label {
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.2em;
      color: #6f879d;
      margin-bottom: 12px;
      padding-left: 10px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 12px;
      color: #a9bdd3;
      text-decoration: none;
      margin-bottom: 6px;
      transition: all 0.2s ease;
      border: none;
      width: 100%;
      text-align: left;
      background: transparent;
      cursor: pointer;
    }

    .nav-item:hover {
      background: rgba(30, 64, 175, 0.2);
      color: #dbeafe;
    }

    .nav-item.active {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.4), rgba(14, 165, 233, 0.3));
      color: #f8fafc;
      border: 1px solid rgba(59, 130, 246, 0.45);
    }

    .nav-item i {
      font-size: 1.1rem;
    }

    .sidebar-footer {
      padding: 16px 12px;
      border-top: 1px solid rgba(57, 78, 105, 0.45);
    }

    .logout {
      color: #fca5a5;
    }

    .mobile-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      border: none;
      background: rgba(2, 6, 23, 0.6);
      z-index: 950;
    }

    .content {
      margin-left: 260px;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-left 0.3s ease;
    }

    .sidebar.collapsed ~ .content {
      margin-left: 78px;
    }

    .topbar {
      height: 72px;
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 0 24px;
      background: rgba(8, 14, 25, 0.92);
      border-bottom: 1px solid rgba(57, 78, 105, 0.45);
      position: sticky;
      top: 0;
      z-index: 900;
    }

    .icon-btn {
      border: none;
      background: rgba(37, 99, 235, 0.18);
      color: #dbeafe;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      cursor: pointer;
    }

    .page-title {
      font-weight: 600;
      color: #f8fafc;
    }

    .topbar-right {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-info {
      text-align: right;
    }

    .user-name {
      font-weight: 600;
    }

    .user-role {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #8aa0b6;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #1d4ed8, #38bdf8);
      font-weight: 700;
      color: #f8fafc;
    }

    .user-avatar.has-photo {
      background: transparent;
      border: 1px solid rgba(59, 130, 246, 0.5);
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
      border-radius: 50%;
    }

    .page {
      padding: 12px 0 40px;
    }

    @media (max-width: 900px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }

      .mobile-backdrop {
        display: block;
      }

      .content,
      .sidebar.collapsed ~ .content {
        margin-left: 0;
      }

      .topbar {
        padding: 0 16px;
      }
    }
  `]
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private apiUrl = resolveApiUrl(environment.apiUrl);
  private dialog = inject(UiDialogService);

  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);
  isMobileView = signal(typeof window !== 'undefined' ? window.innerWidth <= 900 : false);
  currentUser = this.authService.currentUser;

  constructor() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.closeMobileSidebar();
    });
  }

  cobradorMenu: MenuItem[] = [
    { icon: 'bi-speedometer2', label: 'Dashboard', route: '/dashboard' },
    { icon: 'bi-cash-coin', label: 'Pagos', route: '/pagos' },
    { icon: 'bi-clock-history', label: 'Historial', route: '/historial' },
    { icon: 'bi-gear', label: 'Configuracion', route: '/configuracion' }
  ];

  adminMenu: MenuItem[] = [
    { icon: 'bi-shield-check', label: 'Admin', route: '/admin' },
    { icon: 'bi-people', label: 'Usuarios', route: '/admin/usuarios' },
    { icon: 'bi-graph-up', label: 'Reportes', route: '/reportes' },
    { icon: 'bi-gear', label: 'Configuracion', route: '/configuracion' }
  ];

  oficinaMenu: MenuItem[] = [
    { icon: 'bi-speedometer2', label: 'Dashboard', route: '/dashboard' },
    { icon: 'bi-people', label: 'Clientes', route: '/clientes' },
    { icon: 'bi-credit-card', label: 'Creditos', route: '/creditos' },
    { icon: 'bi-graph-up', label: 'Reportes', route: '/reportes' },
    { icon: 'bi-gear', label: 'Configuracion', route: '/configuracion' }
  ];

  menuItems = computed(() => {
    const role = this.currentUser()?.rol;
    if (role === 'ADMIN') return this.adminMenu;
    if (role === 'OFICINA') return this.oficinaMenu;
    return this.cobradorMenu;
  });

  @HostListener('window:resize')
  onResize(): void {
    if (typeof window === 'undefined') return;
    const mobile = window.innerWidth <= 900;
    this.isMobileView.set(mobile);
    if (!mobile) {
      this.mobileSidebarOpen.set(false);
    }
  }

  isCompactMode(): boolean {
    return !this.isMobileView() && this.sidebarCollapsed();
  }

  toggleSidebar(): void {
    if (this.isMobileView()) {
      this.mobileSidebarOpen.update(val => !val);
      return;
    }
    this.sidebarCollapsed.update(val => !val);
  }

  closeMobileSidebar(): void {
    if (this.isMobileView()) {
      this.mobileSidebarOpen.set(false);
    }
  }

  getInitials(): string {
    const user = this.currentUser();
    if (!user?.nombre) return 'U';

    const names = user.nombre.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return names[0][0];
  }

  hasUserPhoto(): boolean {
    const user: any = this.currentUser();
    return user?.rol === 'COBRADOR' && !!user?.foto_url;
  }

  getFotoUrl(): string {
    const user: any = this.currentUser();
    const url = user?.foto_url;
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = this.apiUrl.replace('/api', '');
    return base + url;
  }

  currentSectionLabel(): string {
    const url = this.router.url;
    const match = [...this.adminMenu, ...this.oficinaMenu, ...this.cobradorMenu]
      .sort((a, b) => b.route.length - a.route.length)
      .find(item => url.startsWith(item.route));
    return match?.label || 'Panel';
  }

  async onLogout(): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: 'Cerrar sesion',
      message: '?Estas seguro de que deseas cerrar sesion?',
      confirmText: 'Cerrar sesion',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      this.authService.logout();
    }
  }
}
