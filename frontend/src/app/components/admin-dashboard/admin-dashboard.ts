import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiAlpayService, ClienteAdminExpediente, PromesaPago } from '../../services/api-alpay';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent {
  private api = inject(ApiAlpayService);

  usuarios = signal<any[]>([]);
  expedientes = signal<ClienteAdminExpediente[]>([]);
  promesas = signal<PromesaPago[]>([]);
  isLoading = signal(true);

  totalUsuarios = computed(() => this.usuarios().length);
  admins = computed(() => this.usuarios().filter(u => u.rol === 'ADMIN').length);
  cobradores = computed(() => this.usuarios().filter(u => u.rol === 'COBRADOR').length);
  activos = computed(() => this.usuarios().filter(u => (u.estado || 'A') === 'A').length);

  promesasPendientes = computed(() => this.promesas().filter(p => p.estado === 'PENDIENTE').length);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.isLoading.set(true);

    this.api.getUsuarios().subscribe({
      next: data => this.usuarios.set(data || []),
      error: () => this.usuarios.set([])
    });

    this.api.getClientesAdminExpedientes().subscribe({
      next: data => this.expedientes.set(data || []),
      error: () => this.expedientes.set([])
    });

    this.api.getPromesas().subscribe({
      next: data => {
        this.promesas.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.promesas.set([]);
        this.isLoading.set(false);
      }
    });
  }

  resolveMediaUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    const api = (this.api as any)['apiUrl'] as string;
    const origin = api.replace(/\/api.*$/, '');
    return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
  }
}
