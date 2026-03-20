import { createClient } from '@/lib/supabase/server'

export const LIMITS = {
  free: {
    contacts: 50,
    templates: 3,
    broadcasts: 2,
  },
  trialing: {
    contacts: 500,
    templates: 20,
    broadcasts: 10,
  },
  active: {
    contacts: 500,
    templates: 20,
    broadcasts: 10,
  },
}

export type LimitKey = keyof typeof LIMITS.free

// Get the user's current plan tier
export async function getUserPlan(userId: string): Promise<'free' | 'trialing' | 'active'> {
  const supabase = createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .single()

  if (!data) return 'free'
  if (data.status === 'active') return 'active'
  if (data.status === 'trialing') return 'trialing'
  return 'free'
}

// Check if a user is within their limit for a given resource
export async function checkLimit(
  userId: string,
  resource: LimitKey
): Promise<{ allowed: boolean; current: number; limit: number; plan: string }> {
  const supabase = createClient()
  const plan = await getUserPlan(userId)
  const limit = LIMITS[plan][resource]

  const tableMap: Record<LimitKey, string> = {
    contacts: 'customers',
    templates: 'templates',
    broadcasts: 'broadcasts',
  }

  const statusFilter: Record<LimitKey, object | null> = {
    contacts: null,
    templates: null,
    broadcasts: { status: 'scheduled' },
  }

  let query = supabase
    .from(tableMap[resource])
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // For broadcasts, only count scheduled ones
  if (resource === 'broadcasts') {
    query = query.eq('status', 'scheduled')
  }

  const { count } = await query
  const current = count ?? 0

  return {
    allowed: current < limit,
    current,
    limit,
    plan,
  }
}
