"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { transactions, audit_logs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { Transaction } from "@/lib/types";

export async function updateTransactionCategory(id: string, newCategory: string) {
    console.log(`[ACTION] updateTransactionCategory start: ${id} -> ${newCategory}`);
    try {
        const session = await auth();
        if (!session?.user?.id) {
            console.warn("[ACTION] updateTransactionCategory failed: Not authenticated");
            return { success: false, error: "Unauthorized" };
        }

        const existing = db.select().from(transactions).where(
            and(
                eq(transactions.id, id),
                eq(transactions.user_id, session.user.id)
            )
        ).limit(1).get() as Transaction | undefined;

        if (!existing) {
            console.warn(`[ACTION] updateTransactionCategory failed: Transaction ${id} not found`);
            return { success: false, error: "Transaction not found" };
        }

        db.update(transactions)
            .set({ category: newCategory })
            .where(eq(transactions.id, id))
            .run();

        // Audit Log
        db.insert(audit_logs).values({
            id: uuidv4(),
            user_id: session.user.id,
            entity_type: 'transaction',
            entity_id: id,
            action: 'update_category',
            previous_data: JSON.stringify(existing),
            new_data: JSON.stringify({ ...existing, category: newCategory }),
        }).run();

        console.log(`[ACTION] updateTransactionCategory success: ${id}`);
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("[ACTION] updateTransactionCategory Fatal Error:", error);
        return { success: false, error: "Failed to update category" };
    }
}
