'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewTemplateForm() {
  const [name, setName] = useState('')
  const [keywords, setKeywords] = useState('')
  const [replyBody, setReplyBody] = useState('')
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

    const trigger_keywords = keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean)

    if (trigger_keywords.length === 0) {
      setError('Add at least one keyword')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('templates').insert({
      user_id: user.id,
      name,
      trigger_keywords,
      reply_body: replyBody,
      is_active: true,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/templates')
      router.refresh()
    }
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Rule name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pricing inquiry" required />
          <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>Internal label — customers don't see this</p>
        </div>

        <div>
          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Trigger keywords</label>
          <input
            type="text"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            placeholder="price, pricing, how much, cost"
            required
          />
          <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
            Comma-separated. When a customer's message contains any of these words, the reply fires.
          </p>
        </div>

        <div>
          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Reply message</label>
          <textarea
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            rows={4}
            placeholder="Hi! Our prices start from ₦5,000. See our full catalog here: [link]"
            required
          />
          <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{replyBody.length} characters</p>
        </div>

        {error && (
          <p style={{ background: '#fcebeb', color: '#a32d2d', fontSize: 13, padding: '0.5rem 0.75rem', borderRadius: 8 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save auto-reply'}
          </button>
          <Link href="/templates" className="btn btn-outline">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
