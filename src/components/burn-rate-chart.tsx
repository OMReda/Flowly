"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";
import { Transaction } from "@/lib/types";

interface BurnRateChartProps {
    transactions?: Transaction[];
    budget?: number;
    days?: number;
}

export function BurnRateChart({ transactions = [], budget = 1000, days = 30 }: BurnRateChartProps) {
    const dailyData = getDailySpending(transactions, days);

    if (dailyData.length === 0 || dailyData.every(d => d.amount === 0 && d.accumulated === 0)) {
        return (
            <motion.div
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-zinc-50/20 dark:bg-zinc-900/10 rounded-[32px] border border-zinc-100/50 dark:border-zinc-800/30 group"
            >
                {/* 3D Perspective Grid (Data Corridor) */}
                <div className="absolute inset-0 [perspective:800px] pointer-events-none">
                    <motion.div
                        initial={{ rotateX: 60, y: -50 }}
                        className="absolute inset-0 w-full h-[200%] origin-top opacity-[0.05] dark:opacity-[0.1]"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, currentColor 1px, transparent 1px),
                                linear-gradient(to bottom, currentColor 1px, transparent 1px)
                            `,
                            backgroundSize: '40px 40px',
                        }}
                    >
                        {/* Scanning Laser Line */}
                        <motion.div
                            animate={{ y: ['0%', '100%'] }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-700 group-hover:via-emerald-400 group-hover:h-2"
                        />
                    </motion.div>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="relative">
                        <motion.div
                            animate={{
                                opacity: [0.6, 0.9, 0.6],
                                scale: [0.98, 1.02, 0.98],
                                boxShadow: [
                                    "0 0 0px rgba(16,185,129,0)",
                                    "0 0 20px rgba(16,185,129,0.15)",
                                    "0 0 0px rgba(16,185,129,0)"
                                ]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="w-20 h-20 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-2xl flex items-center justify-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent" />
                            <svg className="w-8 h-8 text-emerald-500/60 dark:text-emerald-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M7 12l3-3 3 3 4-4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                        </motion.div>
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-base font-serif text-zinc-600 dark:text-zinc-300 italic">
                            Awaiting financial input…
                        </p>
                        <p className="text-[9px] font-bold tracking-[0.4em] text-zinc-400 dark:text-zinc-500 uppercase">
                            Architecture for growth is ready
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    const data = dailyData;


    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="w-full h-full relative"
        >
            {/* Living Background (Architecture) */}
            <div className="absolute inset-0 [perspective:800px] pointer-events-none opacity-[0.03] dark:opacity-[0.07]">
                <div
                    className="absolute inset-0 w-full h-[200%] origin-top"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, currentColor 1px, transparent 1px),
                            linear-gradient(to bottom, currentColor 1px, transparent 1px)
                        `,
                        backgroundSize: '80px 80px',
                        transform: 'rotateX(60deg) translateY(-50px)'
                    }}
                >
                    <motion.div
                        animate={{ y: ['0%', '100%'] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    />
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#71717A' }}
                        tickFormatter={(val) => val.slice(8)} // Show DD only
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#71717A' }}
                        tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #F4F4F5',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                            fontSize: '11px',
                            fontFamily: 'inherit'
                        }}
                        labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                        formatter={(value: number | undefined, name: string | undefined) => [
                            `$${(value || 0).toFixed(2)}`,
                            name === 'amount' ? 'Daily Spending' : 'Accumulated Spending'
                        ]}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        height={36}
                        iconType="circle"
                        formatter={(value) => (
                            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                                {value === 'amount' ? 'Daily' : 'Accumulated'}
                            </span>
                        )}
                    />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.1}
                        strokeWidth={2}
                        name="amount"
                        animationDuration={1500}
                        animationEasing="ease-in-out"
                    />
                    <Area
                        type="monotone"
                        dataKey="accumulated"
                        stroke="#F43F5E"
                        fill="none"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="accumulated"
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
}

function getDailySpending(transactions: Transaction[], daysLimit: number = 30) {
    const today = new Date();
    const result = [];
    let accumulated = 0;

    // Use a fixed range for better comparison or dynamic if preferred
    // Here we use the last N days
    const dailyMap = new Map<string, number>();
    transactions
        .filter(t => t.type === 'expense' && !t.deleted_at)
        .forEach(t => {
            if (t.date) {
                dailyMap.set(t.date, (dailyMap.get(t.date) || 0) + t.amount);
            }
        });

    for (let i = daysLimit - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const amount = dailyMap.get(dateStr) || 0;
        accumulated += amount;
        result.push({
            date: dateStr,
            amount,
            accumulated
        });
    }

    return result;
}

function generateEmptyData() {
    return [
        { date: '2024-01-01', amount: 0, accumulated: 0 },
        { date: '2024-01-02', amount: 0, accumulated: 0 },
    ];
}
