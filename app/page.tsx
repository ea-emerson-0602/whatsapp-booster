import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Logged in users go straight to dashboard
  if (user) redirect('/dashboard')

  // Logged out users see the landing page
  redirect('/home')
}
