"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { transactions, categories, audit_logs } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { v4 as uuidv4 } from "uuid";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function processFinance(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Not authenticated" };
        }

        const rawInput = formData.get("input") as string;
        const file = formData.get("file") as File;

        if (!rawInput && !file) {
            return { error: "No input provided" };
        }
        console.log("[ACTION] processFinance start", { rawInput, hasFile: !!file });

        let data: {
            merchant: string;
            total: number;
            category: string;
            type: "income" | "expense";
            is_recurring: boolean;
            date: string;
            description: string;
        } | null = null;

        const isApiKeyValid = process.env.GEMINI_API_KEY &&
            process.env.GEMINI_API_KEY !== "your-gemini-api-key" &&
            process.env.GEMINI_API_KEY.length > 20;

        if (isApiKeyValid) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                let prompt = rawInput || "Extract data from this receipt";
                let imageParts: { inlineData: { data: string; mimeType: string } }[] = [];

                if (file && file.size > 0) {
                    const arrayBuffer = await file.arrayBuffer();
                    const base64 = Buffer.from(arrayBuffer).toString("base64");
                    imageParts = [{ inlineData: { data: base64, mimeType: file.type } }];
                }

                const systemPrompt = `Return ONLY JSON: { "merchant": string, "total": number, "category": string, "type": "income" | "expense", "is_recurring": boolean, "date": string, "description": string }. 
                Determine if the input is an income (paycheck, deposit, gift) or an expense.`;
                const result = await model.generateContent([systemPrompt, prompt, ...imageParts]);
                const response = await result.response;
                const text = response.text();
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    data = JSON.parse(jsonMatch[0]);
                    console.log("[ACTION] processFinance AI Extraction Successful");
                }
            } catch (aiError) {
                console.error("[ACTION] processFinance AI failed, falling back to mock:", aiError);
            }
        }

        // Fallback to Mock if AI failed or key invalid
        if (!data) {
            console.log("[ACTION] processFinance using Mock Parser Fallback");
            // Add a small artificial delay to simulate "AI thinking" for a better demo feel
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Look for amount: prioritize strings starting with $ or following "for"/"at"
            const priceRegex = /(?:\$|for|at)\s*(\d+([.,]\d{1,2})?)/i;
            const fallbackRegex = /(\d+([.,]\d{1,2})?)/;
            const amountMatch = rawInput.match(priceRegex) || rawInput.match(fallbackRegex);

            const total = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
            const merchant = rawInput.split(/for|\$|at/i)[0].trim() || "Unknown Merchant";

            const isIncome = /paycheck|salary|deposit|refund|earned|gift|bonus|income/i.test(rawInput);

            data = {
                merchant,
                total,
                category: isIncome ? "Income" : "Other",
                type: isIncome ? "income" : "expense",
                is_recurring: /subscription|monthly|weekly/i.test(rawInput),
                date: new Date().toISOString().split("T")[0],
                description: `Manual Entry: ${rawInput}`
            };
        }

        const newTransactionId = crypto.randomUUID();
        const transactionValue = {
            id: newTransactionId,
            user_id: session.user.id,
            amount: data.total || 0,
            type: data.type || "expense",
            category: data.category || "Other",
            merchant: data.merchant || "Unknown",
            description: data.description || rawInput || `Transaction at ${data.merchant}`,
            date: data.date || new Date().toISOString().split("T")[0],
            is_subscription: data.is_recurring || false,
            ai_raw_json: JSON.stringify(data),
        };

        db.insert(transactions).values(transactionValue).run();

        // Audit Log
        db.insert(audit_logs).values({
            id: uuidv4(),
            user_id: session.user.id,
            entity_type: 'transaction',
            entity_id: newTransactionId,
            action: 'create_ai',
            new_data: JSON.stringify(transactionValue),
        }).run();

        console.log("[ACTION] processFinance success");
        revalidatePath("/");
        return { success: true };

    } catch (error) {
        console.error("Fatal Processing Error:", error);
        return { error: "Failed to process transaction." };
    }
}
