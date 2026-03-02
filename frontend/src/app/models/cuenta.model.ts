import { Cliente } from "./cliente.model";

export interface Cuenta {
  id: number;
  cliente: Cliente;
  limiteCredito: number;
  saldo: number;
  tasaInteres: number;
  fechaApertura: Date;
  estatus: 'ACTIVA' | 'SUSPENDIDA' | 'CERRADA';
  diaCorte: number;
  clienteNombre?: string; // Campo calculado del backend
}