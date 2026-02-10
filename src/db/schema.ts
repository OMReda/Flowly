import { sql } from "drizzle-orm";
import { text, integer, sqliteTable, real } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
    id: text("id").primaryKey(), // Simple single user for now or linking to auth
    currency_pref: text("currency_pref").default("USD"),
    monthly_budget: integer("monthly_budget").default(1000),
    monthly_income: integer("monthly_income"),
    fixed_expenses: integer("fixed_expenses"),
    financial_goal: text("financial_goal"), // 'save' | 'control' | 'recover'
    personality: text("personality"), // 'frugal' | 'impulsive' | 'balanced'
    starting_balance: integer("starting_balance").default(0),
    gemini_api_key: text("gemini_api_key"),
    ai_enabled: integer("ai_enabled", { mode: "boolean" }).default(true),
    onboarding_completed: integer("onboarding_completed", { mode: "boolean" }).default(false),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const categories = sqliteTable("categories", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    icon_name: text("icon_name"),
    color_hex: text("color_hex"),
    type: text("type").notNull().default("expense"), // 'expense' | 'income'
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    email: text("email").unique().notNull(),
    password_hash: text("password_hash").notNull(),
    name: text("name"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const transactions = sqliteTable("transactions", {
    id: text("id").primaryKey(),
    user_id: text("user_id").references(() => users.id), // Link to user
    amount: real("amount").notNull(),
    type: text("type").notNull(), // 'expense' | 'income'
    category: text("category"),
    merchant: text("merchant"),
    description: text("description"),
    date: text("date").default(sql`CURRENT_DATE`),
    is_subscription: integer("is_subscription", { mode: "boolean" }).default(false),
    receipt_url: text("receipt_url"),
    ai_raw_json: text("ai_raw_json"), // Store JSON as string
    ai_reasoning: text("ai_reasoning"),
    ai_confidence: text("ai_confidence"), // 'low', 'medium', 'high'
    is_immutable: integer("is_immutable", { mode: "boolean" }).default(false),
    deleted_at: text("deleted_at"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const audit_logs = sqliteTable("audit_logs", {
    id: text("id").primaryKey(),
    user_id: text("user_id").references(() => users.id),
    entity_type: text("entity_type").notNull(), // 'transaction', 'profile'
    entity_id: text("entity_id").notNull(),
    action: text("action").notNull(), // 'create', 'update', 'delete', 'soft_delete'
    previous_data: text("previous_data"), // JSON string
    new_data: text("new_data"), // JSON string
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
