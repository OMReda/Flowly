"use client";

import { processFinance } from "@/app/actions/process-finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Upload, Keyboard, Settings } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

function SubmitButton({ disabled }: { disabled?: boolean }) {
    const { pending } = useFormStatus();

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Button
                type="submit"
                size="icon"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 shrink-0 disabled:opacity-50 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 shadow-md hover:shadow-lg transition-all"
                style={{ boxShadow: '0 4px 14px 0 rgb(16 185 129 / 0.39)' }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (!e.currentTarget.disabled) {
                        e.currentTarget.style.boxShadow = 'var(--glow-emerald-strong)';
                    }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.boxShadow = '0 4px 14px 0 rgb(16 185 129 / 0.39)';
                }}
                disabled={pending || disabled}
            >
                {pending ? (
                    <Sparkles className="w-4 h-4 animate-spin text-white" />
                ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                )}
                <span className="sr-only">Analyze</span>
            </Button>
        </motion.div>
    );
}

import { ManualEntryForm } from "./manual-entry-form";

export function CommandBar({ hasAiKey = false, onImportCSV }: { hasAiKey?: boolean; onImportCSV?: () => void }) {
    const formRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showManual, setShowManual] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "/" && document.activeElement !== inputRef.current) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto relative">
            {/* Search Bar Container */}
            <div className="relative group z-20 mb-4">
                <div className={`absolute -inset-1 bg-gradient-to-r ${hasAiKey ? 'from-emerald-500 to-teal-500' : 'from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700'} rounded-full blur opacity-15 group-hover:opacity-30 transition duration-1000 group-hover:duration-200`}></div>
                <form
                    ref={formRef}
                    action={async (formData) => {
                        setError(null);
                        setIsProcessing(true);
                        const result = await processFinance(formData);
                        setIsProcessing(true); // Artificial delay for feel
                        setTimeout(async () => {
                            setIsProcessing(false);
                            if (result?.error) {
                                setError(result.error);
                            } else {
                                formRef.current?.reset();
                                setFileName(null);
                            }
                        }, 800);
                    }}
                    className={`relative flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-xl transition-all ${isProcessing ? 'overflow-hidden' : 'focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500'} `}
                >
                    {isProcessing && (
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent"
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        />
                    )}
                    <div className="ml-3 shrink-0 relative">
                        <Search className="w-5 h-5 text-zinc-400" />
                        {!hasAiKey && <div className="absolute -top-1 -right-1 w-2 h-2 bg-zinc-300 dark:bg-zinc-700 rounded-full border-2 border-white dark:border-zinc-900" />}
                    </div>

                    <Input
                        name="input"
                        ref={inputRef}
                        disabled={!hasAiKey}
                        className={`flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent text-[19px] placeholder:text-zinc-400 h-10 px-2 font-medium ${!hasAiKey ? 'cursor-not-allowed opacity-50' : ''}`}
                        placeholder={hasAiKey ? "Search transactions..." : "AI Extraction Locked (Check Settings)"}
                        autoComplete="off"
                    />

                    <input
                        type="file"
                        name="file"
                        id="receipt-upload"
                        className="hidden"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!hasAiKey}
                        className={`p-2 rounded-full transition-colors shrink-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${fileName ? 'text-emerald-600' : 'text-zinc-400'} ${!hasAiKey ? 'cursor-not-allowed opacity-30' : ''}`}
                        title={hasAiKey ? "Upload Receipt" : "AI Extraction Locked"}
                    >
                        <Upload className="w-5 h-5" />
                    </button>

                    <SubmitButton disabled={!hasAiKey} />
                </form>
            </div>

            {/* Error / File Status Messages */}
            <div className="min-h-[1.5rem] mb-4"> {/* Reserve height to prevent layout jump */}
                {error && (
                    <p className="text-center text-xs text-rose-500 animate-pulse">
                        {error}
                    </p>
                )}
                {!error && fileName && (
                    <p className="text-center text-xs text-emerald-600">
                        File attached: {fileName}
                    </p>
                )}
            </div>

            {/* Action Row: Primary Action (Left) & Secondary Toggles (Right) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                {/* Primary Actions */}
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ y: -2, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowManual(!showManual)}
                        className={`text-xs transition-colors font-medium flex items-center gap-1 ${!hasAiKey ? 'text-emerald-600 hover:text-emerald-700 underline underline-offset-8 decoration-emerald-500/30' : 'text-zinc-500 hover:text-emerald-600'}`}
                    >
                        {showManual ? "Close entry ledger" : "Add transaction manually"}
                    </motion.button>
                    {onImportCSV && (
                        <motion.button
                            whileHover={{ y: -2, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onImportCSV}
                            className="text-xs transition-colors font-medium flex items-center gap-1 text-zinc-500 hover:text-emerald-600"
                        >
                            Import CSV
                        </motion.button>
                    )}
                </div>

                {/* Secondary Toggles Group */}
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${hasAiKey ? 'bg-emerald-100/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-zinc-50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}>
                        <Sparkles className="w-2.5 h-2.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{hasAiKey ? "AI Assist Enabled" : "AI Assist Off"}</span>
                    </div>

                    {!hasAiKey && (
                        <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 text-zinc-400">
                            <Settings className="w-2.5 h-2.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Enable Insights</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1 text-[10px] text-zinc-300 font-bold uppercase tracking-widest bg-zinc-50 dark:bg-zinc-900/50 px-2 py-0.5 rounded-full border border-zinc-100 dark:border-zinc-800">
                        <Keyboard className="w-2.5 h-2.5" />
                        <span>/ to focus</span>
                    </div>
                </div>
            </div>

            {/* Manual Entry Form - Inline Dropdown */}
            <AnimatePresence>
                {showManual && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{
                            opacity: 1,
                            height: "auto",
                            transitionEnd: { overflow: "visible" }
                        }}
                        exit={{
                            opacity: 0,
                            height: 0,
                            overflow: "hidden"
                        }}
                        transition={{
                            height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                            opacity: { duration: 0.3 }
                        }}
                        className="overflow-hidden bg-transparent"
                    >
                        {/* Balanced Spacing: Tight but breathable for animations */}
                        <div className="pt-6 pb-6">
                            <ManualEntryForm onComplete={() => setShowManual(false)} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
