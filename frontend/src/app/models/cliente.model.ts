export interface Cliente {
  id?: number;
  nombre: string;
  rfc?: string;
  telefono: string;
  direccion?: string;
  lat?: number;
  lng?: number;
  fechaRegistro?: Date;
}

export interface ClienteRequest {
  nombre: string;
  telefono: string;
  email?: string;
  direccion?: string;
}