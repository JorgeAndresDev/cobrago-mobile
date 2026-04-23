export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  cedula: string;
  telefono?: string;
  direccion?: string;
  usuario_id: number;
}

export interface Prestamo {
  id: number;
  monto: number;
  num_cuotas: number;
  estado: "pendiente" | "pagado";
  frecuencia_pago: string;
  cliente_id: number;
  nombre_cliente?: string;
  fecha_creacion: string;
  saldo?: number;
}

export interface Cuota {
  id: number;
  numero_cuota: number;
  monto_esperado: number;
  monto_abonado: number;
  estado: "pendiente" | "parcial" | "pagado";
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
