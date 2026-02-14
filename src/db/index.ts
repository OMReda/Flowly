import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { checkRequiredEnv } from '@/lib/check-env';

const dbFile = (process.env.DB_FILE_NAME || 'flowly_prod.db').replace("file:", "");

const globalForDb = global as unknown as {
    sqlite: Database.Database | undefined;
    db: any;
};

if (!globalForDb.sqlite) {
    if (process.env.NODE_ENV !== 'production') {
        checkRequiredEnv();
    }
    console.log(`[DB] Initializing new connection to ${dbFile}`);
    globalForDb.sqlite = new Database(dbFile);
    globalForDb.db = drizzle(globalForDb.sqlite, { schema });
}

export const sqlite = globalForDb.sqlite;
export const db = globalForDb.db;

