// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ApiAlpayService } from '../../services/api-alpay';
import { AuthService } from '../../core/services/auth.service';
import { Cuenta } from '../../models/cuenta.model';
import { Pago } from '../../models/pago.model';
import { Cliente } from '../../models/cliente.model';
import { ReporteResumen } from '../../models/reporte.model';
import { RutaDiariaComponent } from '../ruta-diaria/ruta-diaria';

interface KPI {
  title: string;
  value: number;
  icon: string;
  subtitle: string;
  trend: string;
}

interface Actividad {
  tipo: 'pago' | 'credito' | 'mora' | 'cliente';
  descripcion: string;
  monto: number;
  fecha: Date;
  clienteNombre?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, RutaDiariaComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AlpayDashboardComponent implements OnInit {
  private apiService = inject(ApiAlpayService);
  private authService = inject(AuthService);
  private router = inject(Router);

  cuentas = signal<Cuenta[]>([]);
  pagos = signal<Pago[]>([]);
  clientes = signal<Cliente[]>([]);
  resumen = signal<ReporteResumen | null>(null);
  actividades = signal<Actividad[]>([]);
  isLoading = signal(true);
  currentUser = this.authService.currentUser;

  kpis = computed<KPI[]>(() => {
    const resumenData = this.resumen();
    const cuentasData = this.cuentas();
    const clientesCount = this.clientes().length;

    const totalSaldo = resumenData?.totalSaldo ?? cuentasData.reduce((sum, c) => sum + (c.saldo || 0), 0);
    const totalRecaudado = resumenData?.totalRecaudado ?? 0;
    const totalCredito = resumenData?.totalCredito ?? 0;
    const promedioSaldo = resumenData?.promedioSaldo ?? 0;

    return [
      {
        title: 'Saldo pendiente',
        value: totalSaldo,
        icon: 'bi-wallet2',
        subtitle: 'Total de cuentas activas',
        trend: '+2.4%'
      },
      {
        title: 'Recaudado',
        value: totalRecaudado,
        icon: 'bi-cash-coin',
        subtitle: 'Cobros del periodo',
        trend: '+8.1%'
      },
      {
        title: 'Credito otorgado',
        value: totalCredito,
        icon: 'bi-graph-up',
        subtitle: 'Limites en cartera',
        trend: '+1.2%'
      },
      {
        title: 'Clientes',
        value: clientesCount,
        icon: 'bi-people',
        subtitle: `Promedio saldo: ${this.formatMoney(promedioSaldo)}`,
        trend: '+3.6%'
      }
    ];
  });

  topCuentas = computed(() => {
    return [...this.cuentas()]
      .sort((a, b) => (b.saldo || 0) - (a.saldo || 0))
      .slice(0, 6);
  });

  saldoSeries = computed(() => {
    const cuentas = this.topCuentas();
    const maxSaldo = Math.max(...cuentas.map(c => c.saldo || 0), 1);
    return cuentas.map(c => ({
      label: c.clienteNombre || 'Sin nombre',
      value: c.saldo || 0,
      percent: ((c.saldo || 0) / maxSaldo) * 100
    }));
  });

  pagosSemana = computed(() => {
    const pagos = this.pagos();
    const hoy = new Date();
    const dias = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(hoy);
      date.setDate(hoy.getDate() - (6 - i));
      const key = date.toISOString().split('T')[0];
      return { key, label: date.toLocaleDateString('es-MX', { weekday: 'short' }), value: 0 };
    });

    pagos.forEach(p => {
      const key = new Date(p.fechaPago).toISOString().split('T')[0];
      const item = dias.find(d => d.key === key);
      if (item) item.value += p.monto || 0;
    });

    const max = Math.max(...dias.map(d => d.value), 1);
    return dias.map(d => ({ ...d, percent: (d.value / max) * 100 }));
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.isLoading.set(true);

    const role = this.currentUser()?.rol;

    if (role === 'COBRADOR') {
      forkJoin({
        pagos: this.apiService.getUltimosPagos().pipe(catchError(() => of([] as Pago[]))),
        clientes: this.apiService.getClientes().pipe(catchError(() => of([] as Cliente[])))
      }).subscribe({
        next: ({ pagos, clientes }) => {
          this.pagos.set(pagos);
          this.clientes.set(clientes);
          this.cuentas.set([]);
          this.resumen.set(null);
          this.actividades.set([]);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
      return;
    }

    forkJoin({
      cuentas: this.apiService.getCuentas().pipe(catchError(() => of([] as Cuenta[]))),
      pagos: this.apiService.getUltimosPagos().pipe(catchError(() => of([] as Pago[]))),
      clientes: this.apiService.getClientes().pipe(catchError(() => of([] as Cliente[]))),
      resumen: this.apiService.getResumenGeneral().pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ cuentas, pagos, clientes, resumen }) => {
        this.cuentas.set(cuentas);
        this.pagos.set(pagos);
        this.clientes.set(clientes);
        this.resumen.set(resumen as ReporteResumen | null);
        this.procesarActividades(cuentas, pagos);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private procesarActividades(cuentas: Cuenta[], pagos: Pago[]): void {
    const actividadesPagos = pagos.map(pago => {
      const cuenta = cuentas.find(c => c.id === pago.cuenta.id);
      return {
        tipo: 'pago' as const,
        descripcion: 'Pago recibido',
        monto: pago.monto,
        fecha: new Date(pago.fechaPago),
        clienteNombre: cuenta?.clienteNombre || 'Cliente'
      };
    });

    const actividadesCreditos = cuentas
      .filter(c => c.estatus === 'ACTIVA')
      .slice(0, 3)
      .map(c => ({
        tipo: 'credito' as const,
        descripcion: 'Credito activo',
        monto: c.limiteCredito,
        fecha: new Date(c.fechaApertura),
        clienteNombre: c.clienteNombre
      }));

    this.actividades.set(
      [...actividadesPagos, ...actividadesCreditos]
        .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
        .slice(0, 8)
    );
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  isCobrador(): boolean {
    return this.currentUser()?.rol === 'COBRADOR';
  }

  isOficina(): boolean {
    return this.currentUser()?.rol === 'OFICINA';
  }

  isAdmin(): boolean {
    return this.currentUser()?.rol === 'ADMIN';
  }

  refresh(): void {
    this.cargarDatos();
  }

  registrarPago(): void {
    this.router.navigate(['/pagos']);
  }

  nuevoCliente(): void {
    this.router.navigate(['/clientes']);
  }

  nuevoCredito(): void {
    this.router.navigate(['/creditos']);
  }

  getTiempoTranscurrido(fecha: Date): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();

    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (minutos < 60) {
      return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    } else if (horas < 24) {
      return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
    } else {
      return `Hace ${dias} dia${dias !== 1 ? 's' : ''}`;
    }
  }
}
