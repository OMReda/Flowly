"use client";

import { authenticate } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, ArrowRight, Check } from "lucide-react";
import { AuthHero } from "@/components/auth-hero";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
    const [state, action, isPending] = useActionState(authenticate, null);
    const [keepSignedIn, setKeepSignedIn] = useState(false);

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-zinc-950 font-sans transition-colors duration-500">
            <AuthHero />

            {/* Right Side: Form Section */}
            <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 relative">
                <div className="absolute top-8 right-8">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-sm space-y-10">
                    <div className="space-y-3">
                        <motion.h2
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-serif text-zinc-900 dark:text-zinc-100"
                        >
                            Sign In
                        </motion.h2>
                        <p className="text-[10px] tracking-[0.2em] font-medium text-zinc-400 uppercase">
                            Welcome back to Flowly
                        </p>
                    </div>

                    <form action={action} className="space-y-8">
                        <input type="hidden" name="keepSignedIn" value={String(keepSignedIn)} />
                        <AnimatePresence mode="wait">
                            {state?.error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-lg flex items-center gap-3"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {state.error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-6">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase transition-colors group-focus-within:text-emerald-500">
                                    Email Address
                                </label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="h-12 bg-transparent border-0 border-b border-zinc-200 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500 dark:focus-visible:border-emerald-400 transition-all text-base placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                                    required
                                />
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase transition-colors group-focus-within:text-emerald-500">
                                    Password
                                </label>
                                <Input
                                    name="password"
                                    type="password"
                                    className="h-12 bg-transparent border-0 border-b border-zinc-200 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500 dark:focus-visible:border-emerald-400 transition-all text-base"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
                            <button
                                type="button"
                                onClick={() => setKeepSignedIn(!keepSignedIn)}
                                className="flex items-center gap-2 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                            >
                                <div className={`w-4 h-4 border border-zinc-300 dark:border-zinc-700 rounded flex items-center justify-center transition-colors ${keepSignedIn ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100' : ''}`}>
                                    {keepSignedIn && <Check className="w-3 h-3 text-white dark:text-zinc-900" />}
                                </div>
                                Keep me signed in
                            </button>
                            <Link href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-4 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <motion.div initial="rest" whileHover="hover" animate="rest" className="w-full relative overflow-hidden group">
                            <Button
                                className="w-full h-14 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-none flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-all relative overflow-hidden active:scale-[0.98] hover:bg-zinc-900 dark:hover:bg-zinc-100"
                                type="submit"
                                disabled={isPending}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isPending ? "Verification..." : "Sign In"}
                                    {!isPending && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                                </span>
                                <motion.div
                                    variants={{
                                        rest: { x: '-101%' },
                                        hover: { x: '0%' }
                                    }}
                                    transition={{ type: 'tween', duration: 0.4, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600"
                                />
                            </Button>
                        </motion.div>
                    </form>

                    <div className="space-y-6">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-100 dark:border-zinc-900" />
                            </div>
                            <span className="relative z-10 bg-white dark:bg-zinc-950 px-4 text-[10px] text-zinc-300 font-bold uppercase tracking-widest">
                                Or
                            </span>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button className="w-10 h-10 border border-zinc-100 dark:border-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                <div className="w-4 h-4 bg-zinc-100 dark:bg-zinc-800 rounded-sm" />
                            </button>
                            <button className="w-10 h-10 border border-zinc-100 dark:border-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                <div className="w-4 h-4 bg-zinc-100 dark:bg-zinc-800 rounded-sm" />
                            </button>
                        </div>

                        <p className="text-[11px] text-center text-zinc-400 font-medium">
                            No account yet?{" "}
                            <Link href="/register" className="text-zinc-900 dark:text-zinc-100 font-bold hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline underline-offset-4 transition-all">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
