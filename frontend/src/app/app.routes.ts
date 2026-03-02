import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { LandingPageComponent } from './components/landing-page/landing-page';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { AlpayDashboardComponent } from './components/dashboard/dashboard';
import { ClientesComponent } from './components/clientes/clientes';
import { PagosComponent } from './components/pagos/pagos';
import { ConfiguracionComponent } from './components/configuracion/configuracion';
import { ReportesComponent } from './components/reportes/reportes';
import { HistorialComponent } from './components/historial/historial';
import { CreditosComponent } from './components/creditos/creditos';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { AdminUsuariosComponent } from './components/admin-usuarios/admin-usuarios';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password';
import { ResetPasswordComponent } from './components/reset-password/reset-password';
import { PublicAboutComponent } from './components/public-about/public-about';
import { PublicFeaturesComponent } from './components/public-features/public-features';
import { PublicServicesComponent } from './components/public-services/public-services';
import { PublicPoliciesComponent } from './components/public-policies/public-policies';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [publicGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [publicGuard] },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [publicGuard] },
  { path: 'acerca', component: PublicAboutComponent },
  { path: 'caracteristicas', component: PublicFeaturesComponent },
  { path: 'servicios', component: PublicServicesComponent },
  { path: 'politicas', component: PublicPoliciesComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: AlpayDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'OFICINA', 'COBRADOR'] }
      },
      {
        path: 'clientes',
        component: ClientesComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'OFICINA'] }
      },
      {
        path: 'pagos',
        component: PagosComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COBRADOR'] }
      },
      {
        path: 'configuracion',
        component: ConfiguracionComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'OFICINA', 'COBRADOR'] }
      },
      {
        path: 'reportes',
        component: ReportesComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'OFICINA'] }
      },
      {
        path: 'historial',
        component: HistorialComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COBRADOR'] }
      },
      {
        path: 'creditos',
        component: CreditosComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'OFICINA'] }
      },
      {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/usuarios',
        component: AdminUsuariosComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      }
    ]
  },

  { path: '**', redirectTo: '/dashboard' }
];

