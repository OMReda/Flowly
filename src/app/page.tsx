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
    const profile = db.query.profiles.findFirst({
      where: eq(profiles.id, userId)
    }) as unknown as UserProfile | undefined;

    userProfile = profile || null;

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

  // Deltas
  const calculateDelta = (currentValue: number, previousValue: number) => {
    if (previousValue === 0) return currentValue === 0 ? 0 : (currentValue > 0 ? 100 : -100);
    return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
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

  // Category Data
  const categoryMap: Record<string, number> = {};
  currentMonthExpenses.forEach(t => {
    const val = Number(t.amount);
    if (val > 0) {
      const cat = t.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + val;
    }
  });

  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value, color: '#10B981' }))
    .sort((a, b) => b.value - a.value)
    .map((item, index) => {
      const colors = ['#10B981', '#3B82F6', '#F59E0B', '#F43F5E', '#8B5CF6', '#71717A'];
      return { ...item, color: colors[index % colors.length] };
    });

  const insightsList = generateInsights(expenses, budget, currentMonthSpent, expenses.length);
  const { score, reasoning: scoreReasoning } = calculateFlowlyScore(currentMonthSpent, budget, anomalies, expenses.length);

  const insightsData = {
    generated_at: new Date().toISOString(),
    status: (expenses.length >= 10 ? 'intelligent' : (expenses.length >= 5 ? 'baseline' : 'learning')) as 'intelligent' | 'baseline' | 'learning',
    forecast_next_month: forecast.total,
    forecast_reasoning: forecast.reasoning,
    confidence: forecast.confidence,
    anomalies,
    flowly_score: score,
    score_reasoning: scoreReasoning,
    data_points: expenses.length,
    insights: insightsList,
    is_low_data: expenses.length < 5
  };

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
      deltas={deltas}
      categoryData={categoryData}
    />
  );
}
