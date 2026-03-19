import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LocalTime } from '@/components/LocalTime'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { trial?: string; subscribed?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Run all queries in parallel for speed
  const [
    { count: totalContacts },
    { count: todayMessages },
    { count: autoReplies },
    { count: scheduledBroadcasts },
    { data: recentMessages },
    { data: upcomingBroadcasts },
    { data: staleContacts },
    { data: subscription },
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('messages').select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('direction', 'outbound')
      .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
    supabase.from('messages').select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('direction', 'outbound')
      .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
    supabase.from('broadcasts').select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('status', 'scheduled'),
    supabase.from('messages')
      .select('*, customer:customers(name, tag)')
      .eq('user_id', user!.id)
      .eq('direction', 'inbound')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('broadcasts')
      .select('*')
      .eq('user_id', user!.id)
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true })
      .limit(3),
    supabase.from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('tag', 'Pending')
      .lt('last_message_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('subscriptions')
      .select('*')
      .eq('user_id', user!.id)
      .single(),
  ])

  const firstName = user?.email?.split('@')[0] ?? 'there'
  const staleCount = staleContacts?.length ?? 0

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>Good morning, {firstName}</h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link href="/broadcasts/new" className="btn btn-primary">+ New broadcast</Link>
      </div>

      {/* No subscription banner */}
      {!subscription && searchParams.trial !== 'started' && (
        <div style={{ background: '#f0effe', border: '1px solid #afa9ec', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <p style={{ fontWeight: 500, fontSize: 14, color: '#3c3489' }}>Start your free 7-day trial</p>
            <p style={{ fontSize: 13, color: '#534ab7', marginTop: 2 }}>No credit card charged until your trial ends. Cancel anytime.</p>
          </div>
          <Link href="/subscribe" className="btn" style={{ background: '#4338ca', color: '#fff', fontSize: 13, flexShrink: 0 }}>
            Start free trial →
          </Link>
        </div>
      )}

      {/* Trial active banner */}
      {subscription?.status === 'trialing' && (
        <div style={{ background: '#e6f1fb', border: '1px solid #85b7eb', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#0c447c' }}>
          <span>
            🎉 Free trial active —{' '}
            {Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
          </span>
          <Link href="/subscribe" style={{ fontWeight: 500, color: '#0c447c', fontSize: 13 }}>Manage →</Link>
        </div>
      )}

      {/* Trial started banner (after redirect) */}
      {searchParams.trial === 'started' && (
        <div style={{ background: '#e6f1fb', border: '1px solid #85b7eb', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: '#0c447c' }}>
          <span>🎉 Your 7-day free trial has started! You won't be charged until your trial ends.</span>
          <Link href="/subscribe" style={{ fontWeight: 500, color: '#0c447c', fontSize: 13 }}>View plan →</Link>
        </div>
      )}

      {/* Stale contacts alert */}
      {staleCount > 0 && (
        <div style={{ background: '#faeeda', border: '1px solid #ef9f27', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: '#633806' }}>
          <span>{staleCount} pending customer{staleCount > 1 ? 's' : ''} haven't been followed up in over 7 days</span>
          <Link href="/contacts?filter=stale" style={{ fontWeight: 500, color: '#633806', fontSize: 13 }}>View →</Link>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total contacts', value: totalContacts ?? 0, sub: 'all time' },
          { label: 'Messages sent today', value: todayMessages ?? 0, sub: 'outbound' },
          { label: 'Auto-replies today', value: autoReplies ?? 0, sub: 'triggered' },
          { label: 'Broadcasts scheduled', value: scheduledBroadcasts ?? 0, sub: 'upcoming' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="metric-card">
            <p style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 26, fontWeight: 500 }}>{value}</p>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid-2-1">

        {/* Recent conversations */}
        <div className="card">
          <p style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Recent conversations</p>
          {recentMessages && recentMessages.length > 0 ? recentMessages.map((msg: any) => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0ee', fontSize: 13 }}>
              <div>
                <span style={{ fontWeight: 500 }}>{msg.customer?.name ?? 'Unknown'}</span>
                <span style={{ color: '#aaa', marginLeft: 8, fontSize: 12 }}>
                  {msg.body.slice(0, 30)}{msg.body.length > 30 ? '...' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {msg.customer?.tag && (
                  <span className={`tag tag-${msg.customer.tag}`}>{msg.customer.tag}</span>
                )}
                <span style={{ fontSize: 11, color: '#bbb' }}>
                  <LocalTime dateString={msg.created_at} showTime={true} />
                </span>
              </div>
            </div>
          )) : (
            <p style={{ color: '#bbb', fontSize: 13 }}>No messages yet. Messages from customers will appear here.</p>
          )}
          <Link href="/contacts" className="btn btn-outline" style={{ marginTop: 12, fontSize: 13 }}>View all contacts →</Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Upcoming broadcasts */}
          <div className="card">
            <p style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Upcoming broadcasts</p>
            {upcomingBroadcasts && upcomingBroadcasts.length > 0 ? upcomingBroadcasts.map((b: any) => (
              <div key={b.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0ee' }}>
                <p style={{ fontSize: 13, fontWeight: 500 }}>{b.name}</p>
                <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                  <LocalTime dateString={b.scheduled_at} /> · {b.target_tags?.join(', ') || 'all contacts'}
                </p>
              </div>
            )) : (
              <p style={{ color: '#bbb', fontSize: 13 }}>No broadcasts scheduled.</p>
            )}
            <Link href="/broadcasts/new" className="btn btn-outline" style={{ marginTop: 12, fontSize: 13 }}>Schedule broadcast →</Link>
          </div>

          {/* Quick actions */}
          <div className="card">
            <p style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Quick actions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/contacts/new" className="btn btn-outline" style={{ fontSize: 13 }}>+ Add contact</Link>
              <Link href="/templates/new" className="btn btn-outline" style={{ fontSize: 13 }}>+ Add auto-reply</Link>
              <Link href="/analytics" className="btn btn-outline" style={{ fontSize: 13 }}>View analytics →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
