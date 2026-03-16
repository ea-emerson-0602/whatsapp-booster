-- Run this in your Supabase SQL Editor (supabase.com > your project > SQL Editor)

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────
create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text not null,
  tag text check (tag in ('Lead', 'Paid', 'Pending')) default 'Lead',
  notes text,
  last_message_at timestamptz,
  created_at timestamptz default now()
);

-- Each business owner can only see their own customers
alter table public.customers enable row level security;
create policy "Users can manage their own customers"
  on public.customers for all
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete cascade not null,
  body text not null,
  direction text check (direction in ('inbound', 'outbound')) not null,
  status text check (status in ('queued', 'sent', 'delivered', 'failed')) default 'queued',
  twilio_sid text,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;
create policy "Users can manage their own messages"
  on public.messages for all
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- TEMPLATES (auto-reply keyword rules)
-- ─────────────────────────────────────────
create table public.templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  trigger_keywords text[] not null,
  reply_body text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.templates enable row level security;
create policy "Users can manage their own templates"
  on public.templates for all
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- BROADCASTS
-- ─────────────────────────────────────────
create table public.broadcasts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  message_body text not null,
  scheduled_at timestamptz not null,
  target_tags text[],
  status text check (status in ('scheduled', 'sending', 'sent', 'failed')) default 'scheduled',
  sent_count integer default 0,
  created_at timestamptz default now()
);

alter table public.broadcasts enable row level security;
create policy "Users can manage their own broadcasts"
  on public.broadcasts for all
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- SUBSCRIPTIONS (Stripe)
-- ─────────────────────────────────────────
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text check (status in ('active', 'trialing', 'past_due', 'canceled')) default 'trialing',
  plan text default 'starter',
  current_period_end timestamptz,
  created_at timestamptz default now()
);

alter table public.subscriptions enable row level security;
create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);
