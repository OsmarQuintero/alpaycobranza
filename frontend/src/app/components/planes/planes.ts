import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiAlpayService, Plan, PlanCheckoutRequest } from '../../services/api-alpay';
import { SubscriptionService } from '../../core/services/subscription.service';

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
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly subscription = inject(SubscriptionService);

  readonly planes = signal<Plan[]>([]);
  readonly selectedCycle = signal<'MENSUAL' | 'ANUAL'>('MENSUAL');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly returnUrl = signal('/dashboard');

  ngOnInit(): void {
    const qReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.returnUrl.set(qReturnUrl || '/dashboard');

    this.planes.set(this.getFallbackPlanes());

    if (isPlatformBrowser(this.platformId)) {
      this.detectPaymentResult();
      this.loadPlanes();
    }
  }

  private detectPaymentResult(): void {
    const status = (this.route.snapshot.queryParamMap.get('status') || '').toUpperCase();
    if (status === 'SUCCESS' || status === 'PAID' || status === 'ACTIVE') {
      this.subscription.setActiveLocal(true);
      void this.router.navigate(['/login'], { queryParams: { returnUrl: this.returnUrl() } });
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

        if ((res.status || '').toUpperCase() === 'ACTIVE') {
          this.subscription.setActiveLocal(true);
          void this.router.navigate(['/login'], { queryParams: { returnUrl: this.returnUrl() } });
          return;
        }

        this.errorMessage.set('No se recibió URL de pago válida.');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'No se pudo iniciar el pago.');
      }
    });
  }

  continuarSinPago(): void {
    this.subscription.checkActive().subscribe(active => {
      if (!active) {
        this.errorMessage.set('No encontramos una suscripción activa para continuar.');
        return;
      }
      void this.router.navigate(['/login'], { queryParams: { returnUrl: this.returnUrl() } });
    });
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
