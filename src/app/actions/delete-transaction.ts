"use server";

import { db } from "@/db";
import { transactions, audit_logs } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { Transaction } from "@/lib/types";

export async function deleteTransaction(transactionId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            console.warn("[ACTION] deleteTransaction failed: Not authenticated");
            return { error: "Not authenticated" };
        }
        const existing = db.select().from(transactions).where(
            and(
                eq(transactions.id, transactionId),
                eq(transactions.user_id, session.user.id)
            )
        ).limit(1).get() as Transaction | undefined;

        if (!existing) {
            console.warn(`[ACTION] deleteTransaction failed: Transaction ${transactionId} not found`);
            return { error: "Transaction not found" };
        }

        db.update(transactions)
            .set({ deleted_at: new Date().toISOString() })
            .where(
                and(
                    eq(transactions.id, transactionId),
                    eq(transactions.user_id, session.user.id)
                )
            ).run();

        // Audit Log
        db.insert(audit_logs).values({
            id: uuidv4(),
            user_id: session.user.id,
            entity_type: 'transaction',
            entity_id: transactionId,
            action: 'soft_delete',
            previous_data: JSON.stringify(existing),
        }).run();

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("[ACTION] deleteTransaction Fatal Error:", error);
        return { error: "Failed to delete transaction" };
    }
}

export async function restoreTransaction(transactionId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Not authenticated" };
        db.update(transactions)
            .set({ deleted_at: null })
            .where(
                and(
                    eq(transactions.id, transactionId),
                    eq(transactions.user_id, session.user.id)
                )
            ).run();

        // Audit Log
        db.insert(audit_logs).values({
            id: uuidv4(),
            user_id: session.user.id,
            entity_type: 'transaction',
            entity_id: transactionId,
            action: 'restore',
        }).run();

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("[ACTION] restoreTransaction Fatal Error:", error);
        return { error: "Failed to restore transaction" };
    }
}
