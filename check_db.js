const Database = require('better-sqlite3');
const db = new Database('spendwise_prod.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name).join(', '));
const hasAuditLogs = tables.some(t => t.name === 'audit_logs');
if (!hasAuditLogs) {
    console.error('CRITICAL: audit_logs table is MISSING!');
} else {
    console.log('audit_logs table exists.');
}
db.close();
