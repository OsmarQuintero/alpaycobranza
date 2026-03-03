import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ApiAlpayService, Plan, PlanCheckoutRequest } from '../../services/api-alpay';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './planes.html',
  styleUrls: ['./planes.css']
})
export class PlanesComponent implements OnInit {
  private readonly api = inject(ApiAlpayService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly planes = signal<Plan[]>([]);
  readonly selectedCycle = signal<'MENSUAL' | 'ANUAL'>('MENSUAL');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.planes.set(this.getFallbackPlanes());
    if (isPlatformBrowser(this.platformId)) {
      this.loadPlanes();
    }
  }

  loadPlanes(): void {
    this.api.getPlanes().subscribe({
      next: (resp) => {
        this.planes.set(resp.planes || []);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar los planes. Intenta de nuevo.');
      }
    });
  }

  setCycle(cycle: 'MENSUAL' | 'ANUAL'): void {
    this.selectedCycle.set(cycle);
  }

  getPrice(plan: Plan): number {
    return this.selectedCycle() === 'ANUAL' ? plan.anual : plan.mensual;
  }

  checkout(plan: Plan): void {
    const payload: PlanCheckoutRequest = {
      planId: plan.id,
      billingCycle: this.selectedCycle()
    };

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.api.createCheckout(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.checkoutUrl) {
          window.location.href = res.checkoutUrl;
          return;
        }
        this.errorMessage.set('No se recibio URL de pago.');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'No se pudo iniciar el pago.');
      }
    });
  }

  continuarSinPago(): void {
    this.router.navigate(['/login']);
  }

  private getFallbackPlanes(): Plan[] {
    return [
      {
        id: 'BASIC',
        name: 'Basico',
        mensual: 499,
        anual: 4990,
        features: ['1 sucursal', 'Hasta 5 usuarios', 'Reportes PDF y Excel', 'Soporte por email']
      },
      {
        id: 'PRO',
        name: 'Profesional',
        mensual: 899,
        anual: 8990,
        highlight: true,
        features: ['Hasta 3 sucursales', 'Hasta 20 usuarios', 'KPIs avanzados', 'Soporte prioritario']
      },
      {
        id: 'EMPRESARIAL',
        name: 'Empresarial',
        mensual: 1499,
        anual: 14990,
        features: ['Sucursales ilimitadas', 'Usuarios ilimitados', 'Automatizaciones', 'Acompanamiento dedicado']
      }
    ];
  }
}
