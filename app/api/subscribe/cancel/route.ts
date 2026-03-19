import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subscriptionId } = await request.json()

  const adminSupabase = createAdminClient()

  // Mark as canceled in our DB
  // In production with Paystack webhook, this gets confirmed via the webhook
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
