"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Sparkles, Key, Save, Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/user";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { UserProfile } from "@/lib/types";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile | null;
}

export function SettingsModal({ isOpen, onClose, userProfile }: SettingsModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [apiKey, setApiKey] = useState(userProfile?.gemini_api_key || "");
    const [aiEnabled, setAiEnabled] = useState(userProfile?.ai_enabled !== false); // Default to true if not set

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateProfile({
            ...userProfile,
            gemini_api_key: apiKey,
            ai_enabled: aiEnabled,
        });
        setIsSaving(false);

        if (result.success) {
            toast.success("Settings updated successfully");
            onClose();
        } else {
            toast.error(result.error || "Failed to update settings");
        }
    };

    const containerVariants = {
        hidden: {
            opacity: 0,
            scale: 0.98
        },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 300,
                damping: 30,
                staggerChildren: 0.05
            }
        },
        exit: {
            opacity: 0,
            scale: 0.987,
            transition: {
                duration: 0.15,
                ease: "easeOut" as const
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 4 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.2 }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] rounded-[32px] p-0 overflow-hidden border-none bg-transparent shadow-none">
                <AnimatePresence mode="wait">
                    {isOpen && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[32px] p-8 space-y-10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] relative overflow-hidden"
                        >
                            {/* Subtle premium gradient */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />

                            <motion.div variants={itemVariants}>
                                <DialogHeader className="space-y-3">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-[18px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-md">
                                            <Settings className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-2xl font-serif tracking-tight text-zinc-900 dark:text-zinc-50">Settings</DialogTitle>
                                            <DialogDescription className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                                                System Preferences
                                            </DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>
                            </motion.div>

                            <div className="space-y-8">
                                <motion.div variants={itemVariants} className="space-y-4">
                                    <Label htmlFor="api-key" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 pl-1">
                                        Gemini API Key
                                    </Label>
                                    <Input
                                        id="api-key"
                                        type="password"
                                        placeholder="Paste key..."
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800 rounded-2xl h-12 focus-visible:ring-zinc-900/5 dark:focus-visible:ring-white/5 focus-visible:border-zinc-200 dark:focus-visible:border-zinc-700 transition-all font-mono text-xs px-5 shadow-sm"
                                    />
                                    <p className="text-[10px] text-zinc-400 italic text-center opacity-70">
                                        Add transaction manually
                                    </p>
                                </motion.div>

                                <motion.div variants={itemVariants} className="pt-8 border-t border-zinc-50 dark:border-zinc-900 space-y-6">
                                    <div className="flex items-center justify-between px-1">
                                        <div className="space-y-0.5">
                                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Enable Insights</Label>
                                            <p className="text-[9px] text-zinc-400">Proactive roasting & anomaly detection</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setAiEnabled(!aiEnabled)}
                                            className={`group flex items-center gap-3 px-4 py-1.5 rounded-full border transition-all duration-300 ${aiEnabled && apiKey ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600' : 'bg-transparent border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}
                                        >
                                            <Sparkles className={`w-3 h-3 ${aiEnabled && apiKey ? 'animate-pulse text-emerald-500' : 'text-zinc-300'}`} />
                                            <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${aiEnabled ? 'bg-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                                                <div className={`absolute top-0.5 bottom-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${aiEnabled ? 'left-[18px]' : 'left-0.5'}`} />
                                            </div>
                                        </button>
                                    </div>

                                </motion.div>
                            </div>

                            <motion.div variants={itemVariants} className="pt-2">
                                <DialogFooter className="sm:justify-between items-center gap-6">
                                    <button
                                        onClick={onClose}
                                        className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors pl-1"
                                    >
                                        Close
                                    </button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-emerald-600 dark:hover:bg-emerald-400 px-8 h-12 text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98]"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-3.5 h-3.5 mr-2" /> Sync Changes
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
