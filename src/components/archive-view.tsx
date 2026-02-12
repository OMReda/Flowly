"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, ArrowLeft, Download, Trash2, ArrowUpRight, ArrowDownLeft, X, Calendar, History } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { deleteTransaction } from "@/app/actions/delete-transaction";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";
import { Logo } from "@/components/logo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Transaction } from "@/lib/types";

interface ArchiveViewProps {
    transactions: Transaction[];
}

export function ArchiveView({ transactions }: ArchiveViewProps) {
    const router = useRouter();
    const [localTransactions, setLocalTransactions] = useState(transactions);

    useEffect(() => {
        setLocalTransactions(transactions);
    }, [transactions]);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'amount-desc'>('date-desc');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isWiggling, setIsWiggling] = useState<'csv' | 'json' | null>(null);

    const filteredTransactions = useMemo(() => {
        return localTransactions
            .filter(t => {
                const matchesSearch =
                    (t.merchant?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                    (t.category?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                    (t.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());

                const matchesType = filterType === 'all' || t.type === filterType;
                const date = t.date ? t.date.split('T')[0] : '';
                const matchesDate = (!startDate || date >= startDate) && (!endDate || date <= endDate);

                return matchesSearch && matchesType && matchesDate;
            })
            .sort((a, b) => {
                if (sortOrder === 'amount-desc') {
                    return Number(b.amount) - Number(a.amount);
                }
                const dateA = new Date(a.date || 0).getTime();
                const dateB = new Date(b.date || 0).getTime();
                return sortOrder === 'date-desc' ? dateB - dateA : dateA - dateB;
            });
    }, [localTransactions, searchQuery, filterType, startDate, endDate, sortOrder]);

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        const previousTransactions = [...localTransactions];
        setLocalTransactions(prev => prev.filter(item => item.id !== deleteId));
        setDeleteId(null);

        try {
            const result = await deleteTransaction(deleteId);
            if (result.error) throw new Error(result.error);
            router.refresh();
        } catch (error) {
            console.error("Failed to delete", error);
            setLocalTransactions(previousTransactions);
            alert("Failed to delete transaction.");
        } finally {
            setIsDeleting(false);
        }
    };

    const downloadCSV = () => {
        if (filteredTransactions.length === 0) {
            setIsWiggling('csv');
            setTimeout(() => setIsWiggling(null), 500);
            toast.error("Nothing to export", {
                description: "Your filtered list is empty. Add transactions or adjust filters."
            });
            return;
        }
        const headers = ["Date", "Merchant", "Category", "Amount", "Type", "Description"];
        const rows = filteredTransactions.map(t => [
            t.date,
            t.merchant || "",
            t.category || "",
            t.amount.toString(),
            t.type,
            t.description || ""
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `flowly_archive_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadJSON = () => {
        if (filteredTransactions.length === 0) {
            setIsWiggling('json');
            setTimeout(() => setIsWiggling(null), 500);
            toast.error("Nothing to export", {
                description: "Your filtered list is empty. Add transactions or adjust filters."
            });
            return;
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredTransactions, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", `flowly_archive_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50">
            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-900">
                    <div className="flex items-center gap-6">
                        <Logo className="w-10 h-10" />
                        <div>
                            <h1 className="text-3xl font-serif tracking-tight text-zinc-900 dark:text-zinc-50">Transaction Archive</h1>
                            <p className="text-[10px] tracking-[0.2em] font-bold text-zinc-400 uppercase mt-1">
                                Historical Records Journal
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="inline-flex items-center text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                            <ArrowLeft className="w-3 h-3 mr-1" />
                            Dashboard
                        </Link>
                        <motion.button
                            whileHover={{ y: -2, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={isWiggling === 'csv' ? { x: [-4, 4, -4, 4, 0] } : {}}
                            transition={{ duration: 0.4 }}
                            onClick={downloadCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm group"
                        >
                            <Download className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                            <span>Export CSV</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ y: -2, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={isWiggling === 'json' ? { x: [-4, 4, -4, 4, 0] } : {}}
                            transition={{ duration: 0.4 }}
                            onClick={downloadJSON}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all shadow-sm group"
                        >
                            <Download className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-500 transition-colors" />
                            <span>Export JSON</span>
                        </motion.button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <p className="text-[10px] font-bold tracking-[0.3em] text-zinc-400 uppercase mb-2">Total Volume</p>
                        <p className="text-3xl font-serif">{transactions.length} <span className="text-sm text-zinc-400 font-sans tracking-normal">Entries</span></p>
                    </div>
                    <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <p className="text-[10px] font-bold tracking-[0.3em] text-zinc-400 uppercase mb-2">Filtered View</p>
                        <p className="text-3xl font-serif">
                            {filteredTransactions.length} <span className="text-sm text-zinc-400 font-sans tracking-normal">Entries</span>
                        </p>
                    </div>
                </div>

                <div className="sticky top-4 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 p-2 rounded-2xl shadow-sm flex flex-col xl:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search by merchant, category, or notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm md:text-base outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0 no-scrollbar">
                        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl shrink-0">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent text-xs font-medium text-zinc-600 dark:text-zinc-300 px-2 py-1.5 outline-none"
                            />
                            <span className="text-zinc-300 dark:text-zinc-700">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent text-xs font-medium text-zinc-600 dark:text-zinc-300 px-2 py-1.5 outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl shrink-0">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${filterType === 'all' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterType('income')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${filterType === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                            >
                                Income
                            </button>
                            <button
                                onClick={() => setFilterType('expense')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${filterType === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400'}`}
                            >
                                Expense
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-serif">Full Journal</h3>
                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-grow" />
                        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl relative overflow-hidden">
                            <motion.div
                                className="absolute inset-y-1 bg-white dark:bg-zinc-800 rounded-lg shadow-sm"
                                initial={false}
                                animate={{
                                    x: sortOrder === 'date-desc' ? '0%' : sortOrder === 'date-asc' ? '100%' : '200%',
                                    left: '4px',
                                    width: 'calc(33.33% - 4px)'
                                }}
                                transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                            />
                            <button
                                onClick={() => setSortOrder('date-desc')}
                                className={`relative px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 z-10 flex items-center gap-2 ${sortOrder === 'date-desc' ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 hover:text-zinc-600'}`}
                            >
                                <History className="w-3 h-3" />
                                <span className="hidden sm:inline">Recent</span>
                            </button>
                            <button
                                onClick={() => setSortOrder('date-asc')}
                                className={`relative px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 z-10 flex items-center gap-2 ${sortOrder === 'date-asc' ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 hover:text-zinc-600'}`}
                            >
                                <Calendar className="w-3 h-3" />
                                <span className="hidden sm:inline">Oldest</span>
                            </button>
                            <button
                                onClick={() => setSortOrder('amount-desc')}
                                className={`relative px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 z-10 flex items-center gap-2 ${sortOrder === 'amount-desc' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 hover:text-zinc-600'}`}
                            >
                                <ArrowUpRight className="w-3 h-3" />
                                <span className="hidden sm:inline">Largest</span>
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {filteredTransactions.map((t) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={t.id}
                                className="group relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 hover:shadow-md hover:border-zinc-200 dark:hover:border-zinc-700 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${t.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-500'}`}>
                                            {t.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-serif font-medium text-lg text-zinc-900 dark:text-zinc-50">
                                                    {t.merchant || "Unknown Merchant"}
                                                </h3>
                                                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">
                                                    {t.category}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(t.date || "").toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                {t.description && (
                                                    <>
                                                        <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                                        <span className="italic truncate max-w-[200px]">{t.description}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 pl-14 sm:pl-0">
                                        <div className={`text-lg font-serif ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                                        </div>
                                        <button
                                            onClick={() => setDeleteId(t.id)}
                                            className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredTransactions.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-6 h-6 text-zinc-300" />
                            </div>
                            <h3 className="text-zinc-900 dark:text-zinc-50 font-medium">No transactions found</h3>
                            <p className="text-zinc-500 text-sm mt-1">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </div>

            <footer className="pt-12 pb-12 text-center opacity-30 group hover:opacity-100 transition-opacity">
                <p className="text-[9px] font-medium tracking-[0.3em] uppercase text-zinc-400 italic">
                    End of Historical Ledger
                </p>
            </footer>
        </div>
    );
}
