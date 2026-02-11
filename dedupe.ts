import Database from 'better-sqlite3';

function deduplicate() {
    const db = new Database('spendwise_prod.db');

    console.log("Deduplicating categories...");

    // 1. Get all categories
    const allCats = db.prepare('SELECT * FROM categories').all() as { id: number; name: string }[];
    const seen = new Set<string>();
    const toDelete: number[] = [];
    const validMap = new Map<string, number>(); // name -> id of the one we keep

    for (const cat of allCats) {
        if (seen.has(cat.name)) {
            toDelete.push(cat.id);
        } else {
            seen.add(cat.name);
            validMap.set(cat.name, cat.id);
        }
    }

    if (toDelete.length === 0) {
        console.log("No duplicates found.");
    } else {
        console.log(`Found ${toDelete.length} duplicates. Deleting...`);

        // Actually, seed.ts uses the name in transactions.category anyway, 
        // but the manual entry form now uses the name field. 
        // We just need to make sure the IDs in categories table are clean.

        const deleteStmt = db.prepare('DELETE FROM categories WHERE id = ?');
        const transaction = db.transaction((ids: number[]) => {
            for (const id of ids) {
                deleteStmt.run(id);
            }
        });
        transaction(toDelete);
        console.log("Deleted duplicates.");
    }

    db.close();
}

deduplicate();
