export interface User {
  id: number;
  username: string;
  email: string;
  photo_url?: string;
  phone?: string;
}

export type RiskLevel = "Bajo" | "Medio" | "Alto";

export interface Cliente {
  id: number;
  nombre: string;
  cedula: string;
  telefono?: string;
  direccion?: string;
  usuario_id: number;
  latitud?: number;
  longitud?: number;
  observaciones?: string;
  nivel_riesgo?: RiskLevel;
  foto_url?: string;
  foto_local_path?: string;
  is_synced?: number; // 0 = pendiente, 1 = sincronizado
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

export interface DashboardStats {
  recaudado_hoy: number;
  cartera_activa: number;
  total_clientes: number;
  prestamos_activos: number;
  clientes_mora: number;
  cobros_hoy: number;
}
