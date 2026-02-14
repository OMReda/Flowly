"use server";

import { db } from "@/db";
import { profiles, audit_logs } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { Transaction, UserProfile } from "@/lib/types";

export async function updateProfile(formData: Partial<UserProfile>) {
    console.log("[ACTION] updateProfile start", JSON.stringify(formData));
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const userId = session.user.id;
    const dataToUpdate = {
        ...formData,
        onboarding_completed: formData.onboarding_completed ?? true,
    };

    try {
        console.log(`[ACTION] updateProfile for user: ${userId}`);
        const updateResult = db.update(profiles)
            .set(dataToUpdate)
            .where(eq(profiles.id, userId))
            .run();

        if (updateResult.changes === 0) {
            console.log(`[ACTION] Profile missing for ${userId}, inserting new row`);
            db.insert(profiles).values({
                id: userId,
                currency_pref: 'USD',
                monthly_budget: 1000,
                monthly_income: 0,
                fixed_expenses: 0,
                starting_balance: 0,
                financial_goal: 'save',
                personality: 'balanced',
                ai_enabled: true,
                ...dataToUpdate,
            }).run();
        }

        // Audit Log (Optional, don't let it crash the main action)
        try {
            db.insert(audit_logs).values({
                id: uuidv4(),
                user_id: userId,
                entity_type: 'profile',
                entity_id: userId,
                action: 'update',
                new_data: JSON.stringify(formData),
            }).run();
        } catch (auditErr) {
            console.error("[ACTION] Audit Log Error (non-fatal):", auditErr);
        }

        console.log("[ACTION] updateProfile success");
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("[ACTION] updateProfile Fatal Error:", error);
        throw new Error(error.message || "Failed to update profile");
    }
}

export async function getProfile(): Promise<UserProfile | null> {
    console.log("[ACTION] getProfile start");
    try {
        const session = await auth();
        if (!session?.user?.id) return null;

        const profile = db.query.profiles.findFirst({
            where: eq(profiles.id, session.user.id),
        }) as unknown as UserProfile | undefined;

        console.log("[ACTION] getProfile success", !!profile);
        return profile || null;
    } catch (error) {
        console.error("[ACTION] getProfile Fatal Error:", error);
        return null;
    }
}
