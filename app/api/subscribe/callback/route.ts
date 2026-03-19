import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyTransaction } from '@/lib/paystack'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')

  if (!reference) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/subscribe?error=missing_reference`)
  }

  const result = await verifyTransaction(reference)

  if (!result.status || result.data.status !== 'success') {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/subscribe?error=payment_failed`)
  }

  const { metadata, customer } = result.data
  const userId = metadata?.user_id

  if (!userId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/subscribe?error=missing_user`)
  }

  // Set trial end date — 7 days from now
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 7)

  // First billing date is after the trial
  const firstBillingDate = new Date(trialEndsAt)
  firstBillingDate.setMonth(firstBillingDate.getMonth() + 1)

  const supabase = createAdminClient()

  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: customer.customer_code,
    stripe_subscription_id: reference,
    status: 'trialing',
    plan: 'starter',
    trial_ends_at: trialEndsAt.toISOString(),
    current_period_end: firstBillingDate.toISOString(),
  }, { onConflict: 'user_id' })

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?trial=started`)
}
