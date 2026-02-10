import Database from 'better-sqlite3';

const databases = ['spendwise.db', 'spendwise_prod.db'];

for (const dbFile of databases) {
    console.log(`Migrating ${dbFile}...`);
    const db = new Database(dbFile);

    const columns = [
        { table: 'profiles', column: 'monthly_income', type: 'integer' },
        { table: 'profiles', column: 'fixed_expenses', type: 'integer' },
        { table: 'profiles', column: 'financial_goal', type: 'text' },
        { table: 'profiles', column: 'personality', type: 'text' },
        { table: 'profiles', column: 'starting_balance', type: 'integer DEFAULT 0' },
        { table: 'profiles', column: 'onboarding_completed', type: 'integer DEFAULT 0' },
        { table: 'profiles', column: 'gemini_api_key', type: 'text' },
        { table: 'profiles', column: 'ai_enabled', type: 'integer DEFAULT 1' },
        { table: 'transactions', column: 'ai_reasoning', type: 'text' },
        { table: 'transactions', column: 'ai_confidence', type: 'text' },
        { table: 'transactions', column: 'is_immutable', type: 'integer DEFAULT 0' },
        { table: 'transactions', column: 'deleted_at', type: 'text' },
    ];

    for (const col of columns) {
        try {
            db.exec(`ALTER TABLE \`${col.table}\` ADD \`${col.column}\` ${col.type};`);
            console.log(`Added ${col.column} to ${col.table}`);
        } catch (e) {
            // Ignore if column already exists
        }
    }

    try {
        // Create audit_logs if it doesn't exist
        db.exec(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "entity_type" text NOT NULL,
        "entity_id" text NOT NULL,
        "action" text NOT NULL,
        "previous_data" text,
        "new_data" text,
        "created_at" text DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log(`Audit logs verified for ${dbFile}`);
    } catch (e) {
        console.log(`Error creating audit_logs for ${dbFile}: ${(e as Error).message}`);
    }

    db.close();
}
