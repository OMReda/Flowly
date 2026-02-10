"use client";

import { Card } from "@/components/ui/card";
import { Trash2, Repeat, Loader2, Download, RotateCcw, AlertCircle, Search, Filter, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { deleteTransaction, restoreTransaction } from "@/app/actions/delete-transaction";
import { updateTransactionCategory } from "@/app/actions/update-category";
import { toast } from "sonner";

const COMMON_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'];

import { Transaction } from "@/lib/types";

interface TransactionListProps {
    transactions: Transaction[];
    showDelete?: boolean;
    showCategories?: boolean;
    hasAiKey?: boolean;
}

import { EmptyState } from "@/components/empty-state";

export function TransactionList({ transactions, showDelete = false, showCategories = false, hasAiKey = false }: TransactionListProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [changingCategory, setChangingCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!transactions || transactions.length === 0) {
        return <EmptyState hasAiKey={hasAiKey} />;
    }

    const handleDelete = async (id: string) => {
        if (confirmDelete !== id) {
            setConfirmDelete(id);
            setTimeout(() => setConfirmDelete(null), 3000); // Auto-reset after 3s
            return;
        }

        setDeletingId(id);
        const result = await deleteTransaction(id);
        if (result.success) {
            setConfirmDelete(null);
            toast("Transaction moved to trash", {
                description: "You can reverse this action immediately.",
                action: {
                    label: "Undo",
                    onClick: () => handleRestore(id),
                },
            });
        } else {
            toast.error(result.error || "Failed to remove transaction.");
            setDeletingId(null);
            setConfirmDelete(null);
        }
    };

    const handleRestore = async (id: string) => {
        const result = await restoreTransaction(id);
        if (result.success) {
            toast.success("Transaction restored.");
            setDeletingId(null);
        }
    };

    const handleCategoryChange = async (id: string, newCategory: string) => {
        setChangingCategory(id);
        const result = await updateTransactionCategory(id, newCategory);
        if (result.success) {
            toast.success(`Category updated to ${newCategory}`);
        } else {
            toast.error(result.error || "Failed to update category.");
        }
        setChangingCategory(null);
    };

    const exportData = (format: 'csv' | 'json') => {
        const data = format === 'csv'
            ? "id,merchant,amount,type,category,date\n" + transactions.map(t => `${t.id},"${t.merchant}",${t.amount},${t.type},${t.category},${t.date}`).join("\n")
            : JSON.stringify(transactions, null, 2);

        const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spendwise-export-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const activeTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t.merchant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.category?.toLowerCase().includes(searchQuery.toLowerCase());
            return !t.deleted_at && matchesSearch;
        });
    }, [transactions, searchQuery]);

    return (
        <div className="space-y-8">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search merchant or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            {showCategories && (
                <div className="flex bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-1 rounded-2xl overflow-x-auto no-scrollbar">
                    {["All", ...COMMON_CATEGORIES].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all ${filterCategory === cat
                                ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {!activeTransactions.length && searchQuery && (
                <div className="text-center py-20 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl bg-zinc-50/10">
                    <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Analysis Results: Zero</p>
                    <p className="text-sm font-serif mt-2 italic text-zinc-500">No transactions match your search "{searchQuery}"</p>
                    <button onClick={() => setSearchQuery("")} className="mt-4 text-[9px] font-bold text-emerald-600 uppercase tracking-widest hover:underline">Clear search</button>
                </div>
            )}
            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {activeTransactions.map((t: Transaction, i) => (
                        <motion.div
                            key={t.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                                opacity: { duration: 0.2 }
                            }}
                        >
                            <div className="group relative p-4 flex items-center justify-between transition-all duration-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 rounded-xl cursor-default border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800">
                                <div className="flex items-center gap-5">
                                    <div
                                        className={`w-11 h-11 rounded-full flex items-center justify-center text-[10px] font-bold tracking-tighter text-white
                                        ${t.type === 'income' ? 'bg-emerald-500/90' : 'bg-zinc-800 dark:bg-zinc-700'}
                                    `}
                                    >
                                        {t.category ? t.category.substring(0, 2).toUpperCase() : '??'}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-serif tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                                            {t.merchant}
                                        </h3>
                                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] mt-0.5 flex items-center gap-2">
                                            {t.is_subscription && <Repeat className="w-2.5 h-2.5 text-blue-400" />}
                                            {t.category} <span className="text-zinc-200 dark:text-zinc-800">•</span> {isMounted ? new Date(t.date || "").toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "--"}
                                        </p>
                                        {t.ai_confidence === 'low' && (
                                            <div className="mt-1.5 relative group/category">
                                                <button className="text-[9px] flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors">
                                                    <AlertCircle className="w-2.5 h-2.5" />
                                                    Not {t.category}?
                                                </button>
                                                <div className="absolute top-full left-0 mt-1 hidden group-hover/category:block z-10">
                                                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-1 min-w-[120px]">
                                                        {COMMON_CATEGORIES.filter(c => c.toLowerCase() !== t.category?.toLowerCase()).map(cat => (
                                                            <button
                                                                key={cat}
                                                                onClick={() => handleCategoryChange(t.id, cat)}
                                                                disabled={changingCategory === t.id}
                                                                className="w-full text-left text-xs px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-700 dark:text-zinc-300"
                                                            >
                                                                {cat}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="text-right transition-all duration-300">
                                        <p className={`text-lg font-serif ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {t.type === 'expense' ? '-' : '+'}${Number(t.amount).toFixed(2)}
                                        </p>
                                    </div>

                                    {showDelete && (
                                        <div className="overflow-hidden flex justify-end">
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                disabled={deletingId === t.id}
                                                className={`p-2.5 rounded-full transition-all shadow-sm border ${confirmDelete === t.id
                                                    ? 'bg-rose-500 text-white border-rose-500 scale-110'
                                                    : 'bg-white dark:bg-zinc-800 text-zinc-400 hover:text-rose-500 border-zinc-100 dark:border-zinc-700 hover:border-rose-100'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {deletingId === t.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : confirmDelete === t.id ? (
                                                    <Check className="w-3.5 h-3.5" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-zinc-50 dark:border-zinc-900">
                <div className="flex gap-4">
                    <button
                        onClick={() => exportData('csv')}
                        className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
                    >
                        <Download className="w-2.5 h-2.5" /> CSV Export
                    </button>
                    <button
                        onClick={() => exportData('json')}
                        className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
                    >
                        <Download className="w-2.5 h-2.5" /> JSON Export
                    </button>
                </div>
                <div className="text-[9px] font-bold text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">
                    {activeTransactions.length} Entries
                </div>
            </div>
        </div >
    );
}
