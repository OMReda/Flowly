"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        monthly_income: 0,
        fixed_expenses: 0,
        starting_balance: 0,
        financial_goal: "save",
        personality: "balanced",
    });

    const totalSteps = 3;

    const handleNext = async () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            setLoading(true);
            try {
                console.log("[CLIENT] Completing onboarding...");
                const res = await updateProfile({ ...formData, onboarding_completed: true });
                console.log("[CLIENT] updateProfile result:", JSON.stringify(res));
                if (res.success) {
                    toast.success("Profile updated");
                    onClose();
                    router.refresh();
                } else {
                    console.error("[CLIENT] Onboarding failed:", res.error);
                    toast.error("Failed to save profile. Try skipping.");
                }
            } catch (err) {
                console.error("[CLIENT] Onboarding Fatal Error:", err);
                toast.error("A connection error occurred.");
            } finally {
                setLoading(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
                <div className="p-8 space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-serif tracking-tight text-zinc-900 dark:text-zinc-50">Welcome to SpendWise</h2>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Step {step} of {totalSteps}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    <div className="min-h-[220px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="income">Monthly Post-Tax Income</Label>
                                        <Input
                                            id="income"
                                            type="number"
                                            placeholder="5000"
                                            value={formData.monthly_income || ''}
                                            onChange={(e) => setFormData({ ...formData, monthly_income: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expenses">Fixed Expenses (Rent, Bills)</Label>
                                        <Input
                                            id="expenses"
                                            type="number"
                                            placeholder="1500"
                                            value={formData.fixed_expenses || ''}
                                            onChange={(e) => setFormData({ ...formData, fixed_expenses: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="balance">Current Available Funds (Balance)</Label>
                                        <Input
                                            id="balance"
                                            type="number"
                                            placeholder="2500"
                                            value={formData.starting_balance || ''}
                                            onChange={(e) => setFormData({ ...formData, starting_balance: Number(e.target.value) })}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4"
                                >
                                    <Label>What is your primary financial goal?</Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: 'save', label: 'Aggressive Saving', desc: 'Focus on maximizing your net worth.' },
                                            { id: 'control', label: 'Control Spending', desc: 'Learn to live within your means.' },
                                            { id: 'recover', label: 'Debt Recovery', desc: 'Prioritize balance over leisure.' },
                                        ].map((goal) => (
                                            <button
                                                key={goal.id}
                                                onClick={() => setFormData({ ...formData, financial_goal: goal.id })}
                                                className={`p-4 rounded-2xl border text-left transition-all ${formData.financial_goal === goal.id ? 'border-indigo-500 bg-indigo-50/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}`}
                                            >
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{goal.label}</p>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{goal.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4"
                                >
                                    <Label>Your spending personality?</Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: 'frugal', label: 'The Optimizer', desc: 'Careful planning of every cent.' },
                                            { id: 'balanced', label: 'Modern Balanced', desc: 'Value experiences and stability.' },
                                            { id: 'impulsive', label: 'Spontaneous', desc: 'Living for the moment.' },
                                        ].map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => setFormData({ ...formData, personality: p.id })}
                                                className={`p-4 rounded-2xl border text-left transition-all ${formData.personality === p.id ? 'border-indigo-500 bg-indigo-50/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}`}
                                            >
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{p.label}</p>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{p.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <button
                            onClick={async () => {
                                onClose(); // Close immediately for UX
                                try {
                                    console.log("[CLIENT] Skipping onboarding setup...");
                                    const promise = updateProfile({ ...formData, onboarding_completed: true });
                                    toast.promise(promise, {
                                        loading: 'Saving preference...',
                                        success: () => {
                                            router.refresh();
                                            return 'Onboarding skipped';
                                        },
                                        error: 'Failed to skip permanently'
                                    });
                                    await promise;
                                } catch (err) {
                                    console.error("[CLIENT] Skip Onboarding Fatal Error:", err);
                                }
                            }}
                            className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-colors"
                        >
                            Skip setup
                        </button>
                        <Button
                            onClick={handleNext}
                            disabled={loading}
                            className="rounded-full px-8 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900"
                        >
                            {loading ? "Saving..." : (step === totalSteps ? "Finish" : "Next")}
                            {step < totalSteps && <ChevronRight className="w-4 h-4 ml-2" />}
                            {step === totalSteps && <Check className="w-4 h-4 ml-2" />}
                        </Button>
                    </div>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800">
                    <motion.div
                        className="h-full bg-indigo-500"
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>
            </motion.div>
        </div>
    );
}
