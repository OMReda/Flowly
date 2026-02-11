"use client";

import { useActionState, useState, useEffect } from "react";
import { addManualTransaction } from "@/app/actions/manual-transaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CalendarIcon, PlusCircle, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { detectMerchantCategory } from "@/lib/deterministic-logic";
import { getCategoriesByType } from "@/app/actions/get-categories";

export function ManualEntryForm({ onComplete }: { onComplete?: () => void }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

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
        <Card className="border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden mt-2">
            <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-0.5 w-8 bg-emerald-500/50" />
                        <h3 className="text-xl font-serif tracking-tight">Financial Ledger Entry</h3>
                    </div>

                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full border border-zinc-200 dark:border-zinc-700 relative">
                        <button
                            type="button"
                            onClick={() => setType("expense")}
                            className={`relative px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors z-10 ${type === "expense"
                                ? "text-rose-500"
                                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                }`}
                        >
                            Expense
                            {type === "expense" && (
                                <motion.div
                                    layoutId="toggle-pill"
                                    className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-full shadow-sm -z-10"
                                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("income")}
                            className={`relative px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors z-10 ${type === "income"
                                ? "text-emerald-500"
                                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                }`}
                        >
                            Income
                            {type === "income" && (
                                <motion.div
                                    layoutId="toggle-pill"
                                    className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-full shadow-sm -z-10"
                                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                />
                            )}
                        </button>
                    </div>
                </div>

                <form action={action} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-3">
                            <Label htmlFor="merchant" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                Merchant / Entity
                                <AnimatePresence>
                                    {showAutoSuggest && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="inline-flex items-center gap-1 text-[8px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full"
                                        >
                                            <Sparkles className="w-2 h-2" /> Auto-categorized
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Label>
                            <Input
                                id="merchant"
                                name="merchant"
                                value={merchant}
                                onChange={handleMerchantChange}
                                placeholder="Amazon, Starbucks, etc."
                                required
                                className="bg-transparent border-t-0 border-x-0 border-b border-zinc-200 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500 h-12 text-lg transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="amount" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Capital Amount ($)</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                required
                                className="bg-transparent border-t-0 border-x-0 border-b border-zinc-200 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500 h-12 text-lg"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="category" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Allocation Category</Label>
                            {mounted && !isLoadingCategories ? (
                                <Select name="category" required value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="bg-transparent border-t-0 border-x-0 border-b border-zinc-200 dark:border-zinc-800 rounded-none px-0 focus:ring-0 focus:border-emerald-500 h-12 text-lg">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800">
                                        {availableCategories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.name}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="bg-transparent border-t-0 border-x-0 border-b border-zinc-200 dark:border-zinc-800 rounded-none px-0 h-12 flex items-center">
                                    <span className="text-lg text-zinc-300">Loading Categories...</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="date" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Entry Date</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                defaultValue={today}
                                required
                                className="bg-transparent border-t-0 border-x-0 border-b border-zinc-200 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500 h-12 text-lg"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4">
                        <div className="flex items-center space-x-3 group cursor-pointer">
                            <Checkbox id="is_subscription" name="is_subscription" className="rounded-md border-zinc-200 dark:border-zinc-800 data-[state=checked]:bg-emerald-500" />
                            <Label htmlFor="is_subscription" className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 cursor-pointer group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                Mark as recurring subscription
                            </Label>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="h-12 px-8 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all font-medium tracking-wide"
                            >
                                {isPending ? "Journaling..." : "Record Transaction"}
                            </Button>
                        </div>
                    </div>

                    {state?.error && (
                        <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest text-center mt-4 animate-pulse">{state.error}</p>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
