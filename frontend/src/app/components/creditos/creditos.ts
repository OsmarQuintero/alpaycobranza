// src/app/components/creditos/creditos.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiAlpayService } from '../../services/api-alpay';
import { Cuenta } from '../../models/cuenta.model';

@Component({
  selector: 'app-creditos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './creditos.html',
  styleUrls: ['./creditos.css']
})
export class CreditosComponent implements OnInit {
  private apiService = inject(ApiAlpayService);

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
      error: (err) => {
        console.error('Error:', err);
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

  verDetalles(cuenta: Cuenta): void {
    const porcentaje = this.getPorcentajeUtilizado(cuenta);
    const disponible = cuenta.limiteCredito - cuenta.saldo;
    
    alert(
      `📊 DETALLES DE LA CUENTA\n\n` +
      `Cliente: ${cuenta.clienteNombre}\n` +
      `Cuenta #: ${cuenta.id}\n\n` +
      `💳 Límite de crédito: ${this.formatCurrency(cuenta.limiteCredito)}\n` +
      `💰 Saldo actual: ${this.formatCurrency(cuenta.saldo)}\n` +
      `✅ Disponible: ${this.formatCurrency(disponible)}\n\n` +
      `📈 Utilización: ${porcentaje.toFixed(1)}%\n` +
      `💹 Tasa de interés: ${cuenta.tasaInteres}%\n` +
      `📅 Día de corte: ${cuenta.diaCorte}\n` +
      `🔖 Estatus: ${cuenta.estatus}`
    );
  }
}