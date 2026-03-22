// Paystack utility — all calls are server-side only
// Docs: https://paystack.com/docs/api

import crypto from 'crypto'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

export const PLAN = {
  name: 'WA Booster Starter',
  amount: 1000000, // 10,000 NGN in kobo
  interval: 'monthly',
  trialDays: 7,
  code: process.env.PAYSTACK_PLAN_CODE!,
}

async function paystackRequest(method: string, path: string, body?: object) {
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

// Initialize a transaction — plan code overrides amount per Paystack docs
export async function initializeTransaction({
  email,
  userId,
  callbackUrl,
}: {
  email: string
  userId: string
  callbackUrl: string
}) {
  return paystackRequest('POST', '/transaction/initialize', {
    email,
    plan: PLAN.code,          // plan code overrides amount automatically
    callback_url: callbackUrl,
    metadata: {
      user_id: userId,        // stored so webhook can identify the user
      cancel_action: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
    },
  })
}

// Verify a transaction by reference after callback redirect
export async function verifyTransaction(reference: string) {
  return paystackRequest('GET', `/transaction/verify/${reference}`)
}

// Fetch a subscription by its code
export async function fetchSubscription(subscriptionCode: string) {
  return paystackRequest('GET', `/subscription/${subscriptionCode}`)
}

// Cancel a subscription — requires subscription_code + email_token
export async function cancelSubscription(subscriptionCode: string, emailToken: string) {
  return paystackRequest('POST', '/subscription/disable', {
    code: subscriptionCode,
    token: emailToken,
  })
}

// Verify that a webhook request genuinely came from Paystack
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest('hex')
  return hash === signature
}
