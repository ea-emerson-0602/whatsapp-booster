import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/twilio'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { customerId, message } = await request.json()

  if (!customerId || !message) {
    return NextResponse.json({ error: 'Missing customerId or message' }, { status: 400 })
  }

  // Get the customer (RLS ensures it belongs to this user)
  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single()

  if (error || !customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  // Send via Twilio
  const twilioMessage = await sendWhatsAppMessage(customer.phone, message)

  // Log the outbound message
  await supabase.from('messages').insert({
    user_id: user.id,
    customer_id: customer.id,
    body: message,
    direction: 'outbound',
    status: 'sent',
    twilio_sid: twilioMessage.sid,
  })

  // Update last_message_at
  await supabase
    .from('customers')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', customer.id)

  return NextResponse.json({ success: true, sid: twilioMessage.sid })
}
