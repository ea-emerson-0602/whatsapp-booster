'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/lib/types'
import { LocalTime } from '@/components/LocalTime'
import Spinner from '@/components/Spinner'

const TAGS = ['All', 'Lead', 'Paid', 'Pending', 'Untagged']

export default function ContactsList({
  customers,
  activeTag,
}: {
  customers: Customer[]
  activeTag?: string
}) {
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState<Set<string>>(new Set())
  const [deleting, setDeleting]     = useState(false)
  const [confirmTag, setConfirmTag] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Dynamic client-side search
  const filtered = customers.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.phone.includes(q)
  })

  const allSelected  = filtered.length > 0 && filtered.every(c => selected.has(c.id))
  const someSelected = selected.size > 0

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(c => c.id)))
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Delete selected contacts
  async function deleteSelected() {
    setDeleting(true)
    const ids = Array.from(selected)
    await supabase.from('customers').delete().in('id', ids)
    setSelected(new Set())
    setDeleting(false)
    router.refresh()
  }

  // Delete all contacts of a specific tag
  async function deleteByTag(tag: string) {
    setDeleting(true)
    let query = supabase.from('customers').delete()
    if (tag === 'Untagged') {
      query = query.is('tag', null)
    } else {
      query = query.eq('tag', tag)
    }
    await query
    setConfirmTag(null)
    setDeleting(false)
    router.refresh()
  }

  function handleTagFilter(tag: string) {
    setSelected(new Set())
    router.push(tag === 'All' ? '/contacts' : `/contacts?tag=${tag}`)
  }

  return (
    <>
      {/* Filters + search */}
      <div className="filter-row" style={{ marginBottom: '0.75rem' }}>
        {TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => handleTagFilter(tag)}
            className="btn btn-outline"
            style={{
              fontSize: 12,
              padding: '4px 12px',
              background: (activeTag === tag || (!activeTag && tag === 'All')) ? '#4338ca' : undefined,
              color: (activeTag === tag || (!activeTag && tag === 'All')) ? '#fff' : undefined,
              borderColor: (activeTag === tag || (!activeTag && tag === 'All')) ? '#4338ca' : undefined,
            }}
          >
            {tag}
          </button>
        ))}

        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: 'auto', width: 220, fontSize: 13 }}
        />
      </div>

      {/* Bulk action bar — shown when contacts are selected */}
      {someSelected && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#f0effe', border: '1px solid #afa9ec',
          borderRadius: 10, padding: '0.6rem 1rem',
          marginBottom: '0.75rem', fontSize: 13,
        }}>
          <span style={{ color: '#3c3489', fontWeight: 500 }}>
            {selected.size} contact{selected.size > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={deleteSelected}
            disabled={deleting}
            style={{
              marginLeft: 'auto', fontSize: 13, fontWeight: 500,
              color: '#a32d2d', background: '#fcebeb',
              border: '1px solid #f09595', borderRadius: 8,
              padding: '4px 12px', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            {deleting && <Spinner size={12} color="#a32d2d" />}
            {deleting ? 'Deleting...' : `Delete ${selected.size} selected`}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Delete by tag section */}
      <div style={{ marginBottom: '1rem' }}>
        <details style={{ fontSize: 13 }}>
          <summary style={{ color: '#888', cursor: 'pointer', userSelect: 'none', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10 }}>▶</span> Bulk delete by tag
          </summary>
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', paddingLeft: 16 }}>
            {['Lead', 'Paid', 'Pending', 'Untagged'].map(tag => (
              <div key={tag}>
                {confirmTag === tag ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#a32d2d' }}>
                      Delete all {tag} contacts?
                    </span>
                    <button
                      onClick={() => deleteByTag(tag)}
                      disabled={deleting}
                      style={{ fontSize: 12, fontWeight: 500, color: '#a32d2d', background: '#fcebeb', border: '1px solid #f09595', borderRadius: 6, padding: '2px 10px', cursor: 'pointer' }}
                    >
                      {deleting ? 'Deleting...' : 'Yes, delete all'}
                    </button>
                    <button
                      onClick={() => setConfirmTag(null)}
                      style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmTag(tag)}
                    className={`tag tag-${tag}`}
                    style={{ cursor: 'pointer', border: '1px solid currentColor', background: 'transparent' }}
                  >
                    Delete all {tag}
                  </button>
                )}
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Live result count */}
      {search && (
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
        </p>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e8e8e6', background: '#f9f9f8' }}>
                <th style={{ padding: '10px 12px', width: 40 }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer', width: 14, height: 14 }}
                    title="Select all"
                  />
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: '#888' }}>Name</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: '#888' }}>Phone</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: '#888' }}>Tag</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: '#888' }}>Last message</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: '#888' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((c: Customer) => (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: '1px solid #f0f0ee',
                    background: selected.has(c.id) ? '#f5f3ff' : '#fff',
                    transition: 'background 0.1s',
                  }}
                >
                  <td style={{ padding: '10px 12px', width: 40 }}>
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleOne(c.id)}
                      style={{ cursor: 'pointer', width: 14, height: 14 }}
                    />
                  </td>
                  <td style={{ padding: '10px 16px', fontWeight: 500 }}>
                    <Link href={`/contacts/${c.id}`} style={{ color: '#1a1a1a', textDecoration: 'none' }}>
                      {c.name}
                    </Link>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#666' }}>{c.phone}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span className={`tag tag-${c.tag ?? 'Untagged'}`}>
                      {c.tag ?? 'Untagged'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>
                    {c.last_message_at
                      ? <LocalTime dateString={c.last_message_at} showTime={false} />
                      : '—'}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <Link href={`/contacts/${c.id}`} style={{ color: '#4338ca', fontSize: 12 }}>
                      View →
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>
                    {search
                      ? `No contacts match "${search}"`
                      : 'No contacts yet. '}
                    {!search && (
                      <Link href="/contacts/new" style={{ color: '#4338ca' }}>Add your first one →</Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
