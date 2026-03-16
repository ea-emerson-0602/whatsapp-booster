import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Twilio posts to this URL when a WhatsApp message arrives
// Set this URL in Twilio console: https://yourdomain.com/api/webhook/twilio
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const from = formData.get('From') as string   // e.g. "whatsapp:+2348012345678"
  const body = formData.get('Body') as string
  const messageSid = formData.get('MessageSid') as string

  if (!from || !body) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Strip the "whatsapp:" prefix to get the plain phone number
  const phone = from.replace('whatsapp:', '')

  const supabase = createAdminClient()

  // 1. Find the customer by phone number
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .single()

  // 2. If unknown number, we can't process it (no user_id to attach it to)
  //    In production you'd handle this — e.g. create a lead automatically
  if (!customer) {
    console.log(`Unknown number ${phone} sent a message`)
    return new NextResponse('<Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  // 3. Save the inbound message
  await supabase.from('messages').insert({
    user_id: customer.user_id,
    customer_id: customer.id,
    body,
    direction: 'inbound',
    status: 'delivered',
    twilio_sid: messageSid,
  })

  // 4. Update last_message_at on the customer
  await supabase
    .from('customers')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', customer.id)

  // 5. Check if any keyword auto-reply should fire
  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', customer.user_id)
    .eq('is_active', true)

  const lowerBody = body.toLowerCase()
  const matched = templates?.find((t: { trigger_keywords: string[]; reply_body: string }) =>
    t.trigger_keywords.some((kw: string) => lowerBody.includes(kw.toLowerCase()))
  )

  // 6. If a keyword matched, send the auto-reply via Twilio TwiML
  if (matched) {
    // Log the outbound auto-reply
    await supabase.from('messages').insert({
      user_id: customer.user_id,
      customer_id: customer.id,
      body: matched.reply_body,
      direction: 'outbound',
      status: 'sent',
    })

    // Return TwiML — Twilio sends this back as the reply automatically
    const twiml = `<Response><Message>${matched.reply_body}</Message></Response>`
    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  // No auto-reply matched — return empty TwiML (no reply sent)
  return new NextResponse('<Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  })
}
