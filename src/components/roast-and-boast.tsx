"use client";

import { useState, useEffect } from "react";
import { Flame, ThumbsUp, Info } from "lucide-react";

import { Transaction } from "@/lib/types";

interface RoastAndBoastProps {
    transactions: Transaction[];
    budget?: number;
}

export function RoastAndBoast({ transactions, budget = 1000 }: RoastAndBoastProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Simple logic: Calculate total spend for current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const ESSENTIAL_CATEGORIES = ['rent', 'groceries', 'health', 'education'];

    // Filter out essential spending for the purpose of roasting
    const nonEssentialMonthlySpend = transactions
        .filter(t => {
            const d = new Date(t.date || "");
            const isCurrentMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            const isExpense = t.type === 'expense';
            const isEssential = ESSENTIAL_CATEGORIES.includes(t.category?.toLowerCase() || "");
            return isCurrentMonth && isExpense && !isEssential;
        })
        .reduce((acc, t) => acc + t.amount, 0);

    const burnRate = nonEssentialMonthlySpend / budget;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = now.getDate();
    const expectedBurn = currentDay / daysInMonth;

    let type: 'roast' | 'boast' | 'empty' = 'boast';
    let message = "You're managing your lifestyle elegantly. True capital discipline.";
    let title = "Optimal Performance";

    // Logic
    if (transactions.length === 0) {
        type = 'empty';
        title = "No Behavioral Data Yet";
        message = "Add transactions to begin performance analysis.";
    } else if (burnRate > 1.0) {
        type = 'roast';
        title = "Adjustment Recommended";
        message = `You've exceeded your planned budget. Let's review your recent spending to get back on track.`;
    } else if (burnRate > expectedBurn + 0.1) {
        type = 'roast';
        title = "Adjustment Recommended";
        message = `You're spending slightly faster than the month allows. A little caution now will save you later.`;
    } else if (burnRate < expectedBurn - 0.2) {
        type = 'boast';
        title = "Optimal Performance";
        message = `Exceptional discipline. You're well under budget—great job maintaining your financial guard.`;
    } else {
        type = 'boast'; // Default to boast styling for neutral-ish state? Or maybe another state? Keeping consistent with original logic fallthrough
        title = "Optimal Performance";
        const topCategory = getTopCategory(transactions.filter(t => !ESSENTIAL_CATEGORIES.includes(t.category?.toLowerCase() || "")));
        if (topCategory) {
            message = `Most of your discretionary spending is going to ${topCategory}. Just something to keep in mind.`;
        }
    }

    const typeConfig = {
        roast: {
            bg: 'bg-orange-50/50 border-orange-200 dark:bg-orange-950/10 dark:border-orange-900/30',
            text: 'text-orange-600',
            iconBg: 'bg-orange-100 dark:bg-orange-950/30 text-orange-500',
            label: 'Budget Alert',
            Icon: Flame
        },
        boast: {
            bg: 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/30',
            text: 'text-emerald-600',
            iconBg: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500',
            label: 'On Track',
            Icon: ThumbsUp
        },
        empty: {
            bg: 'bg-zinc-50/50 border-zinc-200 dark:bg-zinc-900/10 dark:border-zinc-800',
            text: 'text-zinc-500',
            iconBg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400',
            label: 'No Data',
            Icon: Info
        }
    };

    const config = typeConfig[type];

    return (
        <div className={`p-8 rounded-3xl border transition-[transform,box-shadow,opacity] duration-700 backdrop-blur-sm ${config.bg}`} style={{ boxShadow: 'var(--shadow-md)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}>
            {!isMounted ? (
                <div className="h-24 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-200 border-t-zinc-400 animate-spin" />
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <p className={`text-[10px] font-bold tracking-[0.3em] uppercase ${config.text}`}>
                            {config.label}
                        </p>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.iconBg}`}>
                            <config.Icon className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-serif tracking-tight font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">
                            {title}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed border-l-2 border-zinc-200 dark:border-zinc-800 pl-4">
                            {message}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function getTopCategory(transactions: Transaction[]) {
    const counts: Record<string, number> = {};
    transactions.forEach(t => {
        if (t.category) {
            counts[t.category] = (counts[t.category] || 0) + Number(t.amount);
        }
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "");
}
