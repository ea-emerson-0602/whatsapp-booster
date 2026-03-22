import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyWebhookSignature } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get('x-paystack-signature') ?? ''

  // Always return 200 quickly — Paystack retries on non-200
  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(payload)
  const supabase = createAdminClient()

  console.log('Paystack webhook event:', event.event)

  switch (event.event) {

    case 'charge.success': {
      const { customer, paid_at, metadata, subscription_code, email_token } = event.data
      const userId = metadata?.user_id
      const customerCode = customer?.customer_code

      if (!userId && !customerCode) break

      const nextBillingDate = new Date(paid_at)
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

      if (userId) {
        // First payment — we have user_id from metadata
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerCode,
          stripe_subscription_id: subscription_code,
          email_token: email_token ?? null,
          status: 'active',
          current_period_end: nextBillingDate.toISOString(),
        }, { onConflict: 'user_id' })
      } else if (customerCode) {
        // Recurring charge — look up by customer code
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_end: nextBillingDate.toISOString(),
          })
          .eq('stripe_customer_id', customerCode)
      }
      break
    }

    case 'subscription.create': {
      // Subscription was created — save subscription_code and email_token
      const { customer, subscription_code, email_token, next_payment_date } = event.data
      const customerCode = customer?.customer_code
      if (!customerCode) break

      await supabase
        .from('subscriptions')
        .update({
          stripe_subscription_id: subscription_code,
          email_token: email_token ?? null,
          status: 'active',
          current_period_end: next_payment_date
            ? new Date(next_payment_date).toISOString()
            : null,
        })
        .eq('stripe_customer_id', customerCode)
      break
    }

    case 'subscription.disable':
    case 'subscription.not_renew': {
      const { subscription_code } = event.data
      if (!subscription_code) break
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription_code)
      break
    }

    case 'invoice.payment_failed': {
      const { subscription } = event.data
      const subscriptionCode = subscription?.subscription_code
      if (!subscriptionCode) break
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', subscriptionCode)
      break
    }
  }

  return NextResponse.json({ received: true })
}
