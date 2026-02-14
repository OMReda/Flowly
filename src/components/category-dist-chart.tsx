"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart as PieChartIcon } from "lucide-react";
import { useState } from "react";

interface CategoryData {
    name: string;
    value: number;
    color: string;
    count?: number;
}



export function CategoryDistChart({ data }: { data: CategoryData[] }) {
    const [activeIndex, setActiveIndex] = useState(-1);

    // Filter out very small segments for cleaner UI
    const totalValue = (data || []).reduce((acc, curr) => acc + curr.value, 0);
    const chartData = (data || []).filter(d => d.value > 0).map(d => ({
        ...d,
        percentage: totalValue > 0 ? Math.round((d.value / totalValue) * 100) : 0
    }));

    if (chartData.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full w-full flex flex-col items-center justify-center min-h-[220px] relative bg-zinc-50/10 dark:bg-zinc-900/5 rounded-[32px] border border-zinc-100 dark:border-zinc-800/50 group overflow-hidden"
            >
                {/* Subtle Professional Backdrop */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-zinc-200/10 via-transparent to-transparent dark:from-zinc-100/5 blur-[100px] opacity-40" />
                </div>

                {/* Simplified Professional Ring */}
                <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                    <motion.div
                        className="absolute inset-0 rounded-full border-[6px] border-zinc-100 dark:border-zinc-800/50"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        animate={{
                            opacity: [0.3, 0.8, 0.3],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <PieChartIcon className="w-6 h-6 text-emerald-500/50 dark:text-emerald-500/40" />
                    </motion.div>
                </div>

                <div className="text-center space-y-1 relative z-10">
                    <p className="text-sm font-serif text-zinc-400 dark:text-zinc-500 italic">No allocation detected</p>
                    <p className="text-[8px] font-bold text-zinc-300 dark:text-zinc-600 uppercase tracking-[0.5em]">Structure Ready</p>
                </div>
            </motion.div>
        );
    }

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(-1);
    };

    // Special handling for single category (100%)
    const isSingleCategory = chartData.length === 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="h-full w-full flex flex-col relative overflow-hidden"
        >
            <div className="flex-1 min-h-[180px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius={isSingleCategory ? "0%" : "68%"}
                            outerRadius="88%"
                            paddingAngle={isSingleCategory ? 0 : 3}
                            dataKey="value"
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                            animationBegin={200}
                            animationDuration={1500}
                            animationEasing="ease-out"
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            cx="50%"
                            cy="50%"
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    className="stroke-zinc-50 dark:stroke-zinc-950 stroke-2 outline-none"
                                    style={{
                                        filter: activeIndex === index ? `drop-shadow(0 0 8px ${entry.color}44)` : 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </Pie>

                    </PieChart>
                </ResponsiveContainer>

                {/* Center Stats */}
                {!isSingleCategory && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <AnimatePresence mode="wait">
                            {activeIndex === -1 ? (
                                <motion.div
                                    key="total"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex flex-col items-center"
                                >
                                    <span className="text-[7.5px] text-zinc-400 font-bold uppercase tracking-[0.2em] mb-0.5">Monthly Total</span>
                                    <span className="text-[13px] font-serif font-bold text-zinc-900 dark:text-zinc-50">
                                        ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="hover"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex flex-col items-center"
                                >
                                    <span className="text-[7.5px] text-zinc-400 font-bold uppercase tracking-widest mb-0.5 max-w-[80px] truncate text-center">
                                        {chartData[activeIndex]?.name}
                                    </span>
                                    <span className="text-[13px] font-serif font-bold text-zinc-900 dark:text-zinc-50">
                                        ${chartData[activeIndex]?.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </span>
                                    <span className="text-[8px] text-emerald-500 font-bold mt-0.5">
                                        {chartData[activeIndex]?.percentage}%
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Compact Legend */}
            <div className="grid grid-cols-1 gap-1.5 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
                {chartData.slice(0, 3).map((item) => (
                    <div
                        key={item.name}
                        className={`flex items-center justify-between text-xs transition-opacity duration-200 ${activeIndex !== -1 && chartData[activeIndex]?.name !== item.name ? 'opacity-30' : 'opacity-100'}`}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-zinc-600 dark:text-zinc-400 font-medium truncate">
                                {item.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            {item.count && (
                                <span className="text-[10px] text-zinc-400 tabular-nums">
                                    {item.count} {item.count === 1 ? 'txn' : 'txns'}
                                </span>
                            )}
                            <span className="text-zinc-900 dark:text-zinc-50 font-bold tabular-nums min-w-[35px] text-right">
                                {item.percentage}%
                            </span>
                        </div>
                    </div>
                ))}
                {chartData.length > 3 && (
                    <div className="text-[9px] text-center text-zinc-400 mt-1 uppercase tracking-widest font-bold opacity-60">
                        + {chartData.length - 3} other categories
                    </div>
                )}
            </div>
        </motion.div>
    );
}
