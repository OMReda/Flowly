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
                            className="border-b border-zinc-100 dark:border-zinc-800/40 last:border-0"
                        >
                            <div
                                className="group relative py-3.5 px-4 grid items-center transition-colors duration-150 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/20"
                                style={{ gridTemplateColumns: 'auto 1fr max-content' }}
                            >
                                {/* Column 1: Avatar */}
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-[9px] font-bold tracking-tight text-white shrink-0 mr-3.5 ring-1 ring-black/5 dark:ring-white/5
                                    ${t.type === 'income' ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-zinc-700 dark:bg-zinc-800'}
                                `}
                                >
                                    {t.category ? t.category.substring(0, 2).toUpperCase() : '??'}
                                </div>

                                {/* Column 2: Merchant Info */}
                                <div className="min-w-0 pr-12">
                                    <h3 className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                                        {t.merchant}
                                    </h3>
                                    <p className="text-[13px] font-normal text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                                        {t.is_subscription && <Repeat className="w-3 h-3 text-blue-500 dark:text-blue-400" />}
                                        <span className="capitalize">{t.category}</span>
                                        <span className="text-zinc-300 dark:text-zinc-600">·</span>
                                        <span className="tabular-nums">{isMounted ? new Date(t.date || "").toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "--"}</span>
                                    </p>
                                    {t.ai_confidence === 'low' && (
                                        <div className="mt-1.5 relative group/category">
                                            <button className="text-[10px] font-medium flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors">
                                                <AlertCircle className="w-2.5 h-2.5" />
                                                Wrong category?
                                            </button>
                                            <div className="absolute top-full left-0 mt-1.5 hidden group-hover/category:block z-10">
                                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg overflow-hidden">
                                                    {COMMON_CATEGORIES.filter(c => c.toLowerCase() !== t.category?.toLowerCase()).map(cat => (
                                                        <button
                                                            key={cat}
                                                            onClick={() => handleCategoryChange(t.id, cat)}
                                                            disabled={changingCategory === t.id}
                                                            className="w-full text-left text-[13px] font-medium px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-zinc-700 dark:text-zinc-300 first:pt-2 last:pb-2"
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Column 3: Amount + Delete */}
                                <div className="flex items-center gap-3 justify-end">
                                    <div
                                        className="text-right whitespace-nowrap"
                                        style={{
                                            fontVariantNumeric: 'tabular-nums',
                                            minWidth: 'max-content'
                                        }}
                                    >
                                        <p className={`text-[15px] font-semibold tracking-tight ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {t.type === 'expense' ? '−' : '+'}${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>

                                    {showDelete && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                disabled={deletingId === t.id}
                                                className={`p-2 rounded-lg transition-all ${confirmDelete === t.id
                                                    ? 'bg-red-500 text-white scale-105'
                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
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

            <div className="mt-12 flex items-center justify-center h-10 border-t border-zinc-50 dark:border-zinc-900">
                <div className="flex items-center gap-6">
                    <motion.button
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 15,
                            mass: 0.8
                        }}
                        onClick={() => exportData('csv')}
                        className="group flex items-center gap-2 h-6 px-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                    >
                        <Download className="w-3 h-3 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[10px] font-medium text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 uppercase tracking-widest leading-none pt-[1px] transition-colors">CSV</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 15,
                            mass: 0.8
                        }}
                        onClick={() => exportData('json')}
                        className="group flex items-center gap-2 h-6 px-2 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                    >
                        <Download className="w-3 h-3 text-zinc-400 group-hover:text-amber-500 transition-colors" />
                        <span className="text-[10px] font-medium text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 uppercase tracking-widest leading-none pt-[1px] transition-colors">JSON</span>
                    </motion.button>

                    <div className="h-3 w-px bg-zinc-100 dark:bg-zinc-800" />

                    <div className="flex items-center gap-2 h-6 px-2">
                        <span className="text-[10px] font-medium text-zinc-300 dark:text-zinc-700 uppercase tracking-widest leading-none pt-[1px] tabular-nums">
                            {activeTransactions.length}
                        </span>
                        <span className="text-[10px] font-medium text-zinc-300 dark:text-zinc-700 uppercase tracking-widest leading-none pt-[1px]">
                            {activeTransactions.length === 1 ? 'Record' : 'Records'}
                        </span>
                    </div>
                </div>
            </div>
        </div >
    );
}
