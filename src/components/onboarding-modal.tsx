"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, X, Plus, Minus, Sparkles, MoveRight } from "lucide-react";
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
        monthly_income: 5000,
        fixed_expenses: 1500,
        starting_balance: 2500,
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
                await updateProfile({ ...formData, onboarding_completed: true });
                window.scrollTo(0, 0);
                toast.success("Welcome to the new standard of wealth.");
                onClose();
                router.refresh();
            } catch (err: any) {
                console.error("[CLIENT] Onboarding failed:", err);
                toast.error(err.message || "Failed to save profile.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] bg-zinc-950 flex flex-col md:flex-row overflow-hidden">
            {/* Immersive Visual Panel */}
            <div className="relative w-full md:w-[45%] h-[40vh] md:h-full bg-black flex items-center justify-center p-12 overflow-hidden border-b md:border-b-0 md:border-r border-zinc-900">
                {/* Visual Engine: The Glass Core */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.15, 0.25, 0.15],
                            rotate: [0, 90, 180, 270, 360]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(16,185,129,0.1),transparent)]"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)]" />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    {/* The Core Asset */}
                    <div className="relative w-48 h-48 md:w-64 md:h-64 mb-12 group">
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                                y: [-10, 10, -10]
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 rounded-full bg-emerald-500/20 blur-[60px]"
                        />
                        <div className="absolute inset-0 rounded-full border border-emerald-500/10 bg-gradient-to-tr from-emerald-500/5 to-transparent backdrop-blur-3xl shadow-[inset_0_0_80px_rgba(16,185,129,0.1)] overflow-hidden">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_30%,_rgba(16,185,129,0.4)_0%,_transparent_50%)]"
                            />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-16 h-16 text-emerald-500/80 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" strokeWidth={1} />
                        </div>
                    </div>

                    <div className="text-center space-y-4 max-w-sm">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                                className="space-y-4"
                            >
                                <h1 className="text-4xl md:text-5xl font-serif text-white leading-tight">
                                    {step === 1 && <>Set your <span className="italic text-emerald-400">baseline.</span></>}
                                    {step === 2 && <>Target your <span className="italic text-emerald-400">horizon.</span></>}
                                    {step === 3 && <>Refine your <span className="italic text-emerald-400">impulse.</span></>}
                                </h1>
                                <p className="text-xs text-zinc-500 uppercase tracking-[0.4em] font-medium leading-relaxed">
                                    {step === 1 && "The foundation of intelligent wealth management starts with clarity."}
                                    {step === 2 && "Determine the primary focus of your financial journey."}
                                    {step === 3 && "Align the interface to match your natural spending patterns."}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Step Indicators Vertical (Desktop) */}
                <div className="hidden md:flex absolute left-12 bottom-12 flex-col gap-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-4 group">
                            <div className={`h-10 w-[2px] transition-colors rounded-full ${step === s ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${step === s ? 'text-white' : 'text-zinc-600 opacity-50'}`}>
                                0{s}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Interactive Form Panel */}
            <div className="flex-1 relative overflow-y-auto bg-black flex flex-col">
                <div className="max-w-xl self-center w-full px-8 py-16 md:py-24 space-y-16 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-center relative z-20">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Section Preview</p>
                            <h2 className="text-2xl font-serif text-white tracking-tight">Configuration Mode</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full border border-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="space-y-12"
                            >
                                {step === 1 && (
                                    <div className="space-y-12">
                                        {[
                                            { id: 'monthly_income', label: 'Monthly Post-Tax Income', sub: 'Your net take-home revenue.', step: 100 },
                                            { id: 'fixed_expenses', label: 'Primary Fixed Expenses', sub: 'Rent, debts, and essential bills.', step: 50 },
                                            { id: 'starting_balance', label: 'Liquid Available Liquidity', sub: 'Cash currently accessible in your ledger.', step: 100 },
                                        ].map((input) => (
                                            <div key={input.id} className="group">
                                                <div className="mb-6">
                                                    <Label className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase group-focus-within:text-emerald-500 transition-colors uppercase">{input.label}</Label>
                                                    <p className="text-[10px] text-zinc-700 font-bold uppercase mt-1 transition-colors group-focus-within:text-zinc-500">{input.sub}</p>
                                                </div>
                                                <div className="flex items-center gap-6 border-b border-zinc-900 pb-4 group-focus-within:border-emerald-500 transition-all duration-500">
                                                    <span className="text-4xl font-serif text-zinc-800 transition-colors group-focus-within:text-emerald-500/50">$</span>
                                                    <input
                                                        type="number"
                                                        value={formData[input.id as keyof typeof formData]}
                                                        onChange={(e) => setFormData({ ...formData, [input.id]: Number(e.target.value) })}
                                                        className="flex-1 bg-transparent border-none outline-none text-5xl font-serif text-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    <div className="flex gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setFormData(prev => ({ ...prev, [input.id]: Math.max(0, (prev[input.id as keyof typeof formData] as number) - input.step) }))}
                                                            className="w-12 h-12 rounded-full border border-zinc-900 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all active:scale-90"
                                                        >
                                                            <Minus className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setFormData(prev => ({ ...prev, [input.id]: (prev[input.id as keyof typeof formData] as number) + input.step }))}
                                                            className="w-12 h-12 rounded-full border border-zinc-900 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all active:scale-90"
                                                        >
                                                            <Plus className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8">
                                        {[
                                            { id: 'save', label: 'Aggressive Capitalization', desc: 'Focus on maximum asset accumulation.' },
                                            { id: 'control', label: 'Measured Consumption', desc: 'Strategic spending hygiene and limits.' },
                                            { id: 'recover', label: 'Strategic Resolution', desc: 'Aggressive debt clearing and repair.' },
                                        ].map((goal) => (
                                            <button
                                                key={goal.id}
                                                onClick={() => setFormData({ ...formData, financial_goal: goal.id })}
                                                className={`w-full p-8 rounded-[40px] text-left transition-all border-2 relative overflow-hidden group ${formData.financial_goal === goal.id ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-zinc-950/50 border-zinc-900 hover:border-zinc-800'}`}
                                            >
                                                <div className="flex justify-between items-center relative z-10">
                                                    <div className="space-y-2">
                                                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${formData.financial_goal === goal.id ? 'text-emerald-400' : 'text-zinc-600'}`}>{goal.label}</p>
                                                        <p className="text-sm font-serif text-white">{goal.desc}</p>
                                                    </div>
                                                    {formData.financial_goal === goal.id && (
                                                        <motion.div
                                                            layoutId="goal-select"
                                                            className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                                        >
                                                            <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-8">
                                        {[
                                            { id: 'frugal', label: 'The Optimizer', desc: 'Every transaction is calculated and purposeful.' },
                                            { id: 'balanced', label: 'The Architect', desc: 'Balancing premium experiences with longevity.' },
                                            { id: 'impulsive', label: 'The Explorer', desc: 'Growth through spontaneous real-life investments.' },
                                        ].map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => setFormData({ ...formData, personality: p.id })}
                                                className={`w-full p-8 rounded-[40px] text-left transition-all border-2 relative overflow-hidden group ${formData.personality === p.id ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-zinc-950/50 border-zinc-900 hover:border-zinc-800'}`}
                                            >
                                                <div className="flex justify-between items-center relative z-10">
                                                    <div className="space-y-2">
                                                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${formData.personality === p.id ? 'text-emerald-400' : 'text-zinc-600'}`}>{p.label}</p>
                                                        <p className="text-sm font-serif text-white">{p.desc}</p>
                                                    </div>
                                                    {formData.personality === p.id && (
                                                        <motion.div
                                                            layoutId="personality-select"
                                                            className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                                        >
                                                            <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="space-y-6 pt-12">
                        <Button
                            onClick={handleNext}
                            disabled={loading}
                            className="w-full h-20 rounded-full bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] shadow-[0_20px_40px_rgba(255,255,255,0.05)] hover:bg-emerald-500 hover:text-white transition-all active:scale-[0.98] group"
                        >
                            {loading ? "Aligning Intelligence..." : (step === totalSteps ? "Synchronize Account" : "Proceed to Next Node")}
                            <MoveRight className="w-5 h-5 ml-4 transition-transform group-hover:translate-x-2" />
                        </Button>
                        <div className="flex justify-center">
                            <button
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        await updateProfile({ ...formData, onboarding_completed: true });
                                        window.scrollTo(0, 0);
                                        onClose();
                                        router.refresh();
                                    } catch (err) {
                                        console.error(err);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] hover:text-emerald-500 transition-colors"
                            >
                                Skip this part
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress Strip Bottom */}
                <div className="h-2 bg-zinc-900">
                    <motion.div
                        className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)]"
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
