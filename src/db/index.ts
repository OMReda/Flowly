import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const dbFile = process.env.DB_FILE_NAME?.replace("file:", "") || 'flowly_prod.db';

const globalForDb = global as unknown as {
    sqlite: Database.Database | undefined;
};

if (!globalForDb.sqlite) {
    console.log(`[DB] Initializing new connection to ${dbFile}`);
    globalForDb.sqlite = new Database(dbFile);
}

export const sqlite = globalForDb.sqlite;
export const db = drizzle(sqlite, { schema });
