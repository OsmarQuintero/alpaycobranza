import { Cuenta } from "./cuenta.model";

export interface Historial {
  idHistorial: number;
  cuenta: Cuenta;
  tipo: string;
  descripcion: string;
  fecha: Date;
  usuario?: {
    id: number;
    nombre: string;
  };
}