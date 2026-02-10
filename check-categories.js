const Database = require('better-sqlite3');
const db = new Database('spendwise_prod.db');

const cats = db.prepare('SELECT * FROM categories').all();
console.log(`Total categories: ${cats.length}`);
console.log('\nCategory list:');
cats.forEach(c => console.log(`  - ${c.name} (${c.type})`));

db.close();
