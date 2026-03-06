// src/app/components/historial/historial.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiAlpayService } from '../../services/api-alpay';
import { Historial } from '../../models/historial.model';
import { UiNotificationService } from '../../core/services/ui-notification.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial.html',
  styleUrls: ['./historial.css']
})
export class HistorialComponent implements OnInit {
  private apiService = inject(ApiAlpayService);
  private ui = inject(UiNotificationService);

  historial = signal<Historial[]>([]);
  filtroTipo = signal<string>('TODOS');
  searchTerm = signal('');
  isLoading = signal(true);

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.isLoading.set(true);
    this.apiService.getHistorial().subscribe({
      next: (data) => {
        this.historial.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.ui.error('No se pudo cargar el historial.');
        this.isLoading.set(false);
      }
    });
  }

  get historialFiltrado(): Historial[] {
    let resultado = this.historial();

    if (this.filtroTipo() !== 'TODOS') {
      resultado = resultado.filter(h => h.tipo === this.filtroTipo());
    }

    const search = this.searchTerm().toLowerCase();
    if (search) {
      resultado = resultado.filter(h =>
        h.descripcion.toLowerCase().includes(search) ||
        h.cuenta.id.toString().includes(search)
      );
    }

    return resultado;
  }

  getIconoTipo(tipo: string): string {
    switch (tipo) {
      case 'PAGO': return 'bi-cash-coin text-success';
      case 'CREDITO': return 'bi-credit-card text-info';
      case 'AJUSTE': return 'bi-pencil-square text-warning';
      case 'MORA': return 'bi-exclamation-triangle text-danger';
      default: return 'bi-circle text-secondary';
    }
  }

  formatFecha(fecha: Date): string {
    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
