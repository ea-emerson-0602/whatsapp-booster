'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Tag } from '@/lib/types'

const ALL_TAGS: Tag[] = ['Lead', 'Paid', 'Pending']

export default function NewBroadcastPage() {
  const [name, setName] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [targetTags, setTargetTags] = useState<Tag[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  function toggleTag(tag: Tag) {
    setTargetTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('broadcasts').insert({
      user_id: user.id,
      name,
      message_body: messageBody,
      scheduled_at: new Date(scheduledAt).toISOString(),
      target_tags: targetTags.length > 0 ? targetTags : null,
      status: 'scheduled',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/broadcasts')
      router.refresh()
    }
  }

  // Set minimum datetime to now
  const minDatetime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString().slice(0, 16)

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <Link href="/broadcasts" style={{ color: '#888', fontSize: 13 }}>← Broadcasts</Link>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Schedule broadcast</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Broadcast name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Monday promo" required />
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Message</label>
            <textarea
              value={messageBody}
              onChange={e => setMessageBody(e.target.value)}
              rows={4}
              placeholder="Hi [name], we have a special offer this week..."
              required
            />
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{messageBody.length} / 1600 characters</p>
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Send to</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="btn btn-outline"
                  style={{
                    fontSize: 12,
                    padding: '4px 12px',
                    background: targetTags.includes(tag) ? '#4338ca' : undefined,
                    color:      targetTags.includes(tag) ? '#fff'    : undefined,
                    borderColor: targetTags.includes(tag) ? '#4338ca' : undefined,
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>
              {targetTags.length === 0 ? 'No tags selected — will send to all contacts' : `Sending to: ${targetTags.join(', ')}`}
            </p>
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Schedule time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              min={minDatetime}
              required
            />
          </div>

          <div style={{ background: '#faeeda', border: '1px solid #ef9f27', borderRadius: 8, padding: '0.75rem 1rem', fontSize: 13, color: '#633806' }}>
            <strong>WhatsApp policy:</strong> You can only message contacts who have messaged you first within the last 24 hours, or use pre-approved Message Templates. Make sure your contacts have opted in.
          </div>

          {error && (
            <p style={{ background: '#fcebeb', color: '#a32d2d', fontSize: 13, padding: '0.5rem 0.75rem', borderRadius: 8 }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule broadcast'}
            </button>
            <Link href="/broadcasts" className="btn btn-outline">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
