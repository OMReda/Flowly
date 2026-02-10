"use server";

import { db } from "@/db";
import { transactions, audit_logs } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { parseCSV, CSVParseResult } from "@/lib/csv-parser";

export interface ImportResult {
    success: boolean;
    imported: number;
    failed: number;
    errors?: Array<{ row: number; field: string; message: string }>;
    error?: string;
}

export async function importCSV(csvText: string): Promise<ImportResult> {
    try {
        console.log("[ACTION] importCSV start");
        const session = await auth();
        if (!session?.user?.id) {
            console.warn("[ACTION] importCSV failed: Not authenticated");
            return { success: false, imported: 0, failed: 0, error: "Not authenticated" };
        }

        console.log(`[ACTION] importCSV processing for user: ${session.user.id}`);

        // Parse and validate CSV
        const parseResult: CSVParseResult = parseCSV(csvText);

        if (parseResult.errors.length > 0 && parseResult.valid.length === 0) {
            console.warn(`[ACTION] importCSV validation failed: ${parseResult.errors.length} errors`);
            return {
                success: false,
                imported: 0,
                failed: parseResult.totalRows,
                errors: parseResult.errors
            };
        }

        // Import valid transactions
        let importedCount = 0;
        const importedIds: string[] = [];

        for (const row of parseResult.valid) {
            try {
                const transactionId = uuidv4();

                db.insert(transactions).values({
                    id: transactionId,
                    user_id: session.user.id,
                    amount: parseFloat(row.amount),
                    type: row.type as "income" | "expense",
                    category: row.category,
                    merchant: row.merchant,
                    description: row.description || `CSV Import: ${row.merchant}`,
                    date: row.date,
                    is_subscription: false,
                }).run();

                importedIds.push(transactionId);
                importedCount++;
            } catch (err) {
                console.error(`[ACTION] importCSV failed to insert row:`, err);
            }
        }

        // Create audit log for bulk import
        if (importedCount > 0) {
            db.insert(audit_logs).values({
                id: uuidv4(),
                user_id: session.user.id,
                entity_type: 'transaction',
                entity_id: 'bulk_import',
                action: 'create_bulk',
                new_data: JSON.stringify({
                    count: importedCount,
                    transactionIds: importedIds
                }),
            }).run();
        }

        console.log(`[ACTION] importCSV success: ${importedCount} imported, ${parseResult.errors.length} failed`);
        revalidatePath("/");

        return {
            success: true,
            imported: importedCount,
            failed: parseResult.errors.length,
            errors: parseResult.errors.length > 0 ? parseResult.errors : undefined
        };

    } catch (error) {
        console.error("[ACTION] importCSV Fatal Error:", error);
        return {
            success: false,
            imported: 0,
            failed: 0,
            error: "Failed to import CSV. Please check the file format and try again."
        };
    }
}
