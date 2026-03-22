import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyTransaction } from '@/lib/paystack'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!reference) {
    return NextResponse.redirect(`${appUrl}/subscribe?error=missing_reference`)
  }

  // Verify the transaction with Paystack
  const result = await verifyTransaction(reference)

  if (!result.status || result.data.status !== 'success') {
    console.error('Paystack verification failed:', result)
    return NextResponse.redirect(`${appUrl}/subscribe?error=payment_failed`)
  }

  const { metadata, customer, plan_object, subscription_code, email_token, paid_at } = result.data
  const userId = metadata?.user_id

  if (!userId) {
    console.error('No user_id in metadata:', metadata)
    return NextResponse.redirect(`${appUrl}/subscribe?error=missing_user`)
  }

  // Trial ends 7 days from now
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 7)

  // Next billing date is after the trial
  const nextBillingDate = new Date(trialEndsAt)
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

  const supabase = createAdminClient()

  const { error } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: customer?.customer_code ?? null,   // Paystack customer code
    stripe_subscription_id: subscription_code ?? reference, // Paystack subscription code
    email_token: email_token ?? null,                       // needed for cancellation
    status: 'trialing',
    plan: plan_object?.name ?? 'starter',
    trial_ends_at: trialEndsAt.toISOString(),
    current_period_end: nextBillingDate.toISOString(),
  }, { onConflict: 'user_id' })

  if (error) {
    console.error('Supabase upsert error:', error)
    return NextResponse.redirect(`${appUrl}/subscribe?error=db_error`)
  }

  return NextResponse.redirect(`${appUrl}/dashboard?trial=started`)
}
