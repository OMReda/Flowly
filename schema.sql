-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  currency_pref text default 'USD',
  monthly_budget numeric default 1000.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CATEGORIES TABLE
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  icon_name text,
  color_hex text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TIMESTAMPS FOR CATEGORIES
-- (Optional: Add RLS policies later)

-- TRANSACTIONS TABLE
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  type text check (type in ('expense', 'income')) not null,
  amount numeric not null,
  category text, -- references categories(name) or just text? Prompt says "category" in JSON. Let's keep it flexible as text or link to categories.id. Prompt schema: "category"
  merchant text,
  description text,
  date date default current_date,
  is_subscription boolean default false,
  receipt_url text,
  ai_raw_json jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Basic)
alter table profiles enable row level security;
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

alter table transactions enable row level security;
create policy "Users can view their own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert their own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update their own transactions" on transactions for update using (auth.uid() = user_id);
create policy "Users can delete their own transactions" on transactions for delete using (auth.uid() = user_id);

-- SEED DATA FOR CATEGORIES
insert into categories (name, icon_name, color_hex) values
('Food', 'utensils', '#F59E0B'),
('Transport', 'car', '#3B82F6'),
('Utilities', 'lightbulb', '#10B981'),
('Entertainment', 'film', '#8B5CF6'),
('Shopping', 'shopping-bag', '#EC4899'),
('Health', 'heart', '#EF4444'),
('Other', 'more-horizontal', '#6B7280');
