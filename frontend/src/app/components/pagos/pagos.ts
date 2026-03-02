import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiAlpayService, PromesaPago } from '../../services/api-alpay';
import { Cuenta } from '../../models/cuenta.model';

interface PagoForm {
  id_cuenta: number | null;
  monto: number;
  metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';
  referencia: string;
}

interface PromesaForm {
  fechaCompromiso: string;
  montoCompromiso: number;
  comentario: string;
}

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos.html',
  styleUrls: ['./pagos.css']
})
export class PagosComponent implements OnInit {
  private apiService = inject(ApiAlpayService);

  cuentas = signal<Cuenta[]>([]);
  cuentaSeleccionada = signal<Cuenta | null>(null);
  promesasCuenta = signal<PromesaPago[]>([]);

  isLoading = signal(false);
  isSavingPromesa = signal(false);
  showSuccess = signal(false);
  showPromesaSuccess = signal(false);
  errorMessage = signal('');

  searchTerm = signal('');

  pagoForm: PagoForm = {
    id_cuenta: null,
    monto: 0,
    metodo_pago: 'EFECTIVO',
    referencia: ''
  };

  promesaForm: PromesaForm = {
    fechaCompromiso: '',
    montoCompromiso: 0,
    comentario: ''
  };

  ngOnInit(): void {
    this.cargarCuentas();
  }

  cargarCuentas(): void {
    this.apiService.getCuentas().subscribe({
      next: data => this.cuentas.set((data || []).filter(c => c.estatus === 'ACTIVA')),
      error: () => this.errorMessage.set('Error al cargar las cuentas')
    });
  }

  cargarPromesasCuenta(cuentaId: number): void {
    this.apiService.getPromesasPorCuenta(cuentaId).subscribe({
      next: data => this.promesasCuenta.set(data || []),
      error: () => this.promesasCuenta.set([])
    });
  }

  get cuentasFiltradas(): Cuenta[] {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) return this.cuentas();

    return this.cuentas().filter(c =>
      c.clienteNombre?.toLowerCase().includes(search) ||
      c.id.toString().includes(search)
    );
  }

  seleccionarCuenta(cuenta: Cuenta): void {
    this.cuentaSeleccionada.set(cuenta);
    this.pagoForm.id_cuenta = cuenta.id;
    this.searchTerm.set('');

    this.promesaForm = {
      fechaCompromiso: this.fechaMinimaPromesa(),
      montoCompromiso: Math.min(Number(cuenta.saldo || 0), 500),
      comentario: ''
    };

    this.cargarPromesasCuenta(cuenta.id);
  }

  limpiarSeleccion(): void {
    this.cuentaSeleccionada.set(null);
    this.pagoForm.id_cuenta = null;
    this.promesasCuenta.set([]);
    this.resetForm();
  }

  calcularSaldoRestante(): number {
    const cuenta = this.cuentaSeleccionada();
    if (!cuenta) return 0;
    return Number(cuenta.saldo) - this.pagoForm.monto;
  }

  onSubmit(): void {
    if (!this.pagoForm.id_cuenta) {
      this.errorMessage.set('Selecciona un cliente primero');
      return;
    }

    if (this.pagoForm.monto <= 0) {
      this.errorMessage.set('El monto debe ser mayor a cero');
      return;
    }

    const cuenta = this.cuentaSeleccionada();
    if (cuenta && this.pagoForm.monto > Number(cuenta.saldo)) {
      this.errorMessage.set('El monto no puede ser mayor al saldo pendiente');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.apiService.registrarPago({
      id_cuenta: this.pagoForm.id_cuenta,
      monto: this.pagoForm.monto,
      metodo_pago: this.pagoForm.metodo_pago,
      referencia: this.pagoForm.referencia || null
    }).subscribe({
      next: () => {
        this.showSuccess.set(true);
        this.cargarCuentas();
        const cuentaId = this.cuentaSeleccionada()?.id;
        if (cuentaId) this.cargarPromesasCuenta(cuentaId);

        setTimeout(() => {
          this.showSuccess.set(false);
          this.limpiarSeleccion();
        }, 2500);
      },
      error: () => {
        this.errorMessage.set('Error al registrar el pago. Intenta nuevamente.');
        this.isLoading.set(false);
      },
      complete: () => this.isLoading.set(false)
    });
  }

  registrarPromesa(): void {
    const cuenta = this.cuentaSeleccionada();
    if (!cuenta) {
      this.errorMessage.set('Selecciona una cuenta para registrar promesa');
      return;
    }

    if (!this.promesaForm.fechaCompromiso) {
      this.errorMessage.set('Selecciona fecha de compromiso');
      return;
    }

    if (this.promesaForm.montoCompromiso <= 0) {
      this.errorMessage.set('El monto de promesa debe ser mayor a cero');
      return;
    }

    if (this.promesaForm.montoCompromiso > Number(cuenta.saldo)) {
      this.errorMessage.set('La promesa no puede exceder el saldo pendiente');
      return;
    }

    this.isSavingPromesa.set(true);
    this.errorMessage.set('');

    this.apiService.crearPromesa({
      idCuenta: cuenta.id,
      fechaCompromiso: this.promesaForm.fechaCompromiso,
      montoCompromiso: this.promesaForm.montoCompromiso,
      comentario: this.promesaForm.comentario || ''
    }).subscribe({
      next: () => {
        this.showPromesaSuccess.set(true);
        this.cargarPromesasCuenta(cuenta.id);
        this.promesaForm.comentario = '';
        setTimeout(() => this.showPromesaSuccess.set(false), 2500);
      },
      error: err => {
        this.errorMessage.set(err?.error?.detalle || 'No se pudo registrar la promesa de pago');
      },
      complete: () => this.isSavingPromesa.set(false)
    });
  }

  marcarPromesa(promesa: PromesaPago, estado: 'CUMPLIDA' | 'INCUMPLIDA'): void {
    this.apiService.actualizarEstadoPromesa(promesa.id, estado, this.fechaMinimaPromesa()).subscribe({
      next: () => {
        const cuentaId = this.cuentaSeleccionada()?.id;
        if (cuentaId) this.cargarPromesasCuenta(cuentaId);
      },
      error: () => {
        this.errorMessage.set('No se pudo actualizar el estado de la promesa');
      }
    });
  }

  fechaMinimaPromesa(): string {
    return new Date().toISOString().split('T')[0];
  }

  resetForm(): void {
    this.pagoForm = {
      id_cuenta: null,
      monto: 0,
      metodo_pago: 'EFECTIVO',
      referencia: ''
    };

    this.promesaForm = {
      fechaCompromiso: this.fechaMinimaPromesa(),
      montoCompromiso: 0,
      comentario: ''
    };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value || 0);
  }
}
