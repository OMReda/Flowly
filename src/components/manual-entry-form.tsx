"use client";

import { useActionState, useState, useEffect } from "react";
import { addManualTransaction } from "@/app/actions/manual-transaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Store, DollarSign, Calendar, PlusCircle, X, Sparkles, Tag } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { detectMerchantCategory } from "@/lib/deterministic-logic";
import { getCategoriesByType } from "@/app/actions/get-categories";

export function ManualEntryForm({ onComplete }: { onComplete?: () => void }) {
    const [type, setType] = useState<"income" | "expense">("expense");
    const [merchant, setMerchant] = useState("");
    const [category, setCategory] = useState("Other");
    const [availableCategories, setAvailableCategories] = useState<any[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [showAutoSuggest, setShowAutoSuggest] = useState(false);

    useEffect(() => {
        const fetchCats = async () => {
            setIsLoadingCategories(true);
            const cats = await getCategoriesByType(type);
            setAvailableCategories(cats);

            // Default to 'Other' or the first one if it exists
            const hasOther = cats.find(c => c.name === 'Other');
            if (hasOther) {
                setCategory('Other');
            } else if (cats.length > 0) {
                setCategory(cats[0].name);
            }

            setIsLoadingCategories(false);
        };
        fetchCats();
    }, [type]);

    const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
        const amountStr = formData.get("amount") as string;
        const amount = parseFloat(amountStr);

        // Input Protection: Max 2 decimals
        if (amountStr.includes('.') && amountStr.split('.')[1].length > 2) {
            return { error: "Amount cannot have more than 2 decimal places" };
        }

        try {
            formData.set("type", type);
            formData.set("category", category); // Use local state for category
            const result = await addManualTransaction(formData);

            if (result.success) {
                toast.success("Transaction added", {
                    action: {
                        label: "Undo",
                        onClick: async () => {
                            try {
                                const { deleteTransaction } = await import("@/app/actions/delete-transaction");
                                await deleteTransaction(result.id);
                                toast.info("Transaction reverted");
                            } catch (undoErr) {
                                console.error("[CLIENT] Undo Error:", undoErr);
                                toast.error("Failed to undo transaction");
                            }
                        }
                    }
                });
                onComplete?.();
            }
            return result;
        } catch (err) {
            console.error("[CLIENT] addManualTransaction Fatal Client-Side Error:", err);
            return { error: "A connection error occurred. Check your server logs." };
        }
    }, null);

    const handleMerchantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[0-9]/g, ''); // EXCLUSIVE: No numbers allowed
        setMerchant(value);

        const detected = detectMerchantCategory(value);
        if (detected && detected !== category) {
            setCategory(detected);
            setShowAutoSuggest(true);
            setTimeout(() => setShowAutoSuggest(false), 2000);
        }
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="group relative"
        >
            <Card className="border-zinc-200/50 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-950/40 backdrop-blur-3xl shadow-none rounded-[4rem] overflow-hidden ring-1 ring-white/10 transition-[transform,box-shadow,opacity] duration-500 relative z-10">
                {/* Moving Particles (Mesh Blobs) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <motion.div
                        animate={{
                            x: [0, 40, -40, 0],
                            y: [0, -40, 40, 0],
                            scale: [1, 1.2, 0.8, 1],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute top-0 -left-20 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            x: [0, -30, 30, 0],
                            y: [0, 50, -50, 0],
                            scale: [1, 0.8, 1.1, 1],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-0 -right-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px]"
                    />
                </div>

                <CardContent className="p-8 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-5">
                            <motion.div
                                animate={{
                                    backgroundImage: type === 'expense'
                                        ? 'linear-gradient(to right, #f43f5e, #a855f7)' // Rose to Purple
                                        : 'linear-gradient(to right, #10b981, #3b82f6)' // Emerald to Blue
                                }}
                                className="h-1 w-10 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500"
                            />
                            <h3 className="text-2xl font-serif tracking-tight text-zinc-900 dark:text-zinc-100">Financial Ledger Entry</h3>
                        </div>

                        <div className="flex bg-zinc-200/50 dark:bg-zinc-800/50 p-1 rounded-full border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm">
                            <button
                                type="button"
                                onClick={() => setType("expense")}
                                className={`relative px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all z-10 ${type === "expense"
                                    ? "text-rose-500"
                                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                    }`}
                            >
                                Expense
                                {type === "expense" && (
                                    <motion.div
                                        layoutId="toggle-pill"
                                        className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-full shadow-md -z-10"
                                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                    />
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("income")}
                                className={`relative px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all z-10 ${type === "income"
                                    ? "text-emerald-500"
                                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                    }`}
                            >
                                Income
                                {type === "income" && (
                                    <motion.div
                                        layoutId="toggle-pill"
                                        className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-full shadow-md -z-10"
                                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                    />
                                )}
                            </button>
                        </div>
                    </div>

                    <form action={action} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            <div className="space-y-4">
                                <Label htmlFor="merchant" className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 flex items-center justify-between">
                                    <span className="flex items-center gap-2">Merchant / Entity</span>
                                    <AnimatePresence>
                                        {showAutoSuggest && (
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.8, x: 5 }}
                                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.8, x: 5 }}
                                                className="inline-flex items-center gap-1 text-[8px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-500/20"
                                            >
                                                <Sparkles className="w-2 h-2" /> AI Categorized
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                                        <Store className="w-4 h-4" />
                                    </div>
                                    <Input
                                        id="merchant"
                                        name="merchant"
                                        value={merchant}
                                        onChange={handleMerchantChange}
                                        placeholder="Enter entity name..."
                                        required
                                        className="bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl pl-12 pr-4 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50 h-12 text-base font-medium transition-all backdrop-blur-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="amount" className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">Total Amount ($)</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                                        <DollarSign className="w-4 h-4" />
                                    </div>
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                        className="bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl pl-12 pr-4 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50 h-12 text-base font-medium transition-all backdrop-blur-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="category" className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">Allocation Category</Label>
                                <div className="h-12 relative group">
                                    {!isLoadingCategories ? (
                                        <Select name="category" required value={category} onValueChange={setCategory}>
                                            <SelectTrigger className="bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl px-4 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 h-12 text-base font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 backdrop-blur-sm overflow-hidden">
                                                <div className="flex items-center gap-3 w-full">
                                                    <Tag className="w-4 h-4 text-emerald-500" />
                                                    <SelectValue placeholder="Select category" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-zinc-200/50 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] dark:border-zinc-800/80 backdrop-blur-3xl bg-white/95 dark:bg-zinc-950/95 p-1 min-w-[180px]">
                                                {availableCategories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.name} className="focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400 rounded-xl m-1 pl-9 pr-4 py-2 cursor-pointer transition-colors">
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="bg-zinc-100/30 dark:bg-zinc-800/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 h-12 flex items-center gap-3 animate-pulse">
                                            <Tag className="w-4 h-4 text-zinc-300" />
                                            <span className="text-base text-zinc-400 font-medium">Preparing segments...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="date" className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">Transaction Date</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <Input
                                        id="date"
                                        name="date"
                                        type="date"
                                        defaultValue={today}
                                        required
                                        className="bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl pl-12 pr-4 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50 h-12 text-base font-medium transition-all backdrop-blur-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 pt-8 border-t border-zinc-200/50 dark:border-zinc-800/50">
                            <div className="flex items-center space-x-3 group cursor-pointer">
                                <Checkbox id="is_subscription" name="is_subscription" className="rounded-md w-5 h-5 border-zinc-200 dark:border-zinc-800 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 transition-all transition-colors" />
                                <Label htmlFor="is_subscription" className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500 cursor-pointer group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                    Mark as recurring subscription
                                </Label>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="h-14 px-10 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 overflow-hidden relative group transition-all duration-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] border-0"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-600 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative z-10 flex items-center gap-2">
                                        <span className="font-serif italic text-lg tracking-tighter mr-1">
                                            {isPending ? "Syncing..." : "Finalize Entry"}
                                        </span>
                                        {!isPending && <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90 duration-500" />}
                                    </div>
                                </Button>
                            </div>
                        </div>

                        {state?.error && (
                            <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest text-center mt-4 animate-pulse">{state.error}</p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </motion.div >
    );
}
