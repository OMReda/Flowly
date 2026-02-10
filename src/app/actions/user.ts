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
    try {
        const session = await auth();
        if (!session?.user?.id) {
            console.warn("[ACTION] updateProfile failed: Not authenticated");
            return { error: "Not authenticated" };
        }

        console.log(`[ACTION] updateProfile for user: ${session.user.id}`);
        const result = db.update(profiles)
            .set({
                ...formData,
                onboarding_completed: formData.onboarding_completed ?? true,
            })
            .where(eq(profiles.id, session.user.id))
            .run();

        console.log(`[ACTION] updateProfile DB result: ${result.changes} rows updated`);

        // Audit Log
        db.insert(audit_logs).values({
            id: uuidv4(),
            user_id: session.user.id,
            entity_type: 'profile',
            entity_id: session.user.id,
            action: 'update',
            new_data: JSON.stringify(formData),
        }).run();

        console.log("[ACTION] updateProfile success");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("[ACTION] updateProfile Fatal Error:", error);
        return { error: "Failed to update profile" };
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
