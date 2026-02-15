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
        a.download = `flowly-export-${new Date().toISOString().split('T')[0]}.${format}`;
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

    if (!transactions || transactions.length === 0) {
        return <EmptyState hasAiKey={hasAiKey} />;
    }

    return (
        <div className="space-y-6">
            {/* Fixed Search Bar at Top */}
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
                        <motion.button
                            key={cat}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all ${filterCategory === cat
                                ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                        >
                            {cat}
                        </motion.button>
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

            {/* Scrollable Transactions Container - Expanded Height */}
            <div className="relative overflow-hidden" style={{ maxHeight: '420px' }}>
                {/* Scrollable Transaction List */}
                <div className="overflow-y-auto overflow-x-hidden scroll-smooth no-scrollbar" style={{ maxHeight: '420px' }}>
                    <div className="space-y-0">
                        <AnimatePresence mode="popLayout">
                            {activeTransactions.slice(0, 50).map((t: Transaction, i) => (
                                <motion.div
                                    key={t.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                                    whileHover={{ x: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                        opacity: { duration: 0.15 }
                                    }}
                                    className="group"
                                >
                                    <div
                                        className="relative py-5 px-4 grid items-center transition-all duration-150 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 rounded-xl"
                                        style={{ gridTemplateColumns: 'auto 1fr auto' }}
                                    >
                                        {/* Column 1: Avatar */}
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-[8px] font-bold tracking-tight text-white shrink-0 mr-4 ring-1 ring-black/5 dark:ring-white/5
                                            ${t.type === 'income' ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-zinc-800 dark:bg-zinc-900'}
                                        `}
                                        >
                                            {t.category ? t.category.substring(0, 2).toUpperCase() : '??'}
                                        </div>

                                        {/* Column 2: Merchant + Meta */}
                                        <div className="min-w-0 pr-4">
                                            <h3 className="text-[14px] font-medium text-zinc-900 dark:text-zinc-100 leading-none truncate">
                                                {t.merchant}
                                            </h3>
                                            <p className="text-[12px] font-normal text-zinc-400 dark:text-zinc-500 mt-1.5 flex items-center gap-1.5 whitespace-nowrap">
                                                <span className="capitalize">{t.category}</span>
                                                <span className="text-zinc-200 dark:text-zinc-800">•</span>
                                                <span className="tabular-nums">{isMounted ? new Date(t.date || "").toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "--"}</span>
                                            </p>
                                        </div>

                                        {/* Column 3: Amount */}
                                        <div className="flex items-center gap-4 ml-6">
                                            <div className="text-right">
                                                <p className={`text-[15px] tracking-tight tabular-nums transition-transform duration-100 group-hover:scale-[1.02] ${t.type === 'income'
                                                    ? 'text-emerald-600/90 dark:text-emerald-500/90 font-medium'
                                                    : (t.amount > 500 ? 'text-rose-800/80 dark:text-rose-400/70 font-semibold' : 'text-rose-600/50 dark:text-rose-400/40 font-medium')
                                                    }`}>
                                                    {t.type === 'expense' ? '−' : '+'}${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>

                                            {showDelete && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                    <button
                                                        onClick={() => handleDelete(t.id)}
                                                        disabled={deletingId === t.id}
                                                        className={`p-1.5 rounded-lg transition-all ${confirmDelete === t.id
                                                            ? 'bg-red-500 text-white'
                                                            : 'text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400'
                                                            } disabled:opacity-50`}
                                                    >
                                                        {deletingId === t.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : confirmDelete === t.id ? (
                                                            <Check className="w-3 h-3" />
                                                        ) : (
                                                            <Trash2 className="w-3 h-3" />
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
                </div>
            </div>
        </div >
    );
}
