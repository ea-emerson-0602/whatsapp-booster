import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Customer } from '@/lib/types'
import { LocalTime } from '@/components/LocalTime'
import { checkLimit } from '@/lib/limits'
import UpgradePrompt from '@/components/UpgradePrompt'

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: { tag?: string; q?: string; filter?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [contactLimit, customers_result] = await Promise.all([
    checkLimit(user!.id, 'contacts'),
    (async () => {
      let query = supabase
        .from('customers')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (searchParams.tag) query = query.eq('tag', searchParams.tag)
      if (searchParams.q)   query = query.ilike('name', `%${searchParams.q}%`)
      if (searchParams.filter === 'stale') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        query = query.eq('tag', 'Pending').lt('last_message_at', sevenDaysAgo)
      }

      return query
    })(),
  ])

  const { data: customers } = customers_result
  const { current, limit, allowed } = contactLimit

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Contacts</h1>
        <Link href="/contacts/new" className="btn btn-primary">+ Add contact</Link>
      </div>

      {/* Usage bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 4 }}>
          <span>{current} of {limit} contacts used</span>
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

      {!allowed && <UpgradePrompt resource="contacts" current={current} limit={limit} />}

      {/* Filters */}
      <div className="filter-row">
        {['All', 'Lead', 'Paid', 'Pending'].map(t => (
          <Link
            key={t}
            href={t === 'All' ? '/contacts' : `/contacts?tag=${t}`}
            className="btn btn-outline"
            style={{
              fontSize: 12,
              padding: '4px 12px',
              background: searchParams.tag === t || (t === 'All' && !searchParams.tag) ? '#4338ca' : undefined,
              color:      searchParams.tag === t || (t === 'All' && !searchParams.tag) ? '#fff'    : undefined,
              borderColor: searchParams.tag === t || (t === 'All' && !searchParams.tag) ? '#4338ca' : undefined,
            }}
          >
            {t}
          </Link>
        ))}

        <form style={{ marginLeft: 'auto' }}>
          <input
            name="q"
            type="text"
            placeholder="Search by name..."
            defaultValue={searchParams.q}
            style={{ width: 200, padding: '0.4rem 0.75rem', fontSize: 13 }}
          />
        </form>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e8e8e6', background: '#f9f9f8' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: '#888' }}>Name</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: '#888' }}>Phone</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: '#888' }}>Tag</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: '#888' }}>Last message</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: '#888' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers && customers.length > 0 ? customers.map((c: Customer) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f0f0ee' }}>
                <td style={{ padding: '10px 16px', fontWeight: 500 }}>
                  <Link href={`/contacts/${c.id}`} style={{ color: '#1a1a1a', textDecoration: 'none' }}>
                    {c.name}
                  </Link>
                </td>
                <td style={{ padding: '10px 16px', color: '#666' }}>{c.phone}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span className={`tag tag-${c.tag}`}>{c.tag}</span>
                </td>
                <td style={{ padding: '10px 16px', color: '#aaa' }}>
                  {c.last_message_at ? <LocalTime dateString={c.last_message_at} showTime={false} /> : '—'}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <Link href={`/contacts/${c.id}`} style={{ color: '#4338ca', fontSize: 12 }}>View →</Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>
                  No contacts yet. <Link href="/contacts/new" style={{ color: '#4338ca' }}>Add your first one →</Link>
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
