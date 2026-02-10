"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-50 mb-2">
                Something went wrong
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
                We encountered an unexpected error while loading your financial data.
            </p>
            <div className="flex gap-4">
                <Button
                    onClick={() => reset()}
                    className="rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-emerald-600 dark:hover:bg-emerald-400"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                </Button>
                <Button
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    className="rounded-full"
                >
                    Go Home
                </Button>
            </div>
        </div>
    );
}
