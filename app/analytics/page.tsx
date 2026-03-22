import { createClient } from '@/lib/supabase/server'
import AnalyticsCharts from './AnalyticsCharts'

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalSent },
    { count: totalReceived },
    { count: totalContacts },
    { count: newContactsThisWeek },
    { count: broadcastsSent },
    { data: topTemplates },
    { data: tagBreakdown },
    { data: dailyMessages },
    { data: broadcasts },
  ] = await Promise.all([
    supabase.from('messages').select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id).eq('direction', 'outbound').gte('created_at', thirtyDaysAgo),
    supabase.from('messages').select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id).eq('direction', 'inbound').gte('created_at', thirtyDaysAgo),
    supabase.from('customers').select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id),
    supabase.from('customers').select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id).gte('created_at', sevenDaysAgo),
    supabase.from('broadcasts').select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id).eq('status', 'sent'),
    supabase.from('templates').select('name, trigger_keywords, is_active')
      .eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('customers').select('tag')
      .eq('user_id', user!.id),
    // Get all messages in last 30 days with date for charting
    supabase.from('messages').select('direction, created_at')
      .eq('user_id', user!.id).gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true }),
    // Broadcasts with sent count
    supabase.from('broadcasts').select('name, sent_count, scheduled_at, status')
      .eq('user_id', user!.id).eq('status', 'sent')
      .order('scheduled_at', { ascending: false }).limit(6),
  ])

  const replyRate = totalSent && totalReceived
    ? Math.round((totalReceived / totalSent) * 100)
    : 0

  // Build daily chart data for last 30 days
  const days: { date: string; sent: number; received: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      sent: 0,
      received: 0,
    })
  }

  ;(dailyMessages ?? []).forEach((msg: any) => {
    const msgDate = new Date(msg.created_at)
    const label = msgDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    const day = days.find(d => d.date === label)
    if (day) {
      if (msg.direction === 'outbound') day.sent++
      else day.received++
    }
  })

  // Tag breakdown
  const tagCounts: Record<string, number> = {}
  ;(tagBreakdown ?? []).forEach((c: any) => {
    const key = c.tag ?? 'Untagged'
    tagCounts[key] = (tagCounts[key] || 0) + 1
  })

  const metrics = [
    { label: 'Messages sent',     value: totalSent     ?? 0, sub: 'last 30 days' },
    { label: 'Messages received', value: totalReceived  ?? 0, sub: 'last 30 days' },
    { label: 'Reply rate',        value: `${replyRate}%`, sub: 'inbound / outbound' },
    { label: 'Total contacts',    value: totalContacts  ?? 0, sub: `+${newContactsThisWeek ?? 0} this week` },
    { label: 'Broadcasts sent',   value: broadcastsSent ?? 0, sub: 'all time' },
    { label: 'Auto-reply rules',  value: topTemplates?.length ?? 0, sub: `${topTemplates?.filter((t: any) => t.is_active).length ?? 0} active` },
  ]

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Analytics</h1>
        <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Last 30 days</p>
      </div>

      <AnalyticsCharts
        metrics={metrics}
        dailyData={days}
        tagCounts={tagCounts}
        templates={topTemplates ?? []}
        broadcasts={broadcasts ?? []}
      />
    </div>
  )
}
