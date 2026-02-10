import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { sql } from "drizzle-orm";

async function checkSchema(dbFile: string) {
    console.log(`\n--- Checking ${dbFile} ---`);
    const sqlite = new Database(dbFile);
    const db = drizzle(sqlite);

    console.log("Checking transactions table:");
    try {
        const transactionsInfo = await db.all(sql`PRAGMA table_info(transactions)`);
        console.log(JSON.stringify(transactionsInfo, null, 2));
    } catch (e: any) {
        console.log("Error checking transactions:", e.message);
    }

    console.log("\nChecking profiles table:");
    try {
        const profilesInfo = await db.all(sql`PRAGMA table_info(profiles)`);
        console.log(JSON.stringify(profilesInfo, null, 2));
    } catch (e: any) {
        console.log("Error checking profiles:", e.message);
    }

    sqlite.close();
}

async function main() {
    await checkSchema('spendwise_prod.db');
    await checkSchema('spendwise.db');
    process.exit(0);
}

main();
