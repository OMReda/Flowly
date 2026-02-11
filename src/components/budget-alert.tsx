"use client";

import { useEffect } from "react";

interface BudgetAlertProps {
    totalSpent: number;
    budget: number;
}

export function BudgetAlert({ totalSpent, budget }: BudgetAlertProps) {
    useEffect(() => {
        const checkBudget = async () => {
            if (totalSpent > budget) {
                // 1. Check Browser Support
                if (!("Notification" in window)) {
                    console.log("This browser does not support desktop notification");
                    return;
                }

                // 2. Request Permission
                if (Notification.permission === "granted") {
                    sendNotification();
                } else if (Notification.permission !== "denied") {
                    const permission = await Notification.requestPermission();
                    if (permission === "granted") {
                        sendNotification();
                    }
                }
            }
        };

        const sendNotification = () => {
            const notification = new Notification("Flowly Alert 🚨", {
                body: `You've exceeded your budget of $${budget}. Total: $${totalSpent.toFixed(2)}`,
                icon: "/favicon.ico", // Ensure this exists or use a placeholder
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        };

        checkBudget();
    }, [totalSpent, budget]);

    return null; // Logic only
}
