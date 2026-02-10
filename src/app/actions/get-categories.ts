"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCategoriesByType(type: "income" | "expense") {
    console.log(`[ACTION] getCategoriesByType called with type: ${type}`);
    try {
        const results = await db.select()
            .from(categories)
            .where(eq(categories.type, type))
            .all();
        console.log(`[ACTION] getCategoriesByType returning ${results.length} categories`);
        return results;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}
