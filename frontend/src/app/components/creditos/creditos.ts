// src/app/components/creditos/creditos.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiAlpayService } from '../../services/api-alpay';
import { Cuenta } from '../../models/cuenta.model';
import { UiNotificationService } from '../../core/services/ui-notification.service';
import { UiDialogService } from '../../core/services/ui-dialog.service';

@Component({
  selector: 'app-creditos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './creditos.html',
  styleUrls: ['./creditos.css']
})
export class CreditosComponent implements OnInit {
  private apiService = inject(ApiAlpayService);
  private ui = inject(UiNotificationService);
  private dialog = inject(UiDialogService);

  cuentas = signal<Cuenta[]>([]);
  filtroEstatus = signal<'TODOS' | 'ACTIVA' | 'SUSPENDIDA' | 'CERRADA'>('TODOS');
  isLoading = signal(true);

  ngOnInit(): void {
    this.cargarCreditos();
  }

  cargarCreditos(): void {
    this.isLoading.set(true);
    this.apiService.getCuentas().subscribe({
      next: (data) => {
        this.cuentas.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.ui.error('No se pudieron cargar los creditos.');
        this.isLoading.set(false);
      }
    });
  }

  get creditosFiltrados(): Cuenta[] {
    const filtro = this.filtroEstatus();
    if (filtro === 'TODOS') return this.cuentas();
    return this.cuentas().filter(c => c.estatus === filtro);
  }

  get totalCreditos(): number {
    return this.cuentas().reduce((sum, c) => sum + c.limiteCredito, 0);
  }

  get totalSaldo(): number {
    return this.cuentas().reduce((sum, c) => sum + c.saldo, 0);
  }

  get creditosActivos(): number {
    return this.cuentas().filter(c => c.estatus === 'ACTIVA').length;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  }

  getPorcentajeUtilizado(cuenta: Cuenta): number {
    return (cuenta.saldo / cuenta.limiteCredito) * 100;
  }

  getColorBarra(porcentaje: number): string {
    if (porcentaje >= 90) return 'danger';
    if (porcentaje >= 70) return 'warning';
    return 'success';
  }

  async verDetalles(cuenta: Cuenta): Promise<void> {
    const porcentaje = this.getPorcentajeUtilizado(cuenta);
    const disponible = cuenta.limiteCredito - cuenta.saldo;

    await this.dialog.alert({
      title: 'Detalle de la cuenta',
      message:
        `Cliente: ${cuenta.clienteNombre}
` +
        `Cuenta #: ${cuenta.id}

` +
        `Limite de credito: ${this.formatCurrency(cuenta.limiteCredito)}
` +
        `Saldo actual: ${this.formatCurrency(cuenta.saldo)}
` +
        `Disponible: ${this.formatCurrency(disponible)}

` +
        `Utilizacion: ${porcentaje.toFixed(1)}%
` +
        `Tasa de interes: ${cuenta.tasaInteres}%
` +
        `Dia de corte: ${cuenta.diaCorte}
` +
        `Estatus: ${cuenta.estatus}`,
      confirmText: 'Cerrar'
    });
  }
}
