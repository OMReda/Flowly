import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
                <FileQuestion className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-50 mb-2">
                Page Not Found
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link href="/">
                <Button className="rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Dashboard
                </Button>
            </Link>
        </div>
    );
}
