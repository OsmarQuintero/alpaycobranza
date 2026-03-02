export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  telefono: string;
  password?: string;
  rol: 'ADMIN' | 'COBRADOR' | 'OFICINA';
  estado?: string;
  creadoEn?: Date;
  foto_url?: string;
}

