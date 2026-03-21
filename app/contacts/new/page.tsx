'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Tag } from '@/lib/types'

type NonNullTag = 'Lead' | 'Paid' | 'Pending'

export default function NewContactForm() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [tag, setTag] = useState<NonNullTag>('Lead')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('customers').insert({
      user_id: user.id,
      name,
      phone,
      tag,
      notes,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/contacts')
      router.refresh()
    }
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Full name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Amaka Osei" required />
        </div>
        <div>
          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>
            WhatsApp number <span style={{ color: '#aaa' }}>(include country code)</span>
          </label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+2348012345678" required />
        </div>
        <div>
          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Tag</label>
          <select value={tag} onChange={e => setTag(e.target.value as NonNullTag)}>
            <option value="Lead">Lead</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="e.g. Interested in bulk order, referred by Tunde" />
        </div>

        {error && (
          <p style={{ background: '#fcebeb', color: '#a32d2d', fontSize: 13, padding: '0.5rem 0.75rem', borderRadius: 8 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save contact'}
          </button>
          <Link href="/contacts" className="btn btn-outline">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
