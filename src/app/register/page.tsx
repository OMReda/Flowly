"use client";

import { register } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Moon, Check } from "lucide-react";
import { AuthHero } from "@/components/auth-hero";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
    const [state, action, isPending] = useActionState(register, null);
    const router = useRouter();
    const [passwordValue, setPasswordValue] = useState("");

    useEffect(() => {
        if (state?.success) {
            router.push("/login");
        }
    }, [state?.success, router]);

    const requirements = [
        { label: "Minimum 8 characters", met: passwordValue.length >= 8 },
        { label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(passwordValue) },
        { label: "At least one numerical digit (0-9)", met: /[0-9]/.test(passwordValue) },
        { label: "At least one special character (!@#$%^&*)", met: /[^A-Za-z0-9]/.test(passwordValue) },
    ];

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50">
            <AuthHero />

            {/* Right Side: Form Section */}
            <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 relative">
                <div className="absolute top-8 right-8">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Moon className="w-5 h-5 text-zinc-400" />
                    </Button>
                </div>

                <div className="w-full max-w-sm space-y-10">
                    <div className="space-y-3">
                        <motion.h2
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-serif"
                        >
                            Create Account
                        </motion.h2>
                        <p className="text-[10px] tracking-[0.2em] font-medium text-zinc-400 uppercase">
                            Begin your journey with Flowly
                        </p>
                    </div>

                    <form action={action} className="space-y-8">
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
                                    Full Name
                                </label>
                                <Input
                                    name="name"
                                    type="text"
                                    placeholder="Enter your name"
                                    className="h-12 bg-transparent border-0 border-b border-zinc-200 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500 dark:focus-visible:border-emerald-400 transition-all text-base placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                                    required
                                />
                            </div>

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
                                    value={passwordValue}
                                    onChange={(e) => setPasswordValue(e.target.value)}
                                    className="h-12 bg-transparent border-0 border-b border-zinc-200 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500 dark:focus-visible:border-emerald-400 transition-all text-base"
                                    required
                                    minLength={8}
                                    pattern="(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}"
                                    title="Must contain at least 8 characters, including one uppercase letter, one number, and one special character."
                                />
                                <div className="space-y-2 mt-4">
                                    <p className="text-[9px] text-zinc-400 font-bold tracking-[0.15em] uppercase">
                                        Vault Integrity Checklist
                                    </p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {requirements.map((req, idx) => (
                                            <div key={idx} className="flex items-center gap-2 transition-all duration-300">
                                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all duration-500 ${req.met ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-200 dark:border-zinc-800'}`}>
                                                    {req.met && <Check className="w-2 h-2 text-white" strokeWidth={4} />}
                                                </div>
                                                <span className={`text-[10px] font-medium transition-colors duration-500 ${req.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <motion.div initial="rest" whileHover="hover" animate="rest" className="w-full relative overflow-hidden group">
                            <Button
                                className="w-full h-14 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-none flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-all relative overflow-hidden active:scale-[0.98] hover:bg-zinc-900 dark:hover:bg-zinc-100"
                                type="submit"
                                disabled={isPending}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isPending ? "Creating Account..." : "Sign Up"}
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

                    <p className="text-[11px] text-center text-zinc-400 font-medium">
                        Already have an account?{" "}
                        <Link href="/login" className="text-zinc-900 dark:text-zinc-100 font-bold hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline underline-offset-4 transition-all">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
