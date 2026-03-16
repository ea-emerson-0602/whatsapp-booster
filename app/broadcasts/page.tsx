import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Broadcast } from '@/lib/types'

const statusStyles: Record<string, { bg: string; color: string }> = {
  scheduled: { bg: '#e6f1fb', color: '#0c447c' },
  sending:   { bg: '#faeeda', color: '#633806' },
  sent:      { bg: '#eaf3de', color: '#27500a' },
  failed:    { bg: '#fcebeb', color: '#a32d2d' },
}

export default async function BroadcastsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('user_id', user!.id)
    .order('scheduled_at', { ascending: false })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>Broadcasts</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Schedule messages to groups of customers</p>
        </div>
        <Link href="/broadcasts/new" className="btn btn-primary">+ Schedule broadcast</Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {broadcasts && broadcasts.length > 0 ? broadcasts.map((b: Broadcast) => {
          const style = statusStyles[b.status] ?? statusStyles.scheduled
          return (
            <div key={b.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <p style={{ fontWeight: 500, fontSize: 15 }}>{b.name}</p>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 500, background: style.bg, color: style.color }}>
                    {b.status}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>
                  {b.message_body.slice(0, 80)}{b.message_body.length > 80 ? '...' : ''}
                </p>
                <p style={{ fontSize: 12, color: '#aaa' }}>
                  {new Date(b.scheduled_at).toLocaleDateString('en-GB', {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                  {b.target_tags && b.target_tags.length > 0 && ` · ${b.target_tags.join(', ')} contacts`}
                  {b.status === 'sent' && ` · ${b.sent_count} sent`}
                </p>
              </div>
            </div>
          )
        }) : (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
            <p style={{ marginBottom: 12 }}>No broadcasts yet.</p>
            <Link href="/broadcasts/new" className="btn btn-primary">Schedule your first broadcast →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
