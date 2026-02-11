"use server";

import { db } from "@/db";
import { transactions, audit_logs } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const manualTransactionSchema = z.object({
    merchant: z.string().min(1, "Merchant is required"),
    amount: z.string().transform((val) => parseFloat(val)),
    category: z.string().min(1, "Category is required"),
    date: z.string().min(1, "Date is required"),
    type: z.enum(["income", "expense"]).default("expense"),
    is_subscription: z.boolean().default(false),
});

export async function addManualTransaction(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            console.warn("[ACTION] addManualTransaction failed: Not authenticated");
            return { error: "Not authenticated" };
        }

        const rawData = {
            merchant: formData.get("merchant"),
            amount: formData.get("amount"),
            category: formData.get("category"),
            date: formData.get("date"),
            type: formData.get("type") || "expense",
            is_subscription: formData.get("is_subscription") === "on",
        };

        console.log("[ACTION] addManualTransaction rawData:", JSON.stringify(rawData));

        const validated = manualTransactionSchema.safeParse(rawData);

        if (!validated.success) {
            console.warn("[ACTION] addManualTransaction validation failed:", validated.error.flatten());
            return { error: "Invalid form data" };
        }

        const newId = crypto.randomUUID();
        const transactionValue = {
            id: newId,
            user_id: session.user.id,
            amount: validated.data.amount,
            type: validated.data.type,
            category: validated.data.category,
            merchant: validated.data.merchant,
            description: `Manual ${validated.data.type}: ${validated.data.merchant}`,
            date: validated.data.date,
            is_subscription: validated.data.is_subscription,
        };

        console.log("[ACTION] addManualTransaction inserting transaction...");
        db.insert(transactions).values(transactionValue).run();

        // Audit Log
        db.insert(audit_logs).values({
            id: uuidv4(),
            user_id: session.user.id,
            entity_type: 'transaction',
            entity_id: newId,
            action: 'create',
            new_data: JSON.stringify(transactionValue),
        }).run();

        revalidatePath("/");
        return { success: true, id: newId, type: validated.data.type };
    } catch (error) {
        console.error("[ACTION] addManualTransaction Fatal Error:", error);
        return { error: "Failed to add transaction" };
    }
}
