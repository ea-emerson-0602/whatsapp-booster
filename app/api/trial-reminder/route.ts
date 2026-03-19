import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/twilio'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()

  // Find all trialing subscriptions
  const { data: trials } = await supabase
    .from('subscriptions')
    .select('*, user:user_id(*)')
    .eq('status', 'trialing')
    .not('trial_ends_at', 'is', null)

  if (!trials || trials.length === 0) {
    return NextResponse.json({ message: 'No active trials', notified: 0 })
  }

  let notified = 0

  for (const trial of trials) {
    const trialEnd = new Date(trial.trial_ends_at)
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Send reminder if 2 days or less remaining
    // Send every day from day 2 down to day 0
    if (daysLeft <= 2 && daysLeft >= 0) {

      // Get the user's phone number from their contacts
      // We look up the contact record matching the user's account
      const { data: userContact } = await supabase
        .from('customers')
        .select('phone')
        .eq('user_id', trial.user_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      // Get user email for the message
      const { data: authUser } = await supabase.auth.admin.getUserById(trial.user_id)
      const email = authUser?.user?.email ?? ''

      let message = ''

      if (daysLeft === 0) {
        message = `⚠️ Your WA Booster free trial ends *today*!\n\nAfter today, your subscription will automatically renew at $15/month.\n\nTo cancel before it renews, visit:\n${process.env.NEXT_PUBLIC_APP_URL}/subscribe\n\nThank you for using WA Booster! 🚀`
      } else if (daysLeft === 1) {
        message = `⏰ Your WA Booster free trial ends *tomorrow* (1 day left).\n\nYour subscription will renew at $15/month unless you cancel.\n\nTo cancel: ${process.env.NEXT_PUBLIC_APP_URL}/subscribe`
      } else {
        message = `👋 Heads up — your WA Booster free trial ends in *${daysLeft} days*.\n\nAfter your trial, you'll be charged $15/month automatically.\n\nTo cancel before then: ${process.env.NEXT_PUBLIC_APP_URL}/subscribe`
      }

      // Send WhatsApp reminder if we have their phone
      if (userContact?.phone) {
        try {
          await sendWhatsAppMessage(userContact.phone, message)
          notified++
          console.log(`Trial reminder sent to ${email} — ${daysLeft} days left`)
        } catch (err: any) {
          console.error(`Failed to send trial reminder to ${email}:`, err.message)
        }
      }

      // Update trial_ends_at on last day to trigger subscription activation
      if (daysLeft === 0) {
        await supabase
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('id', trial.id)
      }
    }
  }

  return NextResponse.json({ message: `Trial reminders processed`, notified })
}
