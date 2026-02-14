PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`currency_pref` text DEFAULT 'USD',
	`monthly_budget` integer DEFAULT 1000,
	`monthly_income` real DEFAULT 0,
	`fixed_expenses` real DEFAULT 0,
	`savings_target` real DEFAULT 0,
	`current_savings` real DEFAULT 0,
	`debt_balance` real DEFAULT 0,
	`overdraft_count` integer DEFAULT 0,
	`financial_goal` text,
	`personality` text,
	`starting_balance` integer DEFAULT 0,
	`gemini_api_key` text,
	`ai_enabled` integer DEFAULT true,
	`onboarding_completed` integer DEFAULT false,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_profiles`("id", "currency_pref", "monthly_budget", "monthly_income", "fixed_expenses", "savings_target", "current_savings", "debt_balance", "overdraft_count", "financial_goal", "personality", "starting_balance", "gemini_api_key", "ai_enabled", "onboarding_completed", "created_at") SELECT "id", "currency_pref", "monthly_budget", "monthly_income", "fixed_expenses", "savings_target", "current_savings", "debt_balance", "overdraft_count", "financial_goal", "personality", "starting_balance", "gemini_api_key", "ai_enabled", "onboarding_completed", "created_at" FROM `profiles`;--> statement-breakpoint
DROP TABLE `profiles`;--> statement-breakpoint
ALTER TABLE `__new_profiles` RENAME TO `profiles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`category` text,
	`merchant` text,
	`description` text,
	`date` text DEFAULT CURRENT_DATE,
	`is_subscription` integer DEFAULT false,
	`receipt_url` text,
	`ai_raw_json` text,
	`ai_reasoning` text,
	`ai_confidence` text,
	`is_immutable` integer DEFAULT false,
	`deleted_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "user_id", "amount", "type", "category", "merchant", "description", "date", "is_subscription", "receipt_url", "ai_raw_json", "ai_reasoning", "ai_confidence", "is_immutable", "deleted_at", "created_at") SELECT "id", "user_id", "amount", "type", "category", "merchant", "description", "date", "is_subscription", "receipt_url", "ai_raw_json", "ai_reasoning", "ai_confidence", "is_immutable", "deleted_at", "created_at" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;--> statement-breakpoint
ALTER TABLE `categories` ADD `type` text DEFAULT 'expense' NOT NULL;