export interface Category {
    id: string;
    name: string;
    icon_name: string | null;
    color_hex: string | null;
    type: 'expense' | 'income';
    created_at?: string | null;
}

export interface Transaction {
    id: string;
    user_id: string | null;
    amount: number;
    type: 'expense' | 'income';
    category: string | null;
    merchant: string | null;
    description: string | null;
    date: string | null;
    is_subscription: boolean | null;
    receipt_url: string | null;
    ai_raw_json: string | null;
    ai_reasoning: string | null;
    ai_confidence: 'low' | 'medium' | 'high' | null;
    is_immutable: boolean | null;
    deleted_at: string | null;
    created_at?: string | null;
}

export interface UserProfile {
    id: string;
    currency_pref: string | null;
    monthly_budget: number | null;
    monthly_income: number | null;
    fixed_expenses: number | null;
    financial_goal: string | null;
    personality: string | null;
    starting_balance: number | null;
    gemini_api_key: string | null;
    ai_enabled: boolean | null;
    onboarding_completed: boolean | null;
    created_at?: string | null;
}

export interface User {
    id: string;
    email: string;
    name: string | null;
    created_at?: string | null;
}
