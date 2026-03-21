'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from '@/components/Spinner'

export default function MessageBox({
  customerId,
  customerName,
}: {
  customerId: string
  customerName: string
}) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const router = useRouter()

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError('')
    setSent(false)

    const res = await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, message }),
    })

    const data = await res.json()

    if (data.success) {
      setMessage('')
      setSent(true)
      router.refresh()
      setTimeout(() => setSent(false), 3000)
    } else {
      setError(data.error || 'Failed to send. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="card">
      <p style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
        Send message to {customerName}
      </p>

      <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={`Type a message to ${customerName}...`}
          rows={3}
          required
          style={{ resize: 'vertical' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: '#aaa' }}>{message.length} / 1600</p>

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="btn btn-primary"
            style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {loading && <Spinner size={13} color="#fff" />}
            {loading ? 'Sending...' : 'Send via WhatsApp'}
          </button>
        </div>

        {sent && (
          <p style={{ fontSize: 13, color: '#27500a', background: '#eaf3de', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
            ✓ Message sent successfully
          </p>
        )}

        {error && (
          <p style={{ fontSize: 13, color: '#a32d2d', background: '#fcebeb', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
            ⚠ {error}
          </p>
        )}
      </form>
    </div>
  )
}
