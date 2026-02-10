"use client";

import { motion, useSpring, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

interface NumberFlowProps {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    className?: string;
}

export function NumberFlow({ value, prefix = "", suffix = "", decimals = 2, className = "" }: NumberFlowProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const controls = animate(displayValue, value, {
            duration: 1,
            ease: "easeOut",
            onUpdate: (latest) => setDisplayValue(latest)
        });
        return () => controls.stop();
    }, [value]);

    return (
        <span className={className}>
            {prefix}{isMounted ? displayValue.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }) : displayValue.toFixed(decimals)}{suffix}
        </span>
    );
}
