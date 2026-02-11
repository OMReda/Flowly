import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { desc, eq, and, isNull } from "drizzle-orm";
import { ArchiveView } from "@/components/archive-view";
import { PageTransitionWrapper } from "@/components/page-transition-wrapper";
import { Transaction } from "@/lib/types";

export default async function ArchivePage() {
    const session = await auth();
    if (!session?.user?.id) return redirect("/login");

    const userId = session.user.id;
    const allTransactions = await db
        .select()
        .from(transactions)
        .where(
            and(
                eq(transactions.user_id, userId),
                isNull(transactions.deleted_at)
            )
        )
        .orderBy(desc(transactions.date))
        .all() as Transaction[];

    return (
        <PageTransitionWrapper>
            <ArchiveView transactions={allTransactions} />
        </PageTransitionWrapper>
    );
}
