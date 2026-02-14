import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { authConfig } from "./auth.config";

async function getUser(email: string) {
    try {
        const user = await db.select().from(users).where(eq(users.email, email)).get();
        return user;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        throw new Error("Failed to fetch user.");
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log(`[AUTH] Authorize session attempt for ${credentials?.email}`);
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) {
                        console.warn(`[AUTH] User not found: ${email}`);
                        return null;
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password_hash);

                    if (passwordsMatch) {
                        console.log(`[AUTH] Success login for ${email}`);
                        return user;
                    }
                    console.warn(`[AUTH] Password mismatch for ${email}`);
                }

                console.warn(`[AUTH] Invalid credentials format or failed verification`);
                return null;
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            console.log(`[AUTH] Session callback: token.sub = ${token?.sub}`);
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token }) {
            return token;
        },
    },
});
