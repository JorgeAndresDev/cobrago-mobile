import { dbService } from "./dbService";

export const queueService = {
  addToQueue: async (type: 'CLIENT' | 'LOAN' | 'PAYMENT', action: 'CREATE' | 'UPDATE' | 'DELETE', data: any) => {
    try {
      const db = await dbService.getDb();
      await db.runAsync(
        'INSERT INTO sync_queue (type, action, data) VALUES (?, ?, ?)',
        [type, action, JSON.stringify(data)]
      );
      console.log(`[Queue] Added ${action} ${type} to sync queue`);
    } catch (error) {
      console.error("[Queue] Error adding to queue:", error);
      throw error;
    }
  },

  getQueue: async () => {
    const db = await dbService.getDb();
    return await db.getAllAsync<{id: number, type: string, action: string, data: string}>(
      'SELECT * FROM sync_queue ORDER BY created_at ASC'
    );
  },

  removeFromQueue: async (id: number) => {
    const db = await dbService.getDb();
    await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
  }
};
