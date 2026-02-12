"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Brain, AlertTriangle, TrendingUp, Info, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getInsights } from "@/app/actions/get-insights";
import { DeterministicInsights } from "@/lib/deterministic-logic";
import { motion, AnimatePresence } from "framer-motion";
import { NumberFlow } from "@/components/ui/number-flow";

export function MLInsights({ data }: { data: DeterministicInsights | null }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!data) return null;

    const getStatusLabel = (status: string, confidence?: string) => {
        const confLabel = confidence ? ` • ${confidence.toUpperCase()} CONFIDENCE` : '';
        switch (status) {
            case 'intelligent': return { label: `Pattern Recognition Active${confLabel}`, color: 'bg-emerald-500/5 text-emerald-600/70 border-emerald-500/10' };
            case 'baseline': return { label: `Basic Tracking Active${confLabel}`, color: 'bg-amber-500/5 text-amber-600/70 border-amber-500/10' };
            default: return { label: 'Calibrating • Needs more data', color: 'bg-zinc-500/5 text-zinc-500/70 border-zinc-500/10' };
        }
    };

    const statusStyle = getStatusLabel(data.status, data.confidence);

    return (
        <div className="p-8 rounded-3xl border border-indigo-200/60 dark:border-indigo-900/30 bg-indigo-50/10 dark:bg-indigo-950/5 backdrop-blur-md transition-[transform,box-shadow,opacity] duration-700" style={{ boxShadow: 'var(--shadow-md)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-xl)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-500">
                            <Brain className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] font-bold tracking-[0.3em] text-indigo-400/60 uppercase">Analysis Status</p>
                                <span className={`px-2 py-0.5 rounded-full border text-[7px] font-bold uppercase tracking-widest ${statusStyle.color}`}>
                                    {statusStyle.label}
                                </span>
                            </div>
                            <h3 className="text-xl font-serif tracking-tight font-semibold text-zinc-900 dark:text-zinc-50">Spending Analysis</h3>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="inline-flex flex-col items-end opacity-60 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1 mb-1">
                                <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Flowly Score</span>
                                <Info className="w-2.5 h-2.5 text-zinc-300" />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <NumberFlow
                                    value={data.flowly_score}
                                    className="text-2xl font-serif font-semibold text-indigo-600 dark:text-indigo-400"
                                />
                                <span className="text-[10px] text-zinc-400 font-medium">/100</span>
                            </div>
                            <p className="text-[9px] text-zinc-400 font-medium mt-1 max-w-[150px] leading-tight text-right italic">
                                {data.score_reasoning}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Forecast Section */}
                    <div className="group relative p-8 bg-white dark:bg-zinc-900/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 transition-all" style={{ boxShadow: 'var(--shadow-sm)' }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'rgb(99 102 241 / 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = ''; }}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                                    <span className="text-[10px] font-bold tracking-widest text-zinc-400/80 uppercase" title="Projected spending for the next 30 days based on recent daily average.">
                                        30-Day Expense Projection
                                    </span>
                                </div>
                                <p className="text-[10px] text-zinc-500/80 leading-snug max-w-[280px] italic">
                                    {data.forecast_reasoning}
                                </p>
                            </div>
                            <div className="text-right">
                                {data.forecast_next_month !== null ? (
                                    <NumberFlow
                                        value={data.forecast_next_month}
                                        prefix="$"
                                        decimals={2}
                                        className="text-4xl font-serif tracking-tighter text-indigo-600/80 dark:text-indigo-400/80 leading-none"
                                    />
                                ) : (
                                    <span className="text-xl font-serif tracking-tight text-zinc-400 leading-none">
                                        Insufficient Data
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="absolute top-6 bottom-6 left-0 w-1 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                    </div>

                    {/* Insights Section (Causality & Recovery) */}
                    {data.insights && data.insights.length > 0 && (
                        <div className="space-y-4 relative pl-3">
                            {/* Line removed as requested */}
                            <div className="flex items-center gap-3 pl-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-500 uppercase">Actionable Insights</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {data.insights.map((insight, idx) => (
                                    <div key={idx} className={`p-4 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl border ${insight.type === 'pacing' ? 'border-indigo-100 dark:border-indigo-900/30' : 'border-zinc-100 dark:border-zinc-800'} space-y-2`}>
                                        <div className="flex items-center gap-2">
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${insight.type === 'pacing' ? 'text-indigo-500' : 'text-zinc-500'}`}>{insight.title}</p>
                                            {data.is_low_data && (
                                                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-[8px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wide">
                                                    Learning
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{insight.description}</p>

                                        {insight.type === 'pacing' && (
                                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${insight.impact.includes('above') ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                                    style={{ width: '60%' }}
                                                />
                                            </div>
                                        )}

                                        <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                                            <p className={`text-[9px] font-medium italic ${insight.type === 'pacing' && insight.impact.includes('above') ? 'text-amber-500' : 'text-emerald-500'}`}>{insight.impact}</p>
                                            {insight.action && (
                                                <p className="text-[9px] font-bold text-indigo-400 uppercase mt-1">Action: {insight.action}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Anomalies Section (One-time vs Recurrent) */}
                    {data.anomalies.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 pl-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                                <p className="text-[10px] font-bold tracking-[0.2em] text-rose-500 uppercase">Pattern Deviation Detected</p>
                            </div>
                            <div className="space-y-2">
                                {data.anomalies.slice(0, 3).map((anomaly, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl border border-zinc-100 dark:border-zinc-800 transition-colors hover:border-rose-100 dark:hover:border-rose-900/30">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                            <div>
                                                <p className="text-sm font-serif text-zinc-900/90 dark:text-zinc-50/90">{anomaly.merchant}</p>
                                                <p className="text-[9px] font-medium text-zinc-400/70 uppercase tracking-wider">
                                                    {isMounted ? new Date(anomaly.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "--"} • {anomaly.reason}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-serif font-medium text-rose-500">
                                            ${anomaly.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center pt-2">
                    <p className="text-[9px] font-bold text-zinc-300 dark:text-zinc-700 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-indigo-500" />
                        Last Updated: {isMounted ? new Date(data.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                    </p>
                    <p className="text-[9px] font-bold text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">
                        System: Flowly Deterministic v1.0
                    </p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${data.is_low_data ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`}></div>
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                {data.is_low_data ? `Learning Mode: Need ${5 - (data.data_points || 0)} more expenses` : 'Analysis Reliable'}
                            </span>
                        </div>
                        <span className="uppercase tracking-widest text-[10px] font-medium text-zinc-400">System Status</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
