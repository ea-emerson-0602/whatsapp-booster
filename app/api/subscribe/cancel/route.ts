import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { cancelSubscription } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subscriptionId } = await request.json()
  const adminSupabase = createAdminClient()

  // Get the subscription record to get subscription_code and email_token
  const { data: sub, error: fetchError } = await adminSupabase
    .from('subscriptions')
    .select('stripe_subscription_id, email_token, status')
    .eq('id', subscriptionId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !sub) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  // If we have subscription_code and email_token, cancel on Paystack too
  if (sub.stripe_subscription_id && sub.email_token) {
    try {
      const result = await cancelSubscription(sub.stripe_subscription_id, sub.email_token)
      if (!result.status) {
        console.error('Paystack cancel failed:', result.message)
        // Still cancel in our DB even if Paystack call fails
      }
    } catch (err) {
      console.error('Error cancelling on Paystack:', err)
    }
  }

  // Mark as canceled in our DB
  const { error } = await adminSupabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('id', subscriptionId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
