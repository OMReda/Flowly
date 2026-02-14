"use client";

import { motion } from "framer-motion";
import { Activity, Zap, Target, TrendingUp, Plus, ShieldCheck } from "lucide-react";
import { NumberFlow } from "@/components/ui/number-flow";
import { VitalityMetrics } from "@/lib/vitality-engine";

interface SystemPulseProps {
    spent: number;
    budget: number;
    balance: number;
    vitality?: VitalityMetrics;
}

export function SystemPulse({ spent, budget, balance, vitality }: SystemPulseProps) {
    const budgetUsage = Math.min((spent / budget) * 100, 100);

    // Fallback/Legacy logic if vitality is missing
    const momentum = vitality?.momentum ?? 0;
    const efficiency = vitality?.efficiency ?? Math.max(0, 100 - (budgetUsage / 2));
    const discipline = vitality?.disciplineScore ?? 84;
    const disciplineLabel = vitality?.disciplineLabel ?? 'Controlled';
    const classification = vitality?.classification ?? 'Baseline';
    const vitalityScore = vitality?.vitalityScore ?? 50;
    const progress = vitality?.savingsProgress ?? { percentage: 0, current: 0, target: 0, monthsRemaining: null };
    const projections = vitality?.wealthProjections;

    return (
        <div className="space-y-6">
            {/* The Pulse Core */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-zinc-200 dark:bg-emerald-500/10 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="relative p-10 rounded-[40px] bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-xl hover:shadow-2xl hover:border-emerald-500/20 transition-all duration-500"
                >

                    {/* Background Soft Glow */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className={`absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-[120px] opacity-[0.03] dark:opacity-[0.08] ${classification === 'Critical' ? 'bg-rose-500' : 'bg-emerald-500'
                            }`} />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-8 right-8">
                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${classification === 'Critical' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                            classification === 'Healthy' || classification === 'Elite' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                            }`}>
                            {classification}
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
                            {/* The Minimalist Gauge */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle
                                    cx="80" cy="80" r="76"
                                    className="stroke-zinc-50 dark:stroke-zinc-900"
                                    strokeWidth="6" fill="none"
                                />
                                <motion.circle
                                    cx="80" cy="80" r="76"
                                    fill="none"
                                    strokeWidth="6"
                                    strokeDasharray={2 * Math.PI * 76}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 76 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 76 * (1 - vitalityScore / 100) }}
                                    transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                                    strokeLinecap="round"
                                    className={classification === 'Critical' ? 'stroke-rose-500' : 'stroke-emerald-500'}
                                />
                            </svg>

                            {/* Center Data Unit: Sharp & Modern */}
                            <div className="relative flex flex-col items-center justify-center">
                                <div className="flex items-baseline gap-0.5">
                                    <NumberFlow
                                        value={vitalityScore}
                                        decimals={0}
                                        className="text-6xl font-black text-zinc-900 dark:text-white tracking-tighter"
                                    />
                                    <span className="text-sm font-bold text-zinc-300 dark:text-zinc-600 uppercase">/100</span>
                                </div>
                                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">Score</span>
                            </div>
                        </div>

                        <div className="space-y-1 mb-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400/80">Overall Health</p>
                            <h3 className="text-3xl font-serif tracking-tight text-zinc-900 dark:text-zinc-50">System Vitality</h3>
                        </div>

                        {/* Momentum & Efficiency: Ultra Clean */}
                        <div className="grid grid-cols-2 gap-12 w-full border-t border-zinc-50 dark:border-zinc-900/50 pt-8">
                            <div className="text-left space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Momentum</p>
                                <div className="flex items-center gap-1.5">
                                    <NumberFlow
                                        value={momentum}
                                        decimals={0}
                                        prefix={momentum >= 0 ? "+" : ""}
                                        suffix="%"
                                        className={`text-2xl font-bold ${momentum < 0 ? 'text-rose-500' : 'text-emerald-500'}`}
                                    />
                                    {momentum !== 0 && (
                                        <TrendingUp className={`w-3.5 h-3.5 ${momentum < 0 ? 'text-rose-500 rotate-180' : 'text-emerald-500'}`} />
                                    )}
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Efficiency</p>
                                <div className="flex items-center justify-end gap-1">
                                    <NumberFlow value={efficiency} decimals={0} suffix="%" className="text-2xl font-bold text-zinc-900 dark:text-zinc-50" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Compact Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
                <motion.div
                    whileHover={{ y: -2, scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                    className="p-5 rounded-2xl bg-zinc-50/50 dark:bg-white/[0.02] border border-zinc-100 dark:border-zinc-800/50 group backdrop-blur-sm"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shrink-0">
                            <Target className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <div className={`text-xs font-black tabular-nums ${!projections ? 'text-zinc-400' :
                            (projections?.potential12MonthWealth ?? 0) < 0 ? 'text-rose-500' : 'text-emerald-500'
                            }`}>
                            {progress.target > 0 ? `${progress.percentage}%` :
                                !projections ? "—" :
                                    `$${(projections?.potential12MonthWealth ?? 0).toLocaleString()}`}
                        </div>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                            {progress.target > 0 ? "Savings Goal" : "12Mo Forecast"}
                        </p>
                        <h4 className="text-sm font-serif font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                            {progress.target > 0 ? `$${progress.target.toLocaleString()}` :
                                !projections ? "Insufficient Data" : "Projection"}
                        </h4>
                    </div>
                    {progress.target > 0 && (
                        <div className="w-full h-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden mt-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress.percentage}%` }}
                                className="h-full bg-emerald-500"
                            />
                        </div>
                    )}
                </motion.div>

                <motion.div
                    whileHover={{ y: -2, scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                    className="p-5 rounded-2xl bg-zinc-50/50 dark:bg-white/[0.02] border border-zinc-100 dark:border-zinc-800/50 group backdrop-blur-sm"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${disciplineLabel === 'Critical' ? 'bg-rose-500/10 text-rose-500' :
                            disciplineLabel === 'Unstable' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-emerald-500/10 text-emerald-500'
                            }`}>
                            {disciplineLabel}
                        </span>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                            Spending Discipline
                        </p>
                        <h4 className="text-sm font-serif font-semibold text-zinc-900 dark:text-zinc-50">
                            Behavior Profile
                        </h4>
                    </div>
                    <div className="flex items-center gap-1 mt-3">
                        <div className="flex-1 h-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${disciplineLabel === 'Critical' ? 'bg-rose-500' :
                                    disciplineLabel === 'Unstable' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${discipline}%` }}
                            />
                        </div>
                        <span className="text-[8px] font-bold text-zinc-400 tabular-nums">{discipline}</span>
                    </div>
                </motion.div>
            </div>
        </div >
    );
}
