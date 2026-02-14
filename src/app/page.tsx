import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { transactions, profiles } from "@/db/schema";
import { desc, eq, and, isNull, gte, sql } from "drizzle-orm";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Transaction, UserProfile } from "@/lib/types";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import {
  calculateFlowlyScore,
  detectAnomalies,
  generateForecast,
  generateInsights
} from "@/lib/deterministic-logic";
import { calculateVitality } from "@/lib/vitality-engine";
import { safeDivide, clamp } from "@/lib/math-utils";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) return redirect("/login");

  const userId = session.user.id;

  // Date Calculations for Optimization
  const today = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(today.getDate() - 90);
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0];

  let recentTransactions: Transaction[] = [];
  let analysisTransactions: Transaction[] = [];
  let aggregates = { totalIncome: 0, totalExpense: 0, totalCount: 0 };
  let userProfile: UserProfile | null = null;

  try {
    // 1. Recent Transactions (for List)
    recentTransactions = db.select().from(transactions)
      .where(and(eq(transactions.user_id, userId), isNull(transactions.deleted_at)))
      .orderBy(desc(transactions.date))
      .limit(10)
      .all() as Transaction[];

    // 2. Analysis Data (Last 90 Days for Charts/AI)
    analysisTransactions = db.select().from(transactions)
      .where(
        and(
          eq(transactions.user_id, userId),
          isNull(transactions.deleted_at),
          gte(transactions.date, ninetyDaysAgoStr)
        )
      )
      .orderBy(desc(transactions.date))
      .all() as Transaction[];

    // 3. All-time Totals (Efficient SQL Aggregation)
    const agg = db.select({
      totalIncome: sql<number>`sum(case when ${transactions.type} = 'income' then ${transactions.amount} else 0 end)`,
      totalExpense: sql<number>`sum(case when ${transactions.type} = 'expense' then ${transactions.amount} else 0 end)`,
      totalCount: sql<number>`count(*)`
    })
      .from(transactions)
      .where(and(eq(transactions.user_id, userId), isNull(transactions.deleted_at)))
      .get();

    if (agg) {
      aggregates = {
        totalIncome: Number(agg.totalIncome) || 0,
        totalExpense: Number(agg.totalExpense) || 0,
        totalCount: Number(agg.totalCount) || 0
      };
    }

    // 4. User Profile
    const profileResult = db.select().from(profiles).where(eq(profiles.id, userId)).get() as UserProfile | undefined;

    userProfile = profileResult || {
      id: userId,
      onboarding_completed: false,
      monthly_budget: 1000,
    } as UserProfile;

  } catch (error) {
    console.error("Dashboard Data Fetch Error:", error);
    throw error;
  }

  const allTimeExpense = aggregates.totalExpense;
  const allTimeIncome = aggregates.totalIncome;
  const allTimeCount = aggregates.totalCount;

  const budget = Number(userProfile?.monthly_budget) || 1000;
  const startingBalance = Number(userProfile?.starting_balance) || 0;
  const currentTotalBalance = startingBalance - allTimeExpense + allTimeIncome;

  // AI & Insights Logic (Runs on 90-day window for performance)
  const expenses = analysisTransactions.filter(t => t.type === 'expense');
  const anomalies = detectAnomalies(expenses);
  const forecast = generateForecast(expenses);

  const now = new Date();
  const currentMonthStr = now.toISOString().substring(0, 7); // YYYY-MM

  const lastMonthDate = new Date();
  lastMonthDate.setMonth(now.getMonth() - 1);
  const previousMonthStr = lastMonthDate.toISOString().substring(0, 7);

  // Current Month Data
  const currentMonthExpenses = expenses.filter(t => t.date && t.date.startsWith(currentMonthStr));
  const currentMonthIncome = analysisTransactions
    .filter(t => t.type === 'income' && t.date && t.date.startsWith(currentMonthStr))
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const currentMonthSpent = currentMonthExpenses.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const currentNetForMonth = currentMonthIncome - currentMonthSpent;

  // Previous Month Data
  const prevMonthTransactions = analysisTransactions.filter(t => t.date && t.date.startsWith(previousMonthStr));
  const prevMonthSpent = prevMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const prevMonthIncome = prevMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const prevNetForMonth = prevMonthIncome - prevMonthSpent;

  // Stable Deltas: Prevents unrealistic % spikes when base is small
  const calculateDelta = (current: number, previous: number) => {
    const threshold = 50;
    if (Math.abs(previous) < threshold) {
      return current - previous; // Return absolute change for small bases
    }
    return safeDivide(current - previous, Math.abs(previous), 0) * 100;
  };

  const spendingDelta = calculateDelta(currentMonthSpent, prevMonthSpent);
  const netDelta = calculateDelta(currentNetForMonth, prevNetForMonth);

  // Volume Delta
  const currentVolume = currentMonthExpenses.length + analysisTransactions.filter(t => t.type === 'income' && t.date && t.date.startsWith(currentMonthStr)).length;
  const prevVolume = prevMonthTransactions.length;
  const volumeDelta = calculateDelta(currentVolume, prevVolume);

  const deltas = {
    spent: spendingDelta,
    net: netDelta,
    volume: volumeDelta
  };

  // Category Data (Expense)
  const categoryMap: Record<string, { value: number; count: number }> = {};
  currentMonthExpenses.forEach(t => {
    const val = Number(t.amount) || 0;
    if (val !== 0) {
      const cat = t.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { value: 0, count: 0 };
      }
      categoryMap[cat].value += val;
      categoryMap[cat].count += 1;
    }
  });

  let categoryData: { name: string; value: number; count: number; color: string; percentage?: number }[] = Object.entries(categoryMap)
    .filter(([_, data]) => data.value > 0)
    .map(([name, data]) => ({ name, value: data.value, count: data.count, color: '#10B981' }))
    .sort((a, b) => b.value - a.value);

  // Allocation Rounding Fix: Ensure percentages sum to exactly 100%
  const totalCategoryValue = categoryData.reduce((acc, cat) => acc + cat.value, 0);
  if (totalCategoryValue > 0) {
    let percentageSum = 0;
    categoryData = categoryData.map(cat => {
      const pct = Math.round((cat.value / totalCategoryValue) * 100);
      percentageSum += pct;
      return { ...cat, percentage: pct };
    });

    // Remainder redistribution to the largest category
    const remainder = 100 - percentageSum;
    if (remainder !== 0 && categoryData.length > 0) {
      categoryData[0].percentage = (categoryData[0].percentage || 0) + remainder;
    }
  }

  categoryData = categoryData.map((item, index) => {
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#F43F5E', '#8B5CF6', '#71717A'];
    return { ...item, color: colors[index % colors.length] };
  });

  // Category Data (Income)
  const incomeCategoryMap: Record<string, { value: number; count: number }> = {};
  const currentMonthIncomeList = analysisTransactions.filter(t => t.type === 'income' && t.date && t.date.startsWith(currentMonthStr));

  currentMonthIncomeList.forEach(t => {
    const val = Number(t.amount) || 0;
    if (val !== 0) {
      const cat = t.category || 'Other';
      if (!incomeCategoryMap[cat]) {
        incomeCategoryMap[cat] = { value: 0, count: 0 };
      }
      incomeCategoryMap[cat].value += val;
      incomeCategoryMap[cat].count += 1;
    }
  });

  let incomeCategoryData: { name: string; value: number; count: number; color: string; percentage?: number }[] = Object.entries(incomeCategoryMap)
    .filter(([_, data]) => data.value > 0)
    .map(([name, data]) => ({ name, value: data.value, count: data.count, color: '#10B981' }))
    .sort((a, b) => b.value - a.value);

  // Income Rounding Fix
  const totalIncomeValue = incomeCategoryData.reduce((acc, cat) => acc + cat.value, 0);
  if (totalIncomeValue > 0) {
    let incomePercentageSum = 0;
    incomeCategoryData = incomeCategoryData.map(cat => {
      const pct = Math.round((cat.value / totalIncomeValue) * 100);
      incomePercentageSum += pct;
      return { ...cat, percentage: pct };
    });

    const incomeRemainder = 100 - incomePercentageSum;
    if (incomeRemainder !== 0 && incomeCategoryData.length > 0) {
      incomeCategoryData[0].percentage = (incomeCategoryData[0].percentage || 0) + incomeRemainder;
    }
  }

  incomeCategoryData = incomeCategoryData.map((item, index) => {
    const colors = ['#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F59E0B', '#71717A'];
    return { ...item, color: colors[index % colors.length] };
  });

  const insightsList = generateInsights(expenses, budget, currentMonthSpent, expenses.length);
  const { score: rawScore, reasoning: scoreReasoning } = calculateFlowlyScore(currentMonthSpent, currentMonthIncome, budget, anomalies, expenses.length);

  // Learning Mode Blending: Smooth transitions during cold start
  const confidenceWeight = clamp(expenses.length / 20, 0, 1);
  const finalScore = Math.round(rawScore * confidenceWeight + 50 * (1 - confidenceWeight));

  const insightsData = {
    generated_at: new Date().toISOString(),
    status: (expenses.length >= 10 ? 'intelligent' : (expenses.length >= 5 ? 'baseline' : 'learning')) as 'intelligent' | 'baseline' | 'learning',
    forecast_next_month: forecast.total,
    forecast_reasoning: forecast.reasoning,
    confidence: forecast.confidence,
    anomalies,
    flowly_score: finalScore,
    score_reasoning: scoreReasoning,
    data_points: expenses.length,
    insights: insightsList,
    is_low_data: expenses.length < 5
  };

  const vitalityData = calculateVitality(
    currentNetForMonth,
    prevNetForMonth,
    currentMonthIncome,
    prevMonthIncome, // Safe acceleration baseline
    currentMonthSpent,
    userProfile,
    analysisTransactions,
    currentMonthExpenses
  );

  const isAiEnabled = userProfile?.ai_enabled !== false;
  const hasAiKey = isAiEnabled && !!(userProfile?.gemini_api_key || (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 20 && process.env.GEMINI_API_KEY !== "your-gemini-api-key"));

  return (
    <DashboardLayout
      session={session}
      allTransactions={recentTransactions}
      totalSpent={currentMonthSpent}
      budget={budget}
      totalCount={allTimeCount}
      remaining={currentTotalBalance}
      hasTransactions={recentTransactions.length > 0}
      hasAiKey={hasAiKey}
      userProfile={userProfile}
      insights={insightsData}
      vitality={vitalityData}
      deltas={deltas}
      categoryData={categoryData}
      incomeCategoryData={incomeCategoryData}
    />
  );
}
