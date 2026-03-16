import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Customer } from '@/lib/types'

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: { tag?: string; q?: string; filter?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

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

  const { data: customers } = await query

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Contacts</h1>
        <Link href="/contacts/new" className="btn btn-primary">+ Add contact</Link>
      </div>

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
                <td style={{ padding: '10px 16px', fontWeight: 500 }}>{c.name}</td>
                <td style={{ padding: '10px 16px', color: '#666' }}>{c.phone}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span className={`tag tag-${c.tag}`}>{c.tag}</span>
                </td>
                <td style={{ padding: '10px 16px', color: '#aaa' }}>
                  {c.last_message_at
                    ? new Date(c.last_message_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : '—'}
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
