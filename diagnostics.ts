import Database from 'better-sqlite3';

function check() {
    const db = new Database('spendwise_prod.db');
    const count = (db.prepare('SELECT count(*) as count FROM transactions').get() as { count: number }).count;
    console.log('TOTAL TRANSACTIONS:', count);

    const firstFive = db.prepare('SELECT * FROM transactions LIMIT 5').all();
    console.log('FIRST 5:', JSON.stringify(firstFive, null, 2));

    const categories = (db.prepare('SELECT count(*) as count FROM categories').get() as { count: number }).count;
    console.log('TOTAL CATEGORIES:', categories);

    db.close();
}

check();
