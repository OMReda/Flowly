"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { PieChart as PieChartIcon } from "lucide-react";

interface CategoryData {
    name: string;
    value: number;
    color: string;
}

export function CategoryDistChart({ data }: { data: CategoryData[] }) {
    // Filter out very small segments for cleaner UI
    const chartData = (data || []).filter(d => d.value > 0);

    if (chartData.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center min-h-[220px] relative bg-zinc-50/20 dark:bg-zinc-900/10 rounded-[32px] border border-zinc-100/50 dark:border-zinc-800/30 overflow-hidden group">
                {/* Background Sweep Effect */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{
                            rotate: [0, 360],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-tr from-zinc-200/20 via-transparent to-transparent dark:from-zinc-800/20 rounded-full blur-3xl opacity-30"
                    />
                </div>

                {/* The "Ghost Donut" Ring */}
                <div className="relative w-28 h-28 mb-6">
                    <motion.div
                        animate={{
                            rotate: [0, 360],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-[10px] border-zinc-200/40 dark:border-zinc-800/40 border-t-zinc-400 dark:border-t-zinc-600"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <PieChartIcon className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
                        </motion.div>
                    </div>

                    {/* Floating Data Nodes */}
                    {[45, 180, 270].map((angle, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.8, 0.3]
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                            className="absolute w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 blur-[1px]"
                            style={{
                                top: `${50 + 45 * Math.sin(angle * Math.PI / 180)}%`,
                                left: `${50 + 45 * Math.cos(angle * Math.PI / 180)}%`,
                            }}
                        />
                    ))}
                </div>

                <div className="text-center space-y-2 relative z-10">
                    <p className="text-base font-serif text-zinc-600 dark:text-zinc-300 italic">No allocation detected</p>
                    <div className="flex flex-col items-center gap-2">
                        <span className="h-px w-8 bg-zinc-200 dark:bg-zinc-800" />
                        <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.4em]">Structure awaits input</p>
                    </div>
                </div>
            </div>
        );
    }

    // Special handling for single category (100%) to avoid broken donut visual
    const isSingleCategory = chartData.length === 1;

    return (
        <div className="h-full w-full flex flex-col">
            {/* Header removed, handled by parent layout */}

            <div className="flex-1 min-h-[180px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius={isSingleCategory ? "0%" : "65%"} // Full pie for single category
                            outerRadius="85%"
                            paddingAngle={isSingleCategory ? 0 : 4}
                            dataKey="value"
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    className="stroke-zinc-50 dark:stroke-zinc-950 stroke-2"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number | undefined) => [`$${(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, '']}
                            contentStyle={{
                                backgroundColor: 'var(--background)',
                                borderColor: 'var(--border)',
                                borderRadius: '12px',
                                fontSize: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                padding: '8px 12px'
                            }}
                            itemStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
                            cursor={false}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Stats (Hide for single category to avoid clutter over the pie) */}
                {!isSingleCategory && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest mb-0.5">Top</span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50 max-w-[80px] truncate text-center">
                            {chartData[0]?.name}
                        </span>
                        <span className="text-[9px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full mt-1">
                            {((chartData[0]?.value / chartData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Compact Legend */}
            <div className="grid grid-cols-1 gap-1.5 mt-2">
                {chartData.slice(0, 3).map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs group">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-zinc-600 dark:text-zinc-400 font-medium truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                                {item.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-zinc-900 dark:text-zinc-50 font-semibold">
                                {((item.value / chartData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>
                ))}
                {chartData.length > 3 && (
                    <div className="text-[10px] text-center text-zinc-400 mt-1 italic">
                        + {chartData.length - 3} other categories
                    </div>
                )}
            </div>
        </div>
    );
}
