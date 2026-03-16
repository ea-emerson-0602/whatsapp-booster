# WhatsApp Booster — Setup Guide

A step-by-step guide to go from zero to a running app.

---

## Step 1 — Install Node.js

Download and install Node.js 18+ from https://nodejs.org
Verify it works:
```
node --version   # should show v18 or higher
```

---

## Step 2 — Create the project on your computer

Open your terminal (Mac: Terminal, Windows: PowerShell) and run:

```bash
# Copy these files into a folder, then:
cd whatsapp-booster
npm install
```

This installs all the packages listed in package.json (Next.js, Supabase, Twilio, Stripe).

---

## Step 3 — Set up Supabase (your database)

1. Go to https://supabase.com and create a free account
2. Click "New project" — choose a name and a strong password
3. Wait ~2 minutes for it to provision
4. Go to: Settings > API
   - Copy "Project URL" → paste as NEXT_PUBLIC_SUPABASE_URL
   - Copy "anon public" key → paste as NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Copy "service_role" key → paste as SUPABASE_SERVICE_ROLE_KEY
5. Go to: SQL Editor > New query
   - Paste the entire contents of supabase/schema.sql
   - Click "Run" — this creates all your tables

---

## Step 4 — Set up Twilio (WhatsApp messaging)

1. Go to https://twilio.com and create a free account
2. From the Console Dashboard, copy:
   - Account SID → paste as TWILIO_ACCOUNT_SID
   - Auth Token → paste as TWILIO_AUTH_TOKEN
3. For the sandbox (testing):
   - Go to: Messaging > Try it out > Send a WhatsApp message
   - Your sandbox number is usually: +14155238886
   - Set TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
4. Configure the webhook (after deploying to Vercel in Step 7):
   - Go to: Messaging > Settings > WhatsApp sandbox settings
   - Set "When a message comes in" to: https://yourdomain.vercel.app/api/webhook/twilio

---

## Step 5 — Set up Stripe (subscriptions)

1. Go to https://stripe.com and create an account
2. In test mode (default), go to: Developers > API keys
   - Copy "Publishable key" → NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - Copy "Secret key" → STRIPE_SECRET_KEY
3. Create a product:
   - Go to: Products > Add product
   - Name: "WhatsApp Booster Starter"
   - Price: $15/month, recurring
   - Copy the Price ID (starts with "price_") → update lib/stripe.ts
4. Configure the webhook (after deploying):
   - Go to: Developers > Webhooks > Add endpoint
   - URL: https://yourdomain.vercel.app/api/webhook/stripe
   - Events to listen for: customer.subscription.created, .updated, .deleted
   - Copy "Signing secret" → STRIPE_WEBHOOK_SECRET

---

## Step 6 — Add your environment variables

Copy the example file:
```bash
cp .env.local.example .env.local
```

Open .env.local in any text editor and fill in all the values from steps 3-5.

---

## Step 7 — Run it locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.
You should see the login page. Sign up and you're in.

---

## Step 8 — Deploy to Vercel

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Create a repo on github.com, then:
   git remote add origin https://github.com/yourusername/whatsapp-booster.git
   git push -u origin main
   ```
2. Go to https://vercel.com, click "Import Project", select your GitHub repo
3. In the Vercel project settings > Environment Variables, add all the same
   variables from your .env.local file
4. Deploy. Vercel gives you a live URL like: yourapp.vercel.app
5. Go back to Twilio and Stripe and update the webhook URLs to your live domain

---

## File structure recap

```
whatsapp-booster/
├── app/
│   ├── dashboard/page.tsx      ← Main dashboard (server component)
│   ├── contacts/page.tsx       ← Contact list with tag filters
│   ├── contacts/new/page.tsx   ← Add new contact
│   ├── broadcasts/page.tsx     ← Broadcast history
│   ├── broadcasts/new/page.tsx ← Schedule a broadcast
│   ├── templates/page.tsx      ← Auto-reply rules
│   ├── templates/new/page.tsx  ← Create an auto-reply
│   ├── analytics/page.tsx      ← Stats overview
│   ├── login/page.tsx          ← Login
│   ├── signup/page.tsx         ← Signup
│   └── api/
│       ├── webhook/twilio/     ← Receives inbound WhatsApp messages
│       ├── webhook/stripe/     ← Handles Stripe subscription events
│       └── messages/send/      ← Sends outbound messages
├── components/
│   └── Sidebar.tsx             ← Navigation sidebar
├── lib/
│   ├── supabase/server.ts      ← Supabase server client
│   ├── supabase/client.ts      ← Supabase browser client
│   ├── twilio.ts               ← Twilio helpers
│   ├── stripe.ts               ← Stripe helpers
│   └── types.ts                ← TypeScript types
├── supabase/
│   └── schema.sql              ← Database tables (run this in Supabase)
├── middleware.ts               ← Auth protection for all routes
└── .env.local                  ← Your secret keys (never commit this)
```

---

## What's next (Week 2 tasks)

- [ ] Build the broadcast send logic (cron job or Vercel scheduled function)
- [ ] Add contact detail page with message history
- [ ] Add bulk import (CSV upload for contacts)
- [ ] Build the Stripe checkout flow (subscription page)
- [ ] Add the product catalog feature


Here's the roadmap from here:
Immediate next session (finish the MVP):

Deploy to Vercel — this unlocks everything else. Twilio and Stripe webhooks need a live URL to post to. Should take 15 minutes following the README steps.
Test the full WhatsApp flow — once deployed, join the Twilio sandbox by sending "join [your-sandbox-word]" to the Twilio number, add yourself as a contact in the app, then message a keyword and watch the auto-reply fire.
Broadcast sending logic — right now broadcasts save to the DB but nothing actually sends them. You need a Vercel Cron Job that runs every minute, checks for broadcasts where scheduled_at <= now and status = 'scheduled', then fires the messages via Twilio and marks them sent.

Week 2 features:

Contact detail page — tap a contact and see their full message history, change their tag, and send them a manual message directly from the app.
Stripe checkout — a /subscribe page where users enter their card and start the $15/month plan. Right now the subscription table exists but there's no way to actually pay.
CSV bulk import — let business owners upload a spreadsheet of existing contacts instead of adding them one by one.

Week 3 (polish before selling):

Usage limits — cap free/trial users at say 50 contacts and 3 auto-replies, then prompt them to upgrade.
Onboarding flow — a short checklist for new users: add first contact → create first auto-reply → send first broadcast. Reduces drop-off significantly.
Find first paying customers — the README has the outreach strategy: Instagram DMs to small business owners, local WhatsApp business groups, and Gumroad/Lemon Squeezy for discovery.