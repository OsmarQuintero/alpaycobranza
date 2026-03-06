import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { subscriptionGuard } from './core/guards/subscription.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/landing-page/landing-page').then(m => m.LandingPageComponent)
  },
  {
    path: 'planes',
    loadComponent: () => import('./components/planes/planes').then(m => m.PlanesComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent),
    canActivate: [publicGuard, subscriptionGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent),
    canActivate: [publicGuard, subscriptionGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/reset-password/reset-password').then(m => m.ResetPasswordComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'acerca',
    loadComponent: () => import('./components/public-about/public-about').then(m => m.PublicAboutComponent)
  },
  {
    path: 'caracteristicas',
    loadComponent: () => import('./components/public-features/public-features').then(m => m.PublicFeaturesComponent)
  },
  {
    path: 'servicios',
    loadComponent: () => import('./components/public-services/public-services').then(m => m.PublicServicesComponent)
  },
  {
    path: 'politicas',
    loadComponent: () => import('./components/public-policies/public-policies').then(m => m.PublicPoliciesComponent)
  },
  {
    path: '',
    canActivate: [authGuard, subscriptionGuard],
    loadComponent: () => import('./core/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard').then(m => m.AlpayDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'OFICINA', 'COBRADOR'] }
      },
      {
        path: 'clientes',
        loadComponent: () => import('./components/clientes/clientes').then(m => m.ClientesComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'OFICINA'] }
      },
      {
        path: 'pagos',
        loadComponent: () => import('./components/pagos/pagos').then(m => m.PagosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COBRADOR'] }
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./components/configuracion/configuracion').then(m => m.ConfiguracionComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'OFICINA', 'COBRADOR'] }
      },
      {
        path: 'reportes',
        loadComponent: () => import('./components/reportes/reportes').then(m => m.ReportesComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'OFICINA'] }
      },
      {
        path: 'historial',
        loadComponent: () => import('./components/historial/historial').then(m => m.HistorialComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COBRADOR'] }
      },
      {
        path: 'creditos',
        loadComponent: () => import('./components/creditos/creditos').then(m => m.CreditosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'OFICINA'] }
      },
      {
        path: 'admin',
        loadComponent: () => import('./components/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/usuarios',
        loadComponent: () => import('./components/admin-usuarios/admin-usuarios').then(m => m.AdminUsuariosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      }
    ]
  },
  { path: '**', redirectTo: '/' }
];
