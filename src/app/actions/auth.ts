"use server";

import { db } from "@/db";
import { users, transactions, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { signIn, signOut } from "@/auth";

import { AuthError } from "next-auth";

export async function handleSignOut() {
    await signOut();
}

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
        .regex(/[0-9]/, "Password must contain at least one numerical digit (0-9)")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character (e.g., !@#$%^&*)"),
    name: z.string().min(2, "Name must be at least 2 characters"),
});

export async function authenticate(prevState: unknown, formData: FormData) {
    try {
        await signIn("credentials", formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid email or password" };
                default:
                    return { error: "Something went wrong. Please try again." };
            }
        }
        throw error;
    }
}

export async function register(prevState: unknown, formData: FormData) {
    const validatedFields = registerSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.issues[0].message,
        };
    }

    const { email, password, name } = validatedFields.data;

    // Check if user exists
    const existingUser = db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .get();

    if (existingUser) {
        return {
            error: "Email already in use",
        };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    try {
        db.insert(users).values({
            id: userId,
            email,
            password_hash: hashedPassword,
            name,
        }).run();

        // Create empty profile
        db.insert(profiles).values({
            id: userId,
            monthly_budget: 1000,
            onboarding_completed: false,
        }).run();

    } catch (err) {
        console.error(err);
        return {
            error: "Failed to create user",
        };
    }

    // Return success to component to trigger client-side redirect or signIn
    return { success: true };
}
