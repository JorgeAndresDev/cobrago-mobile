import api from "../api/axios";
import { Prestamo } from "../types";
import { dbService } from "./dbService";
import { queueService } from "./queueService";
import NetInfo from "@react-native-community/netinfo";

export const loanService = {
  getPrestamos: async (): Promise<Prestamo[]> => {
    const db = await dbService.getDb();

    try {
      const response = await api.get("/prestamos/");
      const prestamos = response.data;
      
      for (const p of prestamos) {
        await db.runAsync(
          `INSERT OR REPLACE INTO prestamos (id, uuid, monto, monto_total, tipo_interes, porcentaje_interes, num_cuotas, estado, frecuencia_pago, cliente_id, nombre_cliente, fecha_creacion, saldo, is_synced) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [p.id.toString(), p.uuid || null, p.monto ?? 0, p.monto_total ?? p.monto ?? 0, p.tipo_interes ?? null, p.porcentaje_interes ?? 0, p.num_cuotas ?? 0, p.estado ?? '', p.frecuencia_pago ?? '', p.cliente_id?.toString() ?? '', p.nombre_cliente ?? '', p.fecha_creacion ?? '', p.saldo ?? p.monto_total ?? p.monto ?? 0]
        );
      }
      return prestamos;
    } catch (error: any) {
      console.error("Failed to fetch loans from API", error?.message);
      return await db.getAllAsync<Prestamo>('SELECT * FROM prestamos ORDER BY fecha_creacion DESC');
    }
  },

  createLoanForClient: async (clienteId: string | number, data: any): Promise<Prestamo> => {
    const db = await dbService.getDb();
    const state = await NetInfo.fetch();
    let newLoan = null;

    if (state.isConnected) {
        try {
            const response = await api.post(`/prestamos/`, { ...data, cliente_id: clienteId });
            newLoan = response.data;
        } catch (error) {
            console.error("API Create Loan Error:", error);
        }
    }
    
    // Si no hay conexión o falló la API, persistimos localmente con is_synced = 0
    const loanPayload = {
        id: newLoan?.id?.toString() || data.uuid || Date.now().toString(),
        uuid: newLoan?.uuid || data.uuid || null,
        monto: data.monto,
        monto_total: data.monto_total,
        tipo_interes: data.tipo_interes,
        porcentaje_interes: data.porcentaje_interes,
        num_cuotas: data.num_cuotas,
        estado: newLoan?.estado || 'pendiente',
        frecuencia_pago: data.frecuencia_pago,
        cliente_id: clienteId.toString(),
        nombre_cliente: data.nombre_cliente || '',
        fecha_creacion: newLoan?.fecha_creacion || new Date().toISOString(),
        saldo: data.monto_total,
        is_synced: newLoan ? 1 : 0
    };

    await db.runAsync(
      `INSERT OR REPLACE INTO prestamos (id, uuid, monto, monto_total, tipo_interes, porcentaje_interes, num_cuotas, estado, frecuencia_pago, cliente_id, nombre_cliente, fecha_creacion, saldo, is_synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [loanPayload.id, loanPayload.uuid, loanPayload.monto, loanPayload.monto_total, loanPayload.tipo_interes, loanPayload.porcentaje_interes, loanPayload.num_cuotas, loanPayload.estado, loanPayload.frecuencia_pago, loanPayload.cliente_id, loanPayload.nombre_cliente, loanPayload.fecha_creacion, loanPayload.saldo, loanPayload.is_synced]
    );

    if (!newLoan) {
        await queueService.addToQueue('LOAN', 'CREATE', { ...data, cliente_id: clienteId });
    }
    
    return loanPayload as any;
  },
};
