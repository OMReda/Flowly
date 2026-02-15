import { Transaction, UserProfile } from "./types";
import { safeDivide, clamp, normalize, average, standardDeviation } from "./math-utils";

export interface VitalityMetrics {
    momentum: number; // -100 to +100 (%)
    efficiency: number; // 0 to 100 (%)
    savingsProgress: {
        current: number;
        target: number;
        percentage: number;
        monthsRemaining: number | null;
    };
    wealthProjections?: {
        monthlyCapacity: number;
        potential12MonthWealth: number;
    };
    disciplineScore: number; // 0 to 100
    disciplineLabel: 'Learning' | 'Critical' | 'Unstable' | 'Recovering' | 'Controlled' | 'Strong' | 'Elite';
    vitalityScore: number; // 0 to 100
    classification: 'Learning' | 'Critical' | 'Unstable' | 'Recovering' | 'Healthy' | 'Elite';
    insights: string[];
}

export function calculateVitality(
    currentNetFlow: number,
    previousNetFlow: number,
    income: number,
    previousIncome: number,
    expenses: number,
    profile: UserProfile,
    transactions: Transaction[],
    currentMonthTransactions: Transaction[]
): VitalityMetrics {
    const insights: string[] = [];

    // 1. Momentum (Acceleration Model)
    // Measures the change in savings rate (acceleration), NOT just net flow.
    const currentSR = safeDivide(currentNetFlow, income, 0);
    const previousSR = safeDivide(previousNetFlow, previousIncome, 0);

    const momentumDelta = safeDivide(currentSR - previousSR, Math.abs(previousSR) || 1, 0);

    // Normalize to 0-100 with a hard clamp at [-1, 1] to prevent scale explosion
    // -1 = 100% decline in savings rate (or move to negative)
    // +1 = 100% improvement in savings rate
    let momentum = normalize(momentumDelta, -1, 1, 0, 100);

    const startingBalance = profile.starting_balance || 0;
    const netBalance = startingBalance + currentNetFlow;

    // Liquidity Modifier: suppresses POSITIVE momentum if balance is negative.
    if (netBalance < 0 && momentum > 50) {
        const liquidityModifier = income > 0 ? clamp(1 - (Math.abs(netBalance) / income), 0, 1) : 0;
        momentum = 50 + (momentum - 50) * liquidityModifier;
    }

    // 2. Efficiency (Wealth Conversion Rate)
    // Efficiency = (Savings + Investments + Debt Reduction) / Total Income
    // For this MVP, we consider Net Flow as the "Efficiency" baseline if positive
    let efficiency = income > 0 ? (Math.max(0, currentNetFlow) / income) * 100 : 0;

    // Rule: If Net Balance < 0 -> Cap efficiency at 60%
    if (netBalance < 0) efficiency = Math.min(60, efficiency);

    // Rule: If Expenses > Income -> Auto-reduce score
    if (expenses > income) efficiency = efficiency * 0.5;

    // 3. Savings Target (Wealth Accumulation)
    const currentSaved = profile.current_savings || 0;
    const targetGoal = profile.savings_target || 0;
    const progressPercentage = targetGoal > 0 ? (currentSaved / targetGoal) * 100 : 0;

    // Time to Goal (Robust Capacity Projection)
    // We calculate a stable daily expense avg excluding anomalies for the wealth forecast
    const monthExpenses = currentMonthTransactions.filter(t => t.type === 'expense');
    const m_amounts = monthExpenses.map(t => Number(t.amount) || 0);
    const m_mean = average(m_amounts);
    const m_std = standardDeviation(m_amounts);
    const m_threshold = m_mean + 1.5 * m_std;
    const stableExpenses = monthExpenses.filter(t => (Number(t.amount) || 0) <= m_threshold);

    // Fallback to current monthly expenses if data is too thin
    const stableMonthlySpend = stableExpenses.length >= 3
        ? average(stableExpenses.map(t => Number(t.amount) || 0)) * 30
        : (expenses || profile.fixed_expenses || 0);

    const monthlyCapacity = income - (profile.fixed_expenses || 0) - stableMonthlySpend;
    const remainingToSave = targetGoal - currentSaved;
    let monthsRemaining = null;
    if (remainingToSave > 0 && monthlyCapacity > 0) {
        monthsRemaining = Math.ceil(remainingToSave / monthlyCapacity);
    }

    // 4. Discipline Score (Deviation Variance Model)
    // Compares actual spending behavior against budgeted limits and consistency.
    const budget = profile.monthly_budget || 1000;

    // Total budget deviation
    const budgetDeviation = safeDivide(Math.abs(expenses - budget), budget, 0);

    // Variance check across major categories (if data exists)
    const impulseCategories = ['Shopping', 'Other', 'Entertainment'];
    const impulseTotal = currentMonthTransactions
        .filter(t => t.type === 'expense' && impulseCategories.includes(t.category || ""))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const impulseRatio = safeDivide(impulseTotal, expenses || 1, 0);

    // Composite Discipline: 100 - (Deviation * 100) - (Impulse Penalty)
    let discipline = 100 - (budgetDeviation * 50) - (impulseRatio * 50);

    // Logistical stabilization for small samples
    if (currentMonthTransactions.length < 5) {
        discipline = normalize(currentMonthTransactions.length, 0, 5, 50, discipline);
    }

    // Adjustments
    if (netBalance < 0) discipline = Math.min(75, discipline);
    if ((profile.overdraft_count || 0) >= 3) discipline -= 10;
    // Streak bonus could be implemented if we had history

    discipline = Math.max(0, Math.min(100, discipline));

    // Discipline Classification
    const isDisciplineLearning = currentMonthTransactions.length < 5;
    let disciplineLabel: VitalityMetrics['disciplineLabel'] = 'Unstable';

    if (isDisciplineLearning) {
        disciplineLabel = 'Learning';
    } else if (discipline < 40) {
        disciplineLabel = 'Critical';
    } else if (discipline < 60) {
        disciplineLabel = 'Unstable';
    } else if (discipline < 70) {
        disciplineLabel = 'Recovering';
    } else if (discipline < 75) {
        disciplineLabel = 'Controlled';
    } else if (discipline < 90) {
        disciplineLabel = 'Strong';
    } else {
        disciplineLabel = 'Elite';
    }

    // 5. Composite Vitality Score
    // 0.35 * Momentum + 0.25 * Efficiency + 0.20 * Discipline + 0.20 * Savings Progress
    // Momentum in this scale is 0-100 (where 50 is neutral). We want to center it.
    const centeredMomentum = momentum;
    let vitalityScore = (0.35 * centeredMomentum) + (0.25 * efficiency) + (0.20 * discipline) + (0.20 * progressPercentage);

    // Data Scarcity Protection (Learning Mode)
    const isDataScarce = transactions.length < 5;
    if (isDataScarce) {
        // If no transactions, start at a neutral 50. If some data, blend it.
        const blendFactor = transactions.length / 5;
        vitalityScore = (vitalityScore * blendFactor) + (50 * (1 - blendFactor));
    }

    // Normalize to 0-100
    vitalityScore = Math.max(0, Math.min(100, vitalityScore));

    // 6. Contradiction Prevention Layer (Surgical Caps)
    if (expenses > income) {
        momentum = Math.min(40, momentum);
        if (momentum === 40 && momentum > 0) insights.push("Momentum capped due to negative cashflow.");
    }
    if (currentSaved === 0) {
        efficiency = Math.min(25, efficiency);
    }

    // Health Classification
    let classification: VitalityMetrics['classification'] = isDataScarce ? 'Learning' : 'Unstable';
    if (isDataScarce) {
        classification = 'Learning';
    } else if (vitalityScore < 40) {
        classification = 'Critical';
    } else if (vitalityScore < 60) {
        classification = 'Unstable';
    } else if (vitalityScore < 75) {
        classification = 'Recovering';
    } else if (vitalityScore < 90) {
        classification = 'Healthy';
    } else {
        classification = 'Elite';
    }

    // Insights
    if (isDataScarce) {
        insights.push("Learning Mode: Need more transaction data for high-confidence diagnostics.");
    }
    if (impulseRatio > 0.3) insights.push("High impulse spending detected, reducing discipline score.");
    if (currentMonthTransactions.length > 5 && currentNetFlow > previousNetFlow) {
        const diff = previousNetFlow > 0 ? ((currentNetFlow - previousNetFlow) / previousNetFlow) * 100 : 0;
        if (diff > 10) insights.push(`Savings rate increased ${Math.round(diff)}% this month.`);
    }
    if (netBalance < 0) insights.push("Negative liquidity is suppressing momentum.");

    // Projection Suppression for Cold Starts
    const wealthProjections = (targetGoal === 0 && !isDataScarce) ? {
        monthlyCapacity: Math.round(monthlyCapacity),
        potential12MonthWealth: Math.round(monthlyCapacity * 12)
    } : undefined;

    return {
        momentum: Math.round(momentum),
        efficiency: Math.round(efficiency),
        savingsProgress: {
            current: currentSaved,
            target: targetGoal,
            percentage: Math.round(progressPercentage),
            monthsRemaining
        },
        wealthProjections,
        disciplineScore: Math.round(discipline),
        disciplineLabel,
        vitalityScore: Math.round(vitalityScore),
        classification,
        insights
    };
}
