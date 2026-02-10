import Database from 'better-sqlite3';
try {
    const db = new Database('spendwise.db');
    console.log('better-sqlite3 loaded successfully');
    db.close();
} catch (e) {
    console.error('Failed to load better-sqlite3', e);
}
