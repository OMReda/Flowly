"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User as UserIcon, DollarSign, Wallet, CreditCard, ArrowRight, Settings, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandBar } from "@/components/command-bar";
import { BurnRateChart } from "@/components/burn-rate-chart";
import { RoastAndBoast } from "@/components/roast-and-boast";
import { MLInsights } from "@/components/ml-insights";
import { BudgetAlert } from "@/components/budget-alert";
import { TransactionList } from "@/components/transaction-list";
import Link from "next/link";
import { handleSignOut } from "@/app/actions/auth";
import { OnboardingModal } from "@/components/onboarding-modal";
import { SystemPulse } from "@/components/system-pulse";
import { SettingsModal } from "@/components/settings-modal";
import { CSVImportModal } from "@/components/csv-import-modal";
import { CategoryDistChart } from "@/components/category-dist-chart";
import { NumberFlow } from "@/components/ui/number-flow";
import { useState, useEffect } from "react";

import { Transaction, UserProfile } from "@/lib/types";
import { DeterministicInsights } from "@/lib/deterministic-logic";
import { VitalityMetrics } from "@/lib/vitality-engine";
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
    vitality?: VitalityMetrics;
    deltas?: { spent: number | null; net: number | null; volume: number | null };
    categoryData?: { name: string; value: number; color: string; percentage?: number }[];
    incomeCategoryData?: { name: string; value: number; color: string; percentage?: number }[];
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
    vitality,
    deltas,
    categoryData,
    incomeCategoryData,
    totalCount
}: DashboardLayoutProps) {
    const [showOnboarding, setShowOnboarding] = useState(
        userProfile?.onboarding_completed !== true
    );
    const [dismissed, setDismissed] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showCSVImport, setShowCSVImport] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [breakdownType, setBreakdownType] = useState<'expense' | 'income'>('expense');

    useEffect(() => {
        setMounted(true);
    }, []);
    const [chartDays, setChartDays] = useState(30);

    useEffect(() => {
        if (dismissed) return;

        // Ensure modal shows if profile updates and it's still not completed
        if (userProfile?.onboarding_completed !== true) {
            setShowOnboarding(true);
        }
    }, [userProfile?.id, userProfile?.onboarding_completed, dismissed]);

    const formatDelta = (val: number | undefined | null, inverse = false) => {
        // If null, it's the "First recorded month" scenario
        if (val === null) {
            return (
                <div className="flex items-baseline h-[32px]">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] whitespace-nowrap opacity-40">
                        First month
                    </span>
                </div>
            );
        }

        if (val === undefined || isNaN(val)) return null;
        const isPos = val > 0;
        const isNeut = val === 0;

        // Determination of "Good" vs "Bad" trend
        const isGood = inverse ? !isPos : isPos;

        const colorClass = isNeut
            ? 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800'
            : (isGood ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-rose-600 dark:text-rose-400 bg-rose-500/10');

        const Icon = isNeut ? Minus : (isPos ? TrendingUp : TrendingDown);

        return (
            <div className="flex flex-col items-start ml-3 min-w-[70px] h-[32px] group">
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
        <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100" data-developer="OMReda">
            <AnimatePresence>
                {mounted && showOnboarding && (
                    <OnboardingModal
                        key="onboarding-modal"
                        isOpen={showOnboarding}
                        onClose={() => {
                            setShowOnboarding(false);
                            setDismissed(true);
                        }}
                    />
                )}
            </AnimatePresence>

            <div className="p-4 sm:p-8 lg:p-12 max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 pb-8 border-b border-zinc-200 dark:border-zinc-800"
                >
                    <div className="flex items-center gap-6">
                        <Logo className="w-12 h-12" />
                        <div>
                            <h1 className="text-4xl font-serif tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
                            <p className="text-[10px] tracking-[0.2em] font-bold text-zinc-400 uppercase mt-1">
                                Financial Architecture
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                    Live Sync Active
                                </p>
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
                        <ThemeToggle />
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
                    <div className="relative pl-6 mb-4">
                        <div className="absolute top-1 bottom-1 left-0 w-1 bg-emerald-500/50 rounded-full" style={{ boxShadow: '0 0 6px rgb(16 185 129 / 0.25)' }} />
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">
                            {hasAiKey ? "Transaction Ledger" : "Standard Ledger"}
                        </p>
                    </div>
                    <CommandBar hasAiKey={hasAiKey} onImportCSV={() => setShowCSVImport(true)} />
                </motion.section>

                <div className="space-y-16">

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
                                className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 transition-[transform,box-shadow,opacity] duration-500 group relative overflow-hidden"
                                style={{ boxShadow: 'var(--shadow-md)' }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-xl)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br transition-all duration-700 opacity-0 group-hover:opacity-20 -mr-16 -mt-16 blur-3xl ${kpi.color === 'emerald' ? 'from-emerald-500' : 'from-rose-500'}`} />
                                <div className="flex justify-between items-start mb-6">
                                    <p className="text-[10px] font-bold tracking-[0.3em] text-zinc-400 uppercase">{kpi.label}</p>
                                    <kpi.icon className="w-4 h-4 text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className={`text-4xl font-serif tracking-tight font-semibold ${kpi.color === 'rose' ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-50'}`}>
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

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
                        {/* Main Column: Insights & Intelligence */}
                        <div className="lg:col-span-8 space-y-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-12"
                            >
                                <div className="relative pl-6">
                                    <div className="absolute top-1 bottom-1 left-0 w-1 bg-emerald-500/50 rounded-full" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Core Performance</p>
                                    <h2 className="text-3xl font-serif tracking-tight text-zinc-900 dark:text-zinc-50">Trends & Allocation</h2>
                                </div>

                                {/* Priority Charts Section */}
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                        className="md:col-span-3 h-full bg-white dark:bg-zinc-950 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-8 relative overflow-hidden group shadow-sm hover:shadow-xl hover:border-emerald-500/20 transition-colors duration-500"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-8">
                                                <div>
                                                    <h3 className="text-xl font-serif tracking-tight font-semibold">Trajectory</h3>
                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Projection Engine</p>
                                                </div>
                                                <div className="flex bg-zinc-50 dark:bg-zinc-900/50 p-1 rounded-xl">
                                                    {[7, 30, 90].map((d) => (
                                                        <button
                                                            key={d}
                                                            onClick={(e) => { e.stopPropagation(); setChartDays(d); }}
                                                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${chartDays === d ? 'bg-white dark:bg-zinc-800 text-emerald-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                                                        >
                                                            {d}D
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="h-[300px] w-full">
                                                <BurnRateChart transactions={allTransactions} budget={budget} days={chartDays} />
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                        className="md:col-span-2 h-full bg-white dark:bg-zinc-950 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-8 relative overflow-hidden group shadow-sm hover:shadow-xl hover:border-emerald-500/20 transition-colors duration-500"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        <div className="relative z-10">
                                            <div className="mb-8">
                                                <h3 className="text-xl font-serif tracking-tight font-semibold">Allocation</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span onClick={(e) => { e.stopPropagation(); setBreakdownType('expense'); }} className={`text-[10px] font-bold uppercase cursor-pointer ${breakdownType === 'expense' ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400 hover:text-zinc-500'}`}>Expense</span>
                                                    <span className="text-zinc-300 dark:text-zinc-800 text-[10px]">•</span>
                                                    <span onClick={(e) => { e.stopPropagation(); setBreakdownType('income'); }} className={`text-[10px] font-bold uppercase cursor-pointer ${breakdownType === 'income' ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400 hover:text-zinc-500'}`}>Income</span>
                                                </div>
                                            </div>
                                            <div className="h-[300px] w-full">
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={breakdownType}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 1.05 }}
                                                        className="h-full w-full"
                                                    >
                                                        <CategoryDistChart data={breakdownType === 'expense' ? (categoryData || []) : (incomeCategoryData || [])} />
                                                    </motion.div>
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* AI Intelligence & Feedback */}
                                <div className="space-y-12">
                                    <div className="relative pl-6">
                                        <div className="absolute top-1 bottom-1 left-0 w-1 bg-emerald-500/50 rounded-full" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Behavioral Intelligence</p>
                                        <h2 className="text-3xl font-serif tracking-tight text-zinc-900 dark:text-zinc-50">Smart Insights</h2>
                                    </div>

                                    <div className="space-y-8">
                                        <motion.div
                                            whileHover={{ y: -3, scale: 1.002 }}
                                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                        >
                                            <RoastAndBoast transactions={allTransactions} budget={budget} />
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ y: -3, scale: 1.002 }}
                                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                        >
                                            <MLInsights data={insights || null} />
                                        </motion.div>
                                    </div>
                                </div>

                                <BudgetAlert totalSpent={totalSpent} budget={budget} />
                            </motion.div>
                        </div>

                        {/* Sidebar: Activity & Vitality */}
                        <div className="lg:col-span-4 space-y-12 h-fit lg:sticky lg:top-12">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-12"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-8 pl-4 border-l-2 border-zinc-100 dark:border-zinc-900">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-1">Activity Feed</p>
                                            <h3 className="text-xl font-serif">Recent Journal</h3>
                                        </div>
                                        <Link href="/archive" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                                            <ArrowRight className="w-4 h-4 text-zinc-400" />
                                        </Link>
                                    </div>
                                    <div className="relative group p-6 rounded-[32px] bg-zinc-50/30 dark:bg-zinc-900/20 border border-zinc-100/50 dark:border-zinc-800/50">
                                        <TransactionList transactions={allTransactions.slice(0, 12)} hasAiKey={hasAiKey} />

                                        <Link href="/archive" className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-900 text-[10px] font-black tracking-[0.2em] text-zinc-400 hover:text-emerald-500 uppercase flex items-center justify-center gap-2 transition-colors">
                                            Detailed History
                                        </Link>
                                    </div>
                                </div>

                                <SystemPulse
                                    spent={totalSpent}
                                    budget={budget}
                                    balance={remaining}
                                    vitality={vitality}
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Fixed Artist Credit & Ownership - Bottom Left */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="fixed bottom-6 left-6 z-50 flex flex-col gap-1 pointer-events-none"
            >
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                    <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-300 dark:text-zinc-700 uppercase">
                        Developed by <span className="text-zinc-400 dark:text-zinc-600">OMReda</span>
                    </p>
                </div>
                <p className="text-[8px] font-bold tracking-[0.1em] text-zinc-300/50 dark:text-zinc-700/50 uppercase">
                    Project for Sale • Proprietary Ledger
                </p>
            </motion.div >

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                userProfile={userProfile}
            />
            <CSVImportModal
                isOpen={showCSVImport}
                onClose={() => setShowCSVImport(false)}
            />
        </div >
    );
}
