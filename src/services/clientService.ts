import api from "../api/axios";
import { Cliente } from "../types";
import { dbService } from "./dbService";
import { queueService } from "./queueService";
import NetInfo from "@react-native-community/netinfo";

export const clientService = {
  getClients: async (): Promise<Cliente[]> => {
    const db = await dbService.getDb();
    
    try {
      const response = await api.get("/clientes/");
      const clients = response.data;
      
      // 1. Obtener IDs (cédulas) que vienen del servidor
      const remoteIds = clients.map((c: any) => c.cedula.toString());
      
      // 2. Limpieza: Borrar locales que ya NO están en el servidor y que ya se habían sincronizado antes
      // No borramos los is_synced = 0 porque son creaciones nuevas offline
      if (remoteIds.length > 0) {
        const placeholders = remoteIds.map(() => '?').join(',');
        await db.runAsync(
          `DELETE FROM clientes WHERE is_synced = 1 AND id NOT IN (${placeholders})`,
          remoteIds
        );
      } else {
        await db.runAsync(`DELETE FROM clientes WHERE is_synced = 1`);
      }

      // 3. Insertar o actualizar los que vienen de la nube
      const mappedClients = clients.map((c: any) => ({
        ...c,
        id: c.cedula.toString(), // Forzamos a que el ID sea la cédula para consistencia local
      }));

      for (const client of mappedClients) {
        await db.runAsync(
          `INSERT OR REPLACE INTO clientes (id, nombre, cedula, telefono, direccion, usuario_id, latitud, longitud, observaciones, nivel_riesgo, foto_url, is_synced) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [client.id, client.nombre, client.cedula.toString(), client.telefono ?? '', client.direccion ?? '', client.usuario_id ?? 0, client.latitud ?? 0, client.longitud ?? 0, client.observaciones ?? '', client.nivel_riesgo ?? 'Bajo', client.foto_url ?? '']
        );
      }
      return mappedClients;
    } catch (error: any) {
      console.error("API Fetch Clients Error:", error?.message);
      return await db.getAllAsync<Cliente>('SELECT * FROM clientes ORDER BY nombre ASC');
    }
  },

  createClient: async (data: Omit<Cliente, "id" | "usuario_id">): Promise<Cliente> => {
    const state = await NetInfo.fetch();
    const db = await dbService.getDb();
    let newClient = null;

    if (state.isConnected) {
      try {
        const response = await api.post("/clientes/", data);
        newClient = response.data;
      } catch (error: any) {
        // Si el servidor responde con un error real (ej: 400 duplicado), lo lanzamos
        if (error.response?.status === 400) {
          throw new Error(error.response.data?.detail || "Error al crear cliente.");
        }
        console.error("Failed to create client in API, queueing locally", error);
      }
    }

    const clientPayload = {
      ...data,
      id: data.cedula.toString(),
      usuario_id: newClient?.usuario_id ?? 0,
      is_synced: newClient ? 1 : 0
    };

    // Offline mode or API failed: save to local DB
    await db.runAsync(
      `INSERT OR REPLACE INTO clientes (id, nombre, cedula, telefono, direccion, usuario_id, latitud, longitud, observaciones, nivel_riesgo, foto_url, foto_local_path, is_synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clientPayload.id, data.nombre, data.cedula.toString(), data.telefono ?? '', data.direccion ?? '', clientPayload.usuario_id, data.latitud ?? 0, data.longitud ?? 0, data.observaciones ?? '', data.nivel_riesgo ?? 'Bajo', newClient?.foto_url ?? '', data.foto_local_path ?? '', clientPayload.is_synced]
    );

    if (!newClient) {
      await queueService.addToQueue('CLIENT', 'CREATE', data);
    }
    
    return clientPayload as any;
  },

  getClientById: async (id: string | number): Promise<Cliente & { prestamos: any[] }> => {
    const db = await dbService.getDb();
    // Buscamos por ID (que ahora es la cédula)
    const client = await db.getFirstAsync<Cliente>('SELECT * FROM clientes WHERE id = ? OR cedula = ?', [id.toString(), id.toString()]);
    const prestamos = await db.getAllAsync<any>('SELECT * FROM prestamos WHERE cliente_id = ?', [id.toString()]);
    
    if (!client) {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        const response = await api.get(`/clientes/${id}`);
        return response.data;
      }
      throw new Error("Cliente no encontrado localmente.");
    }

    return { ...client, prestamos };
  },

  deleteClient: async (id: string | number): Promise<void> => {
    const db = await dbService.getDb();
    const state = await NetInfo.fetch();
    
    // 1. Borrar localmente de INMEDIATO
    await db.runAsync('DELETE FROM clientes WHERE id = ? OR cedula = ?', [id.toString(), id.toString()]);
    await db.runAsync('DELETE FROM prestamos WHERE cliente_id = ?', [id.toString()]);

    // 2. Intentar borrar en el servidor o encolar
    if (state.isConnected) {
      try {
        await api.delete(`/clientes/${id}`);
      } catch (error: any) {
        console.error("Failed to delete client in API, queueing deletion:", error?.message);
        await queueService.addToQueue('CLIENT', 'DELETE', { id });
      }
    } else {
      await queueService.addToQueue('CLIENT', 'DELETE', { id });
    }
  },

  updateClient: async (id: string | number, data: Partial<Cliente>): Promise<Cliente> => {
    const state = await NetInfo.fetch();
    const db = await dbService.getDb();
    
    if (state.isConnected) {
      try {
        const response = await api.put(`/clientes/${id}`, data);
        const updated = response.data;
        
        // Actualizar local
        await db.runAsync(
          `UPDATE clientes SET nombre=?, telefono=?, direccion=?, nivel_riesgo=?, observaciones=?, is_synced=1 WHERE id=?`,
          [updated.nombre, updated.telefono, updated.direccion, updated.nivel_riesgo, updated.observaciones, id.toString()]
        );
        return updated;
      } catch (error: any) {
        if (error.response?.status === 400) {
          throw new Error(error.response.data?.detail || "Error al actualizar cliente.");
        }
      }
    }

    // Si offline, guardar cambio local y encolar
    await db.runAsync(
      `UPDATE clientes SET nombre=?, telefono=?, direccion=?, nivel_riesgo=?, observaciones=?, is_synced=0 WHERE id=?`,
      [data.nombre, data.telefono, data.direccion, data.nivel_riesgo, data.observaciones, id.toString()]
    );
    await queueService.addToQueue('CLIENT', 'UPDATE', { id, ...data });
    
    return { id, ...data } as any;
  },
};
