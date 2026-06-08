import api from "../api/axios";
import { dbService } from "./dbService";
import { queueService } from "./queueService";
import NetInfo from "@react-native-community/netinfo";

export interface PaymentData {
  prestamo_id: number;
  monto: number;
  comentario: string;
}

export const paymentService = {
  createPayment: async (data: PaymentData) => {
    const state = await NetInfo.fetch();
    const db = await dbService.getDb();

    if (state.isConnected) {
      try {
        const response = await api.post("/pagos/", data);
        
        // Update local loan balance if needed
        await db.runAsync(
          'UPDATE prestamos SET saldo = saldo - ? WHERE id = ?',
          [data.monto, data.prestamo_id]
        );
        
        return response.data;
      } catch (error) {
        console.error("Failed to create payment in API, queueing locally", error);
      }
    }

    // Offline: save locally and queue
    await db.runAsync(
      'INSERT INTO pagos (prestamo_id, monto, fecha) VALUES (?, ?, ?)',
      [data.prestamo_id, data.monto, new Date().toISOString()]
    );
    
    await db.runAsync(
      'UPDATE prestamos SET saldo = saldo - ? WHERE id = ?',
      [data.monto, data.prestamo_id]
    );

    await queueService.addToQueue('PAYMENT', 'CREATE', data);
    
    return { id: Date.now(), ...data, offline: true };
  },
};
