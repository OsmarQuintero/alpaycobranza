import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { resolveApiUrl } from '../core/utils/api-url';
import { Cuenta } from '../models/cuenta.model';
import { Cliente, ClienteRequest } from '../models/cliente.model';
import { Historial } from '../models/historial.model';
import { Pago, RegistrarPagoRequest, RegistrarPagoResponse } from '../models/pago.model';
import { ReporteResumen } from '../models/reporte.model';
import { AuthResponse } from '../models/auth.model';
import { LoginCredentials, RegisterData } from '../core/services/auth.service';

export interface UsuarioAdmin {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'COBRADOR' | 'OFICINA';
  estado?: string;
  creado_en?: string;
  foto_url?: string;
}

export interface UsuarioUpdateRequest {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: 'ADMIN' | 'COBRADOR' | 'OFICINA';
  estado?: 'A' | 'I';
}

export interface ConfiguracionUsuario {
  telefono?: string;
  notificaciones?: boolean;
  emailAlerts?: boolean;
  whatsappAlerts?: boolean;
}

export interface ConfiguracionSistema {
  tasaInteres?: number;
  diasGracia?: number;
  montoMinimoPago?: number;
  envioAutomaticoRecibos?: boolean;
  recordatoriosPago?: boolean;
}

export interface ConfiguracionResponse {
  userConfig: ConfiguracionUsuario;
  systemConfig: ConfiguracionSistema;
}

export interface ConfiguracionRequest {
  userConfig: ConfiguracionUsuario;
  systemConfig: ConfiguracionSistema;
}

export interface PromesaPago {
  id: number;
  idCuenta: number;
  cliente: string;
  montoCompromiso: number;
  fechaCompromiso: string;
  estado: 'PENDIENTE' | 'CUMPLIDA' | 'INCUMPLIDA';
  comentario: string;
  creadaEn: string;
}

export interface PromesaPagoRequest {
  idCuenta: number;
  montoCompromiso: number;
  fechaCompromiso: string;
  comentario: string;
}

export interface ClienteAdminExpediente {
  id: number;
  nombre: string;
  rfc: string;
  telefono: string;
  direccion: string;
  lat?: number;
  lng?: number;
  fechaRegistro?: string;
  verificacionEstado?: string;
  ineUrl?: string;
  selfieUrl?: string;
}

export interface Plan {
  id: 'BASIC' | 'PRO' | 'EMPRESARIAL';
  name: string;
  mensual: number;
  anual: number;
  features: string[];
  highlight?: boolean;
}

export interface PlanCheckoutRequest {
  planId: string;
  billingCycle: 'MENSUAL' | 'ANUAL';
  email?: string;
}

export interface PlanesResponse {
  planes: Plan[];
  currency: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  provider: string;
  plan: string;
  billingCycle: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiAlpayService {
  private http = inject(HttpClient);
  private readonly apiUrl = resolveApiUrl(environment.apiUrl);

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  register(userData: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/usuarios/registro`, userData);
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/reset-password`, { token, password });
  }

  getUsuarios(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(`${this.apiUrl}/usuarios`);
  }

  actualizarUsuario(id: number, payload: UsuarioUpdateRequest): Observable<UsuarioAdmin> {
    return this.http.put<UsuarioAdmin>(`${this.apiUrl}/usuarios/${id}`, payload);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/usuarios/${id}`);
  }

  subirFotoUsuario(id: number, file: File): Observable<UsuarioAdmin> {
    const formData = new FormData();
    formData.append('foto', file);
    return this.http.post<UsuarioAdmin>(`${this.apiUrl}/usuarios/${id}/foto`, formData);
  }

  crearUsuarioAdmin(payload: { nombre: string; email: string; password: string; rol: 'ADMIN' | 'COBRADOR' | 'OFICINA' }): Observable<UsuarioAdmin> {
    return this.http.post<UsuarioAdmin>(`${this.apiUrl}/usuarios/admin`, payload);
  }

  getConfiguracion(usuarioId: number): Observable<ConfiguracionResponse> {
    return this.http.get<ConfiguracionResponse>(`${this.apiUrl}/configuracion/${usuarioId}`);
  }

  actualizarConfiguracion(usuarioId: number, payload: ConfiguracionRequest): Observable<ConfiguracionResponse> {
    return this.http.put<ConfiguracionResponse>(`${this.apiUrl}/configuracion/${usuarioId}`, payload);
  }

  getCuentas(): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(`${this.apiUrl}/cuentas`);
  }

  getCuentasPorCliente(clienteId: number): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(`${this.apiUrl}/cuentas/cliente/${clienteId}`);
  }

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clientes`);
  }

  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/clientes/${id}`);
  }

  getClientesAdminExpedientes(): Observable<ClienteAdminExpediente[]> {
    return this.http.get<ClienteAdminExpediente[]>(`${this.apiUrl}/clientes/admin-expedientes`);
  }

  crearCliente(cliente: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiUrl}/clientes`, cliente);
  }

  actualizarCliente(id: number, cliente: Partial<ClienteRequest>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/clientes/${id}`, cliente);
  }

  eliminarCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clientes/${id}`);
  }

  buscarClientesPorNombre(nombre: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clientes/buscar?nombre=${nombre}`);
  }

  registrarPago(pagoData: RegistrarPagoRequest): Observable<RegistrarPagoResponse> {
    return this.http.post<RegistrarPagoResponse>(`${this.apiUrl}/pagos/registrar`, pagoData);
  }

  getPagosPorCuenta(cuentaId: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.apiUrl}/pagos/cuenta/${cuentaId}`);
  }

  getUltimosPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.apiUrl}/pagos/ultimos`);
  }

  getPromesas(): Observable<PromesaPago[]> {
    return this.http.get<PromesaPago[]>(`${this.apiUrl}/promesas`);
  }

  getPromesasPorCuenta(cuentaId: number): Observable<PromesaPago[]> {
    return this.http.get<PromesaPago[]>(`${this.apiUrl}/promesas/cuenta/${cuentaId}`);
  }

  crearPromesa(payload: PromesaPagoRequest): Observable<{ message: string; success: boolean; promesa: PromesaPago }> {
    return this.http.post<{ message: string; success: boolean; promesa: PromesaPago }>(`${this.apiUrl}/promesas`, payload);
  }

  actualizarEstadoPromesa(promesaId: number, estado: 'PENDIENTE' | 'CUMPLIDA' | 'INCUMPLIDA', fechaCumplimiento?: string): Observable<PromesaPago> {
    return this.http.patch<PromesaPago>(`${this.apiUrl}/promesas/${promesaId}/estado`, { estado, fechaCumplimiento });
  }

  getHistorial(): Observable<Historial[]> {
    return this.http.get<Historial[]>(`${this.apiUrl}/historial`);
  }

  getHistorialPorCuenta(cuentaId: number): Observable<Historial[]> {
    return this.http.get<Historial[]>(`${this.apiUrl}/historial/${cuentaId}`);
  }

  getResumenGeneral(): Observable<ReporteResumen> {
    return this.http.get<ReporteResumen>(`${this.apiUrl}/reportes/resumen`);
  }

  exportarReportePDF(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reportes/pdf`, { responseType: 'blob' });
  }

  exportarReporteExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reportes/excel`, { responseType: 'blob' });
  }

  enviarReportePorEmail(email: string) {
    return this.http.post(
      `${this.apiUrl}/reportes/email`,
      { email },
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getPlanes(): Observable<PlanesResponse> {
    return this.http.get<PlanesResponse>(`${this.apiUrl}/suscripciones/planes`);
  }

  createCheckout(payload: PlanCheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/suscripciones/checkout`, payload);
  }
}
