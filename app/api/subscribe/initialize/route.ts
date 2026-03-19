import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializeTransaction } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, userId } = await request.json()

  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/subscribe/callback`

  const response = await initializeTransaction({ email, userId, callbackUrl })

  if (!response.status) {
    return NextResponse.json({ error: response.message }, { status: 400 })
  }

  return NextResponse.json({
    authorization_url: response.data.authorization_url,
    reference: response.data.reference,
  })
}
