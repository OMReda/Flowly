import { Transaction } from "./types";
import { safeDivide, clamp, average, standardDeviation, coefficientOfVariation } from "./math-utils";

export interface Insight {
    type: 'warning' | 'suggestion' | 'pacing';
    title: string;
    description: string;
    impact: string;
    action?: string;
}

export interface Anomaly {
    merchant: string;
    amount: number;
    date: string;
    description: string;
    reason: string;
}

export interface DeterministicInsights {
    generated_at: string;
    status: 'learning' | 'baseline' | 'intelligent';
    forecast_next_month: number | null;
    forecast_reasoning: string;
    confidence: 'low' | 'medium' | 'high';
    anomalies: Anomaly[];
    flowly_score: number;
    score_reasoning: string;
    data_points: number;
    insights: Insight[];
    is_low_data: boolean;
}

export function calculateFlowlyScore(
    totalSpent: number,
    totalIncome: number,
    budget: number,
    anomalies: Anomaly[],
    transactionCount: number
): { score: number; reasoning: string } {
    // 1. Budget Adherence (40pts)
    let b_score = 0;
    if (totalSpent <= budget) {
        b_score = 40;
    } else {
        // Exponential decay for overspend: prevents instant collapse but penalizes more as ratio grows
        const overspendRatio = safeDivide(totalSpent - budget, budget, 0);
        b_score = 40 * Math.exp(-3 * overspendRatio);
    }

    // 2. Savings Rate / Efficiency (20pts)
    // Goal: Inflow > Outflow. Ideal = 20%
    let e_score = 0;
    const savingsRate = safeDivide(totalIncome - totalSpent, totalIncome, 0);
    const efficiencyScore = (savingsRate / 0.20) * 20;
    e_score = clamp(efficiencyScore, 0, 20);

    // 3. Anomaly Penalty (20pts)
    const a_score = Math.max(0, 20 - (anomalies.length * 4));

    // 4. Consistency (20pts) - Logarithmic scaling
    // Rewards growth progressively; avoids linear 20+ rule
    const consistencyScore = 20 * (Math.log(transactionCount + 1) / Math.log(30));
    const c_score = clamp(consistencyScore, 0, 20);

    const score = Math.round(b_score + e_score + a_score + c_score);

    // Supportive Reasoning
    let reasoning = "Analyzing your spending habits...";
    if (transactionCount < 5) {
        reasoning = "Score is in 'Learning Mode' while we observe your initial habits.";
    } else if (score > 85) {
        reasoning = "Excellent! High score due to disciplined budget adherence and positive savings rate.";
    } else if (score > 70) {
        reasoning = "Good progress. Your financial engine is stable with healthy habits.";
    } else if (totalSpent > budget) {
        reasoning = "Score impacted by budget overflow. Aligning spending with goals will help.";
    } else if (totalSpent > totalIncome && totalIncome > 0) {
        reasoning = "Outflow exceeds inflow this month. Focus on reducing variable expenses.";
    } else if (anomalies.length > 0) {
        reasoning = "Spikes detected. High one-time costs are impacting your efficiency score.";
    }

    return { score, reasoning };
}

export const MERCHANT_MAP: Record<string, string> = {
    'amazon': 'Shopping',
    'starbucks': 'Food',
    'uber': 'Transport',
    'lyft': 'Transport',
    'netflix': 'Bills',
    'spotify': 'Bills',
    'apple': 'Shopping',
    'walmart': 'Shopping',
    'target': 'Shopping',
    'mcdonald': 'Food',
};

export function detectMerchantCategory(merchant: string): string | null {
    const m = merchant.toLowerCase();
    for (const [key, cat] of Object.entries(MERCHANT_MAP)) {
        if (m.includes(key)) return cat;
    }
    return null;
}

export function detectAnomalies(transactions: Transaction[]): Anomaly[] {
    const validExpenses = transactions.filter(t => t.type === 'expense' && t.amount != null);

    // Stabilization: Neutral until enough data is collected
    if (validExpenses.length < 5) return [];

    const amounts = validExpenses.map(t => Number(t.amount) || 0);
    const mean = average(amounts);
    const std = standardDeviation(amounts);

    // Spike threshold: Mean + 2*StdDev
    const threshold = mean + 2 * std;

    return validExpenses
        .filter(t => (Number(t.amount) || 0) > threshold && (Number(t.amount) || 0) > 10) // Min $10 to avoid noise
        .map(t => ({
            merchant: t.merchant || "Unknown Entity",
            amount: Number(t.amount) || 0,
            date: t.date || new Date().toISOString().split('T')[0],
            description: t.description || "N/A",
            reason: (Number(t.amount) || 0) > mean + 5 * std ? "One-time large purchase" : "Significant spike vs average"
        }));
}

export function generateForecast(transactions: Transaction[]): { total: number | null; reasoning: string; confidence: 'low' | 'medium' | 'high' } {
    const expenses = (transactions || []).filter(t => t.type === 'expense' && t.amount != null && t.date);
    const count = expenses.length;

    if (count < 5) {
        return {
            total: null,  // ✅ UI can check for null to show "Insufficient data"
            reasoning: "Need at least 5 transactions to generate a reliable forecast.",
            confidence: 'low'
        };
    }

    try {
        // Calculate daily average
        const dates = expenses.map(t => t.date ? new Date(t.date).getTime() : NaN).filter(d => !isNaN(d));
        if (dates.length === 0) throw new Error("No valid dates");

        const firstDate = new Date(Math.min(...dates));
        const lastDate = new Date(Math.max(...dates));
        const daysDiff = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));

        const totalSpent = expenses.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        const dailyAvg = totalSpent / daysDiff;
        let projected = dailyAvg * 30;

        // Confidence & Volatility Logic
        let confidence: 'low' | 'medium' | 'high' = 'low';

        // Base confidence on data points
        if (count >= 45) confidence = 'high';
        else if (count >= 15) confidence = 'medium';

        // Volatility Dampening using Coefficient of Variation
        const recentWindow = Math.min(count, 7);
        const recentExpenses = expenses.slice(0, recentWindow).map(t => Number(t.amount) || 0);
        const cv = coefficientOfVariation(recentExpenses);

        if (cv > 0.5) {
            projected *= 0.85; // Dampen projection due to high noise
            if (confidence === 'high') confidence = 'medium';
            else confidence = 'low';
        }

        return {
            total: Math.round((projected || 0) * 100) / 100,
            reasoning: `Projected monthly total based on your ${daysDiff}-day average of $${dailyAvg.toFixed(2)}/day${cv > 0.5 ? ' (with volatility dampening)' : ''}.`,
            confidence
        };
    } catch (e) {
        console.error("Forecast Error:", e);
        return {
            total: null,
            reasoning: "Unable to calculate forecast due to data quality issues.",
            confidence: 'low'
        };
    }
}

export function generateInsights(
    transactions: Transaction[],
    budget: number,
    totalSpent: number,
    transactionCount: number
): Insight[] {
    const insights: Insight[] = [];

    // Early return for insufficient data - Learning Mode
    if (transactionCount < 5) {
        return [{
            type: 'pacing',
            title: 'Learning Mode Active',
            description: 'Add more transactions to unlock personalized insights.',
            impact: `Flowly needs at least 5 transactions to provide reliable guidance. Currently tracking ${transactionCount} transaction${transactionCount === 1 ? '' : 's'}.`
        }];
    }

    const isLearning = transactionCount < 15;  // Low confidence zone
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dayOfMonth = today.getDate();
    const daysRemaining = daysInMonth - dayOfMonth;

    // 1. Budget Pacing
    const usedPercentage = budget > 0 ? (totalSpent / budget) * 100 : 0;
    if (usedPercentage > 0) {
        const paceContext = budget === 1000 ? "Based on default $1k budget" : "Based on your set monthly budget";

        // Hedged language for low data
        const qualifier = isLearning ? "Early data suggests" : "Analysis shows";

        insights.push({
            type: 'pacing',
            title: 'Monthly Pacing',
            description: `${qualifier} you've utilized ${usedPercentage.toFixed(1)}% of your budget with ${daysRemaining} days remaining.`,
            impact: usedPercentage > (dayOfMonth / daysInMonth) * 100 * 1.1
                ? `You are currently trending above your allocation. (${paceContext})`
                : `You are pacing well within your limits. (${paceContext})`
        });
    }

    // 2. Recovery Guidance (e.g., Category optimization)
    const categoryTotals: Record<string, number> = {};
    transactions.forEach(t => {
        if (t.type === 'expense' && t.category) {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + (Number(t.amount) || 0);
        }
    });

    const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCategoryEntry && usedPercentage > 80) {
        const [catName, catTotal] = topCategoryEntry;
        const reduction = catTotal * 0.2;

        insights.push({
            type: 'suggestion',
            title: isLearning ? 'Early Pattern Detected' : 'Recovery Strategy',
            description: `${isLearning ? 'Initial data suggests' : 'Analysis confirms'} spending in "${catName}" is $${catTotal.toFixed(2)}.${isLearning ? ' (Based on limited recent data)' : ''}`,
            impact: `Reducing this by 20% ${isLearning ? 'could' : 'would'} save you $${reduction.toFixed(2)} this month.`,
            action: `Consider limiting ${catName} purchases for the next ${daysRemaining} days.`
        });
    }

    return insights;
}

/**
 * Explanation methods for transparency
 */
export function getScoreExplanation(): string {
    return `Flowly Score Calculation:

1. Budget Adherence (40 points)
   • Full points if spending ≤ budget
   • Scaled penalty for overspending

2. Efficiency / Savings (20 points)
   • Bonus for keeping Outflow < Inflow
   • 20% savings rate is the "Gold Standard"

3. Anomaly Control (20 points)
   • Penalty for unusual spending spikes
   • Encourages predictable habits

4. Consistency (20 points)
   • Based on transaction frequency
   • Ensures data captures full habit range

Note: Score enters "Learning Mode" with <5 transactions.`;
}

export function getForecastExplanation(): string {
    return `30-Day Forecast Method:

1. Calculate your average daily spending
2. Project this rate over 30 days
3. Confidence levels:
   • Low: 5-14 transactions
   • Medium: 15-44 transactions
   • High: 45+ transactions

4. Confidence downgraded if recent spending
   shows high volatility (>50% deviation)

Note: Requires minimum 5 transactions.`;
}

export function getBudgetSourceExplanation(budget: number): string {
    return budget === 1000
        ? "Currently using default $1,000 monthly budget. Update in Settings to personalize insights."
        : `Analysis based on your custom $${budget} monthly budget.`;
}
