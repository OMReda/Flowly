"use client";

import { motion } from "framer-motion";
import { LogOut, User as UserIcon, DollarSign, Wallet, CreditCard, ArrowRight, Settings, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { CommandBar } from "@/components/command-bar";
import { BurnRateChart } from "@/components/burn-rate-chart";
import { RoastAndBoast } from "@/components/roast-and-boast";
import { MLInsights } from "@/components/ml-insights";
import { BudgetAlert } from "@/components/budget-alert";
import { TransactionList } from "@/components/transaction-list";
import Link from "next/link";
import { handleSignOut } from "@/app/actions/auth";
import { OnboardingModal } from "@/components/onboarding-modal";
import { SettingsModal } from "@/components/settings-modal";
import { CSVImportModal } from "@/components/csv-import-modal";
import { CategoryDistChart } from "@/components/category-dist-chart";
import { NumberFlow } from "@/components/ui/number-flow";
import { useState, useEffect } from "react";

import { Transaction, UserProfile } from "@/lib/types";
import { DeterministicInsights } from "@/lib/deterministic-logic";
import { Session } from "next-auth";

interface DashboardLayoutProps {
    session: Session;
    allTransactions: Transaction[];
    totalSpent: number;
    budget: number;
    remaining: number;
    hasTransactions: boolean;
    hasAiKey?: boolean;
    userProfile: UserProfile | null;
    insights?: DeterministicInsights;
    deltas?: { spent: number | null; net: number | null; volume: number | null };
    categoryData?: { name: string; value: number; color: string }[];
    totalCount: number;
}

export function DashboardLayout({
    session,
    allTransactions,
    totalSpent,
    budget,
    remaining,
    hasTransactions,
    hasAiKey = false,
    userProfile,
    insights,
    deltas,
    categoryData,
    totalCount
}: DashboardLayoutProps) {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showCSVImport, setShowCSVImport] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    const [chartDays, setChartDays] = useState(30);

    useEffect(() => {
        if (dismissed) return;

        console.log("[CLIENT] DashboardLayout: checking onboarding status", {
            hasProfile: !!userProfile,
            completed: userProfile?.onboarding_completed
        });
        if (userProfile && userProfile.onboarding_completed === false) {
            setShowOnboarding(true);
        }
    }, [userProfile?.id, userProfile?.onboarding_completed, dismissed]);

    const formatDelta = (val: number | undefined | null, inverse = false) => {
        if (val === undefined || val === null || isNaN(val)) return null;
        const isPos = val > 0;
        const isNeut = val === 0;

        // Determination of "Good" vs "Bad" trend
        // For Spent (inverse=true): Down is Green, Up is Red
        // For Balance (inverse=false): Up is Green, Down is Red
        const isGood = inverse ? !isPos : isPos;

        const colorClass = isNeut
            ? 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800'
            : (isGood ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-rose-600 dark:text-rose-400 bg-rose-500/10');

        const Icon = isNeut ? Minus : (isPos ? TrendingUp : TrendingDown);

        return (
            <div className="flex flex-col items-start ml-3 min-w-[70px] h-[32px]">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${colorClass} transition-all duration-300 group-hover:bg-opacity-20`}>
                    <Icon className="w-2.5 h-2.5" />
                    <span className="text-[10px] font-bold">
                        {isNeut ? '—' : (isPos ? '+' : '')}{Math.abs(val).toFixed(1)}%
                    </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 mt-0.5">
                    <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-tighter whitespace-nowrap">
                        vs last month
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 transition-colors duration-500">
            <div className="p-4 sm:p-8 lg:p-12 max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 pb-8 border-b border-zinc-100 dark:border-zinc-900"
                >
                    <div className="flex items-center gap-6">
                        <Logo className="w-12 h-12" />
                        <div>
                            <h1 className="text-4xl font-serif tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
                            <p className="text-[10px] tracking-[0.2em] font-bold text-zinc-400 uppercase mt-1">
                                Refined Financial Control
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                    Last synced: {mounted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                                </p>
                            </div>
                            {/* Data Confidence Indicator */}
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 w-fit mt-2 sm:mt-0">
                                <span className={`w-1 h-1 rounded-full ${insights?.confidence === 'high' ? 'bg-emerald-500' : (insights?.confidence === 'medium' ? 'bg-amber-500' : 'bg-rose-500')}`} />
                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                                    Confidence: {insights?.confidence || 'Low'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-serif">{session?.user?.name || 'User'}</p>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{session?.user?.email}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                                <UserIcon className="w-4 h-4 text-zinc-400" />
                            </div>
                        </div>
                        <Button onClick={() => setShowSettings(true)} variant="ghost" size="icon" className="group rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800">
                            <Settings className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors" />
                        </Button>
                        <form action={handleSignOut}>
                            <Button variant="ghost" size="icon" className="group rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20">
                                <LogOut className="w-4 h-4 text-zinc-400 group-hover:text-rose-500 transition-colors" />
                            </Button>
                        </form>
                    </div>
                </motion.header>

                {/* Command Bar */}
                <motion.section
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative z-10"
                >
                    <div className="pl-4 border-l-2 border-emerald-500/30 mb-4">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">
                            {hasAiKey ? "Transaction Ledger" : "Standard Ledger"}
                        </p>
                    </div>
                    <CommandBar hasAiKey={hasAiKey} onImportCSV={() => setShowCSVImport(true)} />
                </motion.section>

                <div className="space-y-12">

                    {/* KPI Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {[
                            { label: 'Total Spent', value: totalSpent, sub: 'Outflow this Month', icon: DollarSign, color: 'emerald', delta: deltas?.spent, inverse: true },
                            { label: 'Net Balance', value: remaining, sub: 'Total Liquidity incl. Starting', icon: Wallet, color: remaining < 0 ? 'rose' : 'zinc', delta: deltas?.net, inverse: false },
                            { label: 'Total Records', value: totalCount, sub: `Active Ledger Items`, icon: CreditCard, color: 'zinc', delta: deltas?.volume, inverse: false }
                        ].map((kpi, i) => (
                            <motion.div
                                key={kpi.label}
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br transition-all duration-700 opacity-0 group-hover:opacity-20 -mr-16 -mt-16 blur-3xl ${kpi.color === 'emerald' ? 'from-emerald-500' : 'from-rose-500'}`} />
                                <div className="flex justify-between items-start mb-6">
                                    <p className="text-[10px] font-bold tracking-[0.3em] text-zinc-400 uppercase">{kpi.label}</p>
                                    <kpi.icon className="w-4 h-4 text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className={`text-4xl font-serif tracking-tight ${kpi.color === 'rose' ? 'text-rose-500 font-medium' : 'text-zinc-900 dark:text-zinc-50'}`}>
                                        <div className="flex items-baseline gap-2">
                                            <NumberFlow
                                                value={kpi.value}
                                                prefix={kpi.label === 'Total Records' ? '' : '$'}
                                                decimals={kpi.label === 'Total Records' ? 0 : 2}
                                            />
                                            {formatDelta(kpi.delta, kpi.inverse)}
                                        </div>
                                    </h3>
                                    <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">{kpi.sub}</p>
                                </div>
                                <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-zinc-100 dark:via-zinc-800 to-transparent group-hover:via-emerald-500/30 transition-all duration-700" />
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                                    Overview of your recent financial activity
                                </p>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-8"
                            >
                                {/* Financial Trajectory (2/3 width) */}
                                <div className="md:col-span-2 flex flex-col h-full bg-white dark:bg-zinc-950 rounded-[24px] border border-zinc-100 dark:border-zinc-900 shadow-sm p-6 relative overflow-hidden group">
                                    <div className="flex items-center justify-between mb-6 z-10 relative">
                                        <div className="flex items-center gap-4">
                                            <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                                            <div>
                                                <h3 className="text-lg font-serif tracking-tight text-zinc-900 dark:text-zinc-50">Financial Trajectory</h3>
                                                <p className="text-[10px] text-zinc-400 font-medium">Burn Rate & Projection</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-0.5 rounded-full">
                                            {[7, 30, 90].map((d) => (
                                                <button
                                                    key={d}
                                                    onClick={() => setChartDays(d)}
                                                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${chartDays === d
                                                        ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm'
                                                        : 'text-zinc-400 hover:text-zinc-600'}`}
                                                >
                                                    {d}D
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-h-[300px] w-full relative z-10">
                                        <BurnRateChart transactions={allTransactions} budget={budget} days={chartDays} />
                                    </div>
                                    {/* Subtle background decoration */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                </div>

                                {/* Category Distribution (1/3 width) */}
                                <div className="md:col-span-1 h-full">
                                    <div className="h-full bg-white dark:bg-zinc-950 rounded-[24px] border border-zinc-100 dark:border-zinc-900 shadow-sm relative overflow-hidden group hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors flex flex-col p-6">
                                        <div className="flex items-center justify-between mb-6 z-10 relative">
                                            <div className="flex items-center gap-4">
                                                <div className="h-4 w-1 bg-indigo-500 rounded-full" />
                                                <div>
                                                    <h3 className="text-lg font-serif tracking-tight text-zinc-900 dark:text-zinc-50">Spending Mix</h3>
                                                    <p className="text-[10px] text-zinc-400 font-medium">Expense Breakdown</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20" />
                                        <div className="flex-1 w-full relative z-10 min-h-[300px]">
                                            <CategoryDistChart data={categoryData || []} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="space-y-12"
                            >
                                <RoastAndBoast transactions={allTransactions} budget={budget} />
                                <MLInsights data={insights || null} />
                                <BudgetAlert totalSpent={totalSpent} budget={budget} />
                            </motion.div>
                        </div>

                        {/* Sidebar List */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-8"
                        >
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <h3 className="text-xl font-serif">Recent Journal</h3>
                                    <div className="h-px bg-zinc-100 dark:bg-zinc-900 flex-grow" />
                                </div>
                                <div className="relative group">
                                    <div className="absolute -inset-4 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="relative">
                                        <TransactionList transactions={allTransactions.slice(0, 10)} hasAiKey={hasAiKey} />
                                    </div>
                                </div>

                                <motion.div
                                    whileHover={{ x: 4 }}
                                    className="mt-8 pt-4 border-t border-zinc-50 dark:border-zinc-900"
                                >
                                    <Link href="/archive" className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 hover:text-emerald-500 uppercase flex items-center gap-2 transition-colors">
                                        View full archive <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <OnboardingModal
                isOpen={showOnboarding}
                onClose={() => {
                    setShowOnboarding(false);
                    setDismissed(true);
                }}
            />
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                userProfile={userProfile}
            />
            <CSVImportModal
                isOpen={showCSVImport}
                onClose={() => setShowCSVImport(false)}
            />
        </div>
    );
}
