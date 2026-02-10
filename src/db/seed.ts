import { db } from "./index";
import { categories, users, transactions } from "./schema";
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const initialCategories = [
    { name: 'Food', icon_name: 'utensils', color_hex: '#F59E0B', type: 'expense' },
    { name: 'Transport', icon_name: 'car', color_hex: '#3B82F6', type: 'expense' },
    { name: 'Utilities', icon_name: 'lightbulb', color_hex: '#10B981', type: 'expense' },
    { name: 'Entertainment', icon_name: 'film', color_hex: '#8B5CF6', type: 'expense' },
    { name: 'Shopping', icon_name: 'shopping-bag', color_hex: '#EC4899', type: 'expense' },
    { name: 'Health', icon_name: 'heart', color_hex: '#EF4444', type: 'expense' },
    { name: 'Other', icon_name: 'more-horizontal', color_hex: '#6B7280', type: 'expense' },
    { name: 'Salary', icon_name: 'briefcase', color_hex: '#10B981', type: 'income' },
    { name: 'Investments', icon_name: 'trending-up', color_hex: '#3B82F6', type: 'income' },
    { name: 'Gift', icon_name: 'gift', color_hex: '#EC4899', type: 'income' },
    { name: 'Refund', icon_name: 'refresh-ccw', color_hex: '#6B7280', type: 'income' },
];

async function seed() {
    console.log('Seeding categories...');

    // Check if categories already exist to prevent duplicates
    const existingCategories = await db.select().from(categories).all();

    if (existingCategories.length === 0) {
        console.log('No categories found, seeding initial set...');
        for (const cat of initialCategories) {
            await db.insert(categories).values({
                id: uuidv4(),
                ...cat
            });
        }
        console.log(`Seeded ${initialCategories.length} categories`);
    } else {
        console.log(`Categories already exist (${existingCategories.length} found), skipping seed`);
    }

    // Demo User
    const email = "demo@example.com";
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();

    if (!existingUser) {
        console.log('Creating demo user...');
        const hashedPassword = await bcrypt.hash("password", 10);
        const userId = uuidv4();

        await db.insert(users).values({
            id: userId,
            email,
            password_hash: hashedPassword,
            name: "Demo User",
        });

        // Seed comprehensive data for ML (Demo Account Only)
        console.log('Seeding transactions for Demo User...');
        const today = new Date();

        // Realistic Categories & Distribution Weights
        const demoCategories = [
            { name: 'Food', weight: 0.4, range: [5, 30] },
            { name: 'Transport', weight: 0.2, range: [10, 40] },
            { name: 'Entertainment', weight: 0.15, range: [15, 60] },
            { name: 'Shopping', weight: 0.15, range: [20, 100] },
            { name: 'Utilities', weight: 0.05, range: [40, 150] },
            { name: 'Health', weight: 0.05, range: [10, 100] }
        ];

        // Generate 30 days of data
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Random transactions per day (1-3) to ensure data density
            // Higher deviation on weekends (suppose i=0 is today, check formatting if needed, but simple random is fine for MVP)
            const numTrans = Math.floor(Math.random() * 3) + 1;

            for (let j = 0; j < numTrans; j++) {
                // Weighted Category Selection
                const rand = Math.random();
                let cumulativeWeight = 0;
                let selectedCat = demoCategories[0];
                for (const cat of demoCategories) {
                    cumulativeWeight += cat.weight;
                    if (rand <= cumulativeWeight) {
                        selectedCat = cat;
                        break;
                    }
                }

                const amount = Math.floor(Math.random() * (selectedCat.range[1] - selectedCat.range[0])) + selectedCat.range[0];

                await db.insert(transactions).values({
                    id: uuidv4(),
                    user_id: userId,
                    amount: amount,
                    type: 'expense',
                    category: selectedCat.name,
                    merchant: `Merchant ${selectedCat.name} ${j}`,
                    description: `Demo Transaction ${i}-${j}`,
                    date: dateStr,
                    is_subscription: false
                });
            }
        }

        // Add specific anomalies for insights
        // 1. One large impulse buy 2 days ago
        await db.insert(transactions).values({
            id: uuidv4(),
            user_id: userId,
            amount: 450,
            type: 'expense',
            category: 'Shopping',
            merchant: 'Luxury Brand Store',
            description: 'Impulse buy (Anomaly Test)',
            date: new Date(today.getTime() - 86400000 * 2).toISOString().split('T')[0],
            is_subscription: false
        });

        // 2. A subscription
        await db.insert(transactions).values({
            id: uuidv4(),
            user_id: userId,
            amount: 15.99,
            type: 'expense',
            category: 'Entertainment',
            merchant: 'Netflix',
            description: 'Monthly Subscription',
            date: new Date(today.getTime() - 86400000 * 15).toISOString().split('T')[0],
            is_subscription: true
        });
    }

    console.log('Seeding complete.');
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
