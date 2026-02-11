import { db } from "@/db";
import { transactions, profiles } from "@/db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { auth } from "@/auth";
import { Transaction, UserProfile } from "@/lib/types";
import {
    calculateFlowlyScore,
    detectAnomalies,
    generateForecast,
    generateInsights,
    DeterministicInsights
} from "@/lib/deterministic-logic";

export async function getInsights(): Promise<DeterministicInsights | { error: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            console.warn("[ACTION] getInsights failed: Not authenticated");
            return { error: "Not authenticated" };
        }

        const userId = session.user.id;

        const allTransactions = db.select().from(transactions)
            .where(
                and(
                    eq(transactions.user_id, userId),
                    isNull(transactions.deleted_at)
                )
            )
            .orderBy(desc(transactions.date))
            .all() as Transaction[];

        const userProfile = db.select().from(profiles)
            .where(eq(profiles.id, userId))
            .get() as UserProfile | undefined;

        console.log(`[ACTION] getInsights found ${allTransactions.length} transactions`);

        const expenses = allTransactions.filter(t => t.type === 'expense');
        const totalSpent = expenses.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        const budget = Number(userProfile?.monthly_budget) || 1000;

        const anomalies = detectAnomalies(expenses);
        const forecast = generateForecast(expenses);
        // Correctly pass transaction count
        const insightsList = generateInsights(expenses, budget, totalSpent, expenses.length);
        const { score, reasoning: scoreReasoning } = calculateFlowlyScore(totalSpent, budget, anomalies, expenses.length);

        return {
            generated_at: new Date().toISOString(),
            status: expenses.length >= 10 ? 'intelligent' : (expenses.length >= 5 ? 'baseline' : 'learning'),
            forecast_next_month: forecast.total, // Can be null
            forecast_reasoning: forecast.reasoning || "Insufficient data",
            confidence: (forecast.confidence as 'low' | 'medium' | 'high') || "low",
            anomalies: anomalies || [],
            flowly_score: Number(score) || 0,
            score_reasoning: scoreReasoning,
            data_points: expenses.length,
            insights: insightsList || [],
            is_low_data: expenses.length < 5
        };

    } catch (error) {
        console.error("[ACTION] getInsights Fatal Error:", error);
        return { error: "Failed to generate insights due to an internal error." };
    }
}
