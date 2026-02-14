"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCategoriesByType(type: "income" | "expense") {
    try {
        const results = await db.select()
            .from(categories)
            .where(eq(categories.type, type))
            .all();
        return results;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}
