import NetInfo from "@react-native-community/netinfo";
import { dbService } from "./dbService";
import { queueService } from "./queueService";
import { clientService } from "./clientService";
import { loanService } from "./loanService";
import { paymentService } from "./paymentService";
import api from "../api/axios";

export const syncService = {
  syncAll: async () => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return;

    console.log("[Sync] Starting sync...");
    
    try {
      await syncService.fetchFromServer();
      await syncService.pushToServer();
      console.log("[Sync] Sync complete");
    } catch (error) {
      console.error("[Sync] Sync failed:", error);
    }
  },

  fetchFromServer: async () => {
    const db = await dbService.getDb();
    
    // Sync Clientes
    const clients = await clientService.getClients();
    for (const client of clients) {
      await db.runAsync(
        `INSERT OR REPLACE INTO clientes (id, nombre, cedula, telefono, direccion, usuario_id, latitud, longitud, observaciones, nivel_riesgo, foto_url, is_synced) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [client.cedula.toString(), client.nombre, client.cedula.toString(), client.telefono || '', client.direccion || '', client.usuario_id, client.latitud || null, client.longitud || null, client.observaciones || '', client.nivel_riesgo || 'Bajo', client.foto_url || null]
      );
    }

    // Sync Prestamos
    const prestamos = await loanService.getPrestamos();
    for (const p of prestamos) {
      await db.runAsync(
        `INSERT OR REPLACE INTO prestamos (id, uuid, monto, monto_total, tipo_interes, porcentaje_interes, num_cuotas, estado, frecuencia_pago, cliente_id, nombre_cliente, fecha_creacion, saldo, is_synced) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [p.id.toString(), p.uuid || null, p.monto ?? 0, p.monto_total ?? p.monto ?? 0, p.tipo_interes ?? null, p.porcentaje_interes ?? 0, p.num_cuotas ?? 0, p.estado ?? '', p.frecuencia_pago ?? '', p.cliente_id?.toString() ?? '', p.nombre_cliente ?? '', p.fecha_creacion ?? '', p.saldo ?? p.monto_total ?? p.monto ?? 0]
      );
    }
  },

  pushToServer: async () => {
    const queue = await queueService.getQueue();

    for (const item of queue) {
      const data = JSON.parse(item.data);
      try {
        if (item.type === 'CLIENT') {
          if (item.action === 'CREATE') {
            await clientService.createClient(data);
          } else if (item.action === 'UPDATE') {
            await clientService.updateClient(data.id, data);
          } else if (item.action === 'DELETE') {
            try {
              await api.delete(`/clientes/${data.id}`);
            } catch (err: any) {
              // Si ya no existe en el servidor (404), lo damos por procesado con éxito
              if (err.response?.status !== 404) throw err;
            }
          }
        } else if (item.type === 'LOAN' && item.action === 'CREATE') {
          await loanService.createLoanForClient(data.cliente_id, data);
        } else if (item.type === 'PAYMENT' && item.action === 'CREATE') {
          await paymentService.createPayment(data);
        }
        
        await queueService.removeFromQueue(item.id);
        console.log(`[Sync] Processed ${item.type} ${item.action}`);
      } catch (error: any) {
        // 🔹 Si el error es una cédula duplicada, lo quitamos de la cola
        // porque significa que ya se guardó en el servidor en un intento previo
        if (error.message?.includes("ya se encuentra registrada") || error.message?.includes("400")) {
          console.log(`[Sync] Item already exists on server, removing from queue: ${item.type}`);
          await queueService.removeFromQueue(item.id);
        } else {
          console.error(`[Sync] Failed to sync item ${item.id}:`, error);
        }
      }
    }
  }
};
