"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="rounded-full opacity-50 cursor-default">
                <Moon className="w-5 h-5 text-zinc-400" />
            </Button>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="rounded-full relative overflow-hidden"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme}
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                >
                    {theme === "dark" ? (
                        <Sun className="w-5 h-5 text-zinc-400 hover:text-zinc-100 transition-colors" />
                    ) : (
                        <Moon className="w-5 h-5 text-zinc-400 hover:text-zinc-900 transition-colors" />
                    )}
                </motion.div>
            </AnimatePresence>
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
