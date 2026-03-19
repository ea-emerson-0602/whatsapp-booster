// Paystack utility — all calls are server-side only
// Docs: https://paystack.com/docs/api

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

export const PLAN = {
  name: 'WA Booster Starter',
  amount: 1500, // $15 in cents
  interval: 'monthly',
  trialDays: 7,
  code: process.env.PAYSTACK_PLAN_CODE!,
}

// Helper to make Paystack API calls
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

// Initialize a transaction with 7-day trial
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
    plan: PLAN.code,
    amount: PLAN.amount * 100,
    currency: 'USD',
    callback_url: callbackUrl,
    metadata: {
      user_id: userId,
      cancel_action: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
    },
  })
}

// Verify a transaction by reference
export async function verifyTransaction(reference: string) {
  return paystackRequest('GET', `/transaction/verify/${reference}`)
}

// Cancel a subscription
export async function cancelSubscription(subscriptionCode: string, emailToken: string) {
  return paystackRequest('POST', '/subscription/disable', {
    code: subscriptionCode,
    token: emailToken,
  })
}

// Verify webhook signature
export function verifyWebhookSignature(payload: string, signature: string) {
  const crypto = require('crypto')
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest('hex')
  return hash === signature
}
