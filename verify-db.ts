import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function checkSchema() {
    console.log("Checking transactions table:");
    const transactionsInfo = await db.all(sql`PRAGMA table_info(transactions)`);
    console.log(JSON.stringify(transactionsInfo, null, 2));

    console.log("\nChecking profiles table:");
    const profilesInfo = await db.all(sql`PRAGMA table_info(profiles)`);
    console.log(JSON.stringify(profilesInfo, null, 2));

    console.log("\nChecking audit_logs table:");
    const auditLogsInfo = await db.all(sql`PRAGMA table_info(audit_logs)`);
    console.log(JSON.stringify(auditLogsInfo, null, 2));

    process.exit(0);
}

checkSchema();
