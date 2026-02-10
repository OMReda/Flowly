import { Wallet } from "lucide-react";

export function EmptyState({ hasAiKey = false }: { hasAiKey?: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/20">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
                <Wallet className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-serif text-zinc-900 dark:text-zinc-50 mb-2">
                Your Ledger is Empty
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 text-sm leading-relaxed">
                {hasAiKey ? (
                    <>
                        Start by adding your first transaction above. Try typing
                        <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded mx-1 text-emerald-600 dark:text-emerald-400">
                            "Lunch at Cafe for $12"
                        </span>
                        to see the AI in action.
                    </>
                ) : (
                    <>
                        Start by adding your first transaction using the
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 mx-1">Manual Entry</span>
                        option above, or enable AI in settings for natural language support.
                    </>
                )}
            </p>
        </div>
    );
}
