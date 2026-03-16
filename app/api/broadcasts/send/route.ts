import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/twilio'

// This route is called by Vercel Cron every minute
// It checks for due broadcasts and sends them
export async function GET(request: NextRequest) {

  // Security check — only allow Vercel cron or our own server to call this
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  // Debug log
  console.log('Cron fired at:', now)

  // 1. Find all broadcasts that are due and still scheduled
  const { data: dueBroadcasts, error } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_at', now)

  // Debug log
  console.log('Due broadcasts found:', dueBroadcasts)
  console.log('Query error:', error)

  if (error) {
    console.error('Error fetching broadcasts:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!dueBroadcasts || dueBroadcasts.length === 0) {
    return NextResponse.json({ message: 'No broadcasts due', sent: 0 })
  }

  let totalSent = 0

  for (const broadcast of dueBroadcasts) {

    // 2. Mark it as 'sending' immediately to prevent duplicate sends
    await supabase
      .from('broadcasts')
      .update({ status: 'sending' })
      .eq('id', broadcast.id)

    // 3. Fetch the target customers
    let customerQuery = supabase
      .from('customers')
      .select('*')
      .eq('user_id', broadcast.user_id)

    // Filter by tags if specified, otherwise send to all
    if (broadcast.target_tags && broadcast.target_tags.length > 0) {
      customerQuery = customerQuery.in('tag', broadcast.target_tags)
    }

    const { data: customers } = await customerQuery

    // Debug log
    console.log(`Broadcast "${broadcast.name}" targets:`, customers?.length, 'customers')
    console.log('Target tags:', broadcast.target_tags)

    if (!customers || customers.length === 0) {
      await supabase
        .from('broadcasts')
        .update({ status: 'sent', sent_count: 0 })
        .eq('id', broadcast.id)
      continue
    }

    // 4. Send to each customer with a small delay to avoid rate limits
    let sentCount = 0
    const errors: string[] = []

    for (const customer of customers) {
      try {
        await sendWhatsAppMessage(customer.phone, broadcast.message_body)

        // Log the outbound message
        await supabase.from('messages').insert({
          user_id: broadcast.user_id,
          customer_id: customer.id,
          body: broadcast.message_body,
          direction: 'outbound',
          status: 'sent',
        })

        // Update customer's last_message_at
        await supabase
          .from('customers')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', customer.id)

        sentCount++

        // Small delay between messages to respect Twilio rate limits
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (err: any) {
        console.error(`Failed to send to ${customer.phone}:`, err.message, err.code, err.status)
        errors.push(customer.phone)
      }
    }

    // 5. Mark broadcast as sent with final count
    await supabase
      .from('broadcasts')
      .update({
        status: errors.length === customers.length ? 'failed' : 'sent',
        sent_count: sentCount,
      })
      .eq('id', broadcast.id)

    totalSent += sentCount
    console.log(`Broadcast "${broadcast.name}": sent ${sentCount}/${customers.length}`)
  }

  return NextResponse.json({
    message: `Processed ${dueBroadcasts.length} broadcast(s)`,
    sent: totalSent,
  })
}
