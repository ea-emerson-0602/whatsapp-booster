import { createClient } from '@/lib/supabase/server'

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalSent },
    { count: totalReceived },
    { count: autoReplies },
    { data: topTemplates },
    { data: tagBreakdown },
  ] = await Promise.all([
    supabase.from('messages').select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id).eq('direction', 'outbound').gte('created_at', thirtyDaysAgo),
    supabase.from('messages').select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id).eq('direction', 'inbound').gte('created_at', thirtyDaysAgo),
    supabase.from('messages').select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id).eq('direction', 'outbound').gte('created_at', thirtyDaysAgo),
    supabase.from('templates').select('name, trigger_keywords, is_active').eq('user_id', user!.id),
    supabase.from('customers').select('tag').eq('user_id', user!.id),
  ])

  const replyRate = totalSent && totalReceived
    ? Math.round((totalReceived / totalSent) * 100)
    : 0

  const tagCounts = (tagBreakdown ?? []).reduce((acc: Record<string, number>, c: any) => {
    acc[c.tag] = (acc[c.tag] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Analytics</h1>
        <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Last 30 days</p>
      </div>

      {/* Key metrics */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Messages sent', value: totalSent ?? 0 },
          { label: 'Messages received', value: totalReceived ?? 0 },
          { label: 'Reply rate', value: `${replyRate}%` },
          { label: 'Auto-replies sent', value: autoReplies ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="metric-card">
            <p style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 26, fontWeight: 500 }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid-2">

        {/* Contact breakdown */}
        <div className="card">
          <p style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Contacts by tag
          </p>
          {['Lead', 'Paid', 'Pending'].map(tag => {
            const count = tagCounts[tag] || 0
            const total = Object.values(tagCounts).reduce((a: number, b) => a + (b as number), 0) || 1
            const pct = Math.round((count / total) * 100)
            return (
              <div key={tag} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span className={`tag tag-${tag}`}>{tag}</span>
                  <span style={{ color: '#888' }}>{count} ({pct}%)</span>
                </div>
                <div style={{ background: '#f0f0ee', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 99,
                    width: `${pct}%`,
                    background: tag === 'Lead' ? '#378add' : tag === 'Paid' ? '#639922' : '#ef9f27',
                  }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Auto-reply performance */}
        <div className="card">
          <p style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Auto-reply rules
          </p>
          {topTemplates && topTemplates.length > 0 ? topTemplates.map((t: any) => (
            <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0ee', fontSize: 13 }}>
              <div>
                <p style={{ fontWeight: 500 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                  {t.trigger_keywords.slice(0, 3).join(', ')}
                </p>
              </div>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 500,
                background: t.is_active ? '#eaf3de' : '#f3f3f1',
                color: t.is_active ? '#27500a' : '#888',
              }}>
                {t.is_active ? 'Active' : 'Paused'}
              </span>
            </div>
          )) : (
            <p style={{ color: '#bbb', fontSize: 13 }}>No auto-reply rules yet.</p>
          )}
        </div>

      </div>
    </div>
  )
}
