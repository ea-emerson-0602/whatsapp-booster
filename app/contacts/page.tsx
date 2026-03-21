import { createClient } from '@/lib/supabase/server'
import { checkLimit } from '@/lib/limits'
import UpgradePrompt from '@/components/UpgradePrompt'
import ContactsList from './ContactsList'
import Link from 'next/link'
import type { Customer } from '@/lib/types'

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: { tag?: string; filter?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('customers')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  if (searchParams.tag && searchParams.tag !== 'All') {
    if (searchParams.tag === 'Untagged') {
      query = query.is('tag', null)
    } else {
      query = query.eq('tag', searchParams.tag)
    }
  }

  if (searchParams.filter === 'stale') {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    query = query.eq('tag', 'Pending').lt('last_message_at', sevenDaysAgo)
  }

  const [contactLimit, { data: customers }] = await Promise.all([
    checkLimit(user!.id, 'contacts'),
    query,
  ])

  const { current, limit, allowed } = contactLimit

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Contacts</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/contacts/import" className="btn btn-outline">↑ Import CSV</Link>
          <Link href="/contacts/new" className="btn btn-primary">+ Add contact</Link>
        </div>
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

      {/* Client component handles dynamic search + tag filter */}
      <ContactsList
        customers={customers ?? []}
        activeTag={searchParams.tag}
      />
    </div>
  )
}
