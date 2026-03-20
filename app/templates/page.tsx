import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Template } from '@/lib/types'
import ToggleTemplate from './ToggleTemplate'
import { checkLimit } from '@/lib/limits'
import UpgradePrompt from '@/components/UpgradePrompt'

export default async function TemplatesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [templateLimit, { data: templates }] = await Promise.all([
    checkLimit(user!.id, 'templates'),
    supabase
      .from('templates')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
  ])

  const { current, limit, allowed } = templateLimit

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>Auto-replies</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
            Automatically reply when customers send a matching keyword
          </p>
        </div>
        <Link href="/templates/new" className="btn btn-primary">+ New auto-reply</Link>
      </div>

      {/* Usage bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 4 }}>
          <span>{current} of {limit} auto-reply rules used</span>
          {!allowed && <Link href="/subscribe" style={{ color: '#4338ca', fontWeight: 500 }}>Upgrade →</Link>}
        </div>
        <div style={{ background: '#f0f0ee', borderRadius: 99, height: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            borderRadius: 99,
            width: `${Math.min((current / limit) * 100, 100)}%`,
            background: !allowed ? '#e24b4a' : current / limit > 0.8 ? '#ef9f27' : '#4338ca',
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {!allowed && <UpgradePrompt resource="templates" current={current} limit={limit} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {templates && templates.length > 0 ? templates.map((t: Template) => (
          <div key={t.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <p style={{ fontWeight: 500, fontSize: 15 }}>{t.name}</p>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 500,
                  background: t.is_active ? '#eaf3de' : '#f3f3f1',
                  color: t.is_active ? '#27500a' : '#888',
                }}>
                  {t.is_active ? 'Active' : 'Paused'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {t.trigger_keywords.map((kw: string) => (
                  <span key={kw} style={{ background: '#f0effe', color: '#4338ca', fontSize: 12, padding: '2px 8px', borderRadius: 6 }}>
                    {kw}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 13, color: '#666', background: '#f9f9f8', padding: '0.5rem 0.75rem', borderRadius: 8, borderLeft: '3px solid #e0e0dd' }}>
                {t.reply_body}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
              <ToggleTemplate id={t.id} isActive={t.is_active} />
              <Link href={`/templates/${t.id}/edit`} style={{ fontSize: 12, color: '#4338ca' }}>Edit</Link>
            </div>
          </div>
        )) : (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
            <p style={{ marginBottom: 12 }}>No auto-replies yet.</p>
            <Link href="/templates/new" className="btn btn-primary">Create your first auto-reply →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
