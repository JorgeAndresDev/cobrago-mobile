import * as SQLite from 'expo-sqlite';

const DB_NAME = 'cobrago.db';

// Singleton: una sola conexión durante todo el ciclo de vida de la app
let _db: SQLite.SQLiteDatabase | null = null;

export const dbService = {
  getDb: async () => {
    if (!_db) {
      _db = await SQLite.openDatabaseAsync(DB_NAME);
    }
    return _db;
  },

  initDb: async () => {
    const db = await dbService.getDb(); // Usa el Singleton
    
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS clientes (
        id TEXT PRIMARY KEY, -- Usaremos la Cédula o UUID
        nombre TEXT NOT NULL,
        cedula TEXT NOT NULL UNIQUE,
        telefono TEXT,
        direccion TEXT,
        usuario_id INTEGER,
        latitud REAL,
        longitud REAL,
        observaciones TEXT,
        nivel_riesgo TEXT,
        foto_url TEXT,
        foto_local_path TEXT,
        is_synced INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS prestamos (
        id TEXT PRIMARY KEY, -- UUID generado en la app
        uuid TEXT UNIQUE,    -- Para compatibilidad con el servidor
        monto REAL NOT NULL,
        monto_total REAL,    -- Monto + Interés
        tipo_interes TEXT,   -- diaria, semanal, quincenal, mensual, personalizado
        porcentaje_interes REAL,
        num_cuotas INTEGER NOT NULL,
        estado TEXT NOT NULL,
        frecuencia_pago TEXT NOT NULL,
        cliente_id TEXT,     -- Referencia a la cédula/id del cliente
        nombre_cliente TEXT,
        fecha_creacion TEXT,
        saldo REAL,
        is_synced INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS pagos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prestamo_id INTEGER NOT NULL,
        monto REAL NOT NULL,
        fecha TEXT NOT NULL,
        external_id INTEGER,
        is_synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL, -- 'CLIENT', 'LOAN', 'PAYMENT'
        action TEXT NOT NULL, -- 'CREATE', 'UPDATE'
        data TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("Database initialized");

    // Migraciones automáticas: Se ejecutan una a una ignorando errores si la columna ya existe
    const migrations = [
      // Migraciones para CLIENTES
      "ALTER TABLE clientes ADD COLUMN usuario_id INTEGER;",
      "ALTER TABLE clientes ADD COLUMN latitud REAL;",
      "ALTER TABLE clientes ADD COLUMN longitud REAL;",
      "ALTER TABLE clientes ADD COLUMN observaciones TEXT;",
      "ALTER TABLE clientes ADD COLUMN nivel_riesgo TEXT;",
      "ALTER TABLE clientes ADD COLUMN foto_url TEXT;",
      "ALTER TABLE clientes ADD COLUMN foto_local_path TEXT;",
      // Migraciones para PRESTAMOS (Crítico)
      "ALTER TABLE prestamos ADD COLUMN uuid TEXT;",
      "ALTER TABLE prestamos ADD COLUMN monto_total REAL;",
      "ALTER TABLE prestamos ADD COLUMN tipo_interes TEXT;",
      "ALTER TABLE prestamos ADD COLUMN porcentaje_interes REAL;",
      "ALTER TABLE prestamos ADD COLUMN nombre_cliente TEXT;",
      "ALTER TABLE prestamos ADD COLUMN fecha_creacion TEXT;",
      "ALTER TABLE prestamos ADD COLUMN saldo REAL;",
      // Migraciones para PAGOS
      "ALTER TABLE pagos ADD COLUMN external_id INTEGER;"
    ];

    for (const query of migrations) {
      try {
        await db.execAsync(query);
        console.log(`Migration successful: ${query.split('ADD COLUMN')[1].trim()}`);
      } catch (e) {
        // La columna probablemente ya existe o la tabla no está lista, ignorar silenciosamente
      }
    }
  },

  // Helper to clear DB (for debugging/reset)
  clearDb: async () => {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(`
      DROP TABLE IF EXISTS clientes;
      DROP TABLE IF EXISTS prestamos;
      DROP TABLE IF EXISTS pagos;
      DROP TABLE IF EXISTS sync_queue;
    `);
    await dbService.initDb();
  }
};
