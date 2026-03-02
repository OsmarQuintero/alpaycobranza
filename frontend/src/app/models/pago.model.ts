import { Cuenta } from "./cuenta.model";

export interface Pago {
  idPago?: number;
  cuenta: Cuenta;
  monto: number;
  fechaPago: Date;
  metodo: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';
  referencia?: string;
}

export interface RegistrarPagoRequest {
    id_cuenta: number;
    monto: number;
    metodo_pago: string;
    referencia?: string | null;
}

export interface RegistrarPagoResponse {
  message: string;
  success: boolean;
  pago: Pago;
  whatsappUrl: string;
}
