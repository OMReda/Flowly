import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6 animate-pulse">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Synchronizing Ledger...
            </p>
        </div>
    );
}
