'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Tag } from '@/lib/types'
import Spinner from '@/components/Spinner'

const ALL_TAGS: Tag[] = ['Lead', 'Paid', 'Pending']

export default function NewBroadcastPage() {
  const [name, setName]             = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [sendNow, setSendNow]       = useState(false)
  const [targetTags, setTargetTags] = useState<Tag[]>([])
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const supabase = createClient()
  const router   = useRouter()

  function toggleTag(tag: Tag) {
    setTargetTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  function insertVariable(variable: string) {
    setMessageBody(prev => prev + variable)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // If send now, schedule 30 seconds from now so the cron picks it up immediately
    const scheduledTime = sendNow
      ? new Date(Date.now() + 30 * 1000).toISOString()
      : new Date(scheduledAt).toISOString()

    const { error } = await supabase.from('broadcasts').insert({
      user_id: user.id,
      name,
      message_body: messageBody,
      scheduled_at: scheduledTime,
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

  function getLocalDatetimeMin() {
    const now = new Date(Date.now() + 5 * 60 * 1000)
    const offset = now.getTimezoneOffset() * 60000
    return new Date(now.getTime() - offset).toISOString().slice(0, 16)
  }

  // Live preview of message with {{name}} replaced
  const previewMessage = messageBody.replace(/\{\{name\}\}/g, 'Amaka')

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <Link href="/broadcasts" style={{ color: '#888', fontSize: 13 }}>← Broadcasts</Link>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>New broadcast</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Broadcast name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Monday promo" required />
          </div>

          {/* Message */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ fontSize: 13, color: '#555' }}>Message</label>
              {/* Variable insert buttons */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => insertVariable('{{name}}')}
                  style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 6,
                    background: '#f0effe', color: '#4338ca',
                    border: '1px solid #afa9ec', cursor: 'pointer', fontWeight: 500,
                  }}
                  title="Inserts the contact's name"
                >
                  + {'{{name}}'}
                </button>
              </div>
            </div>
            <textarea
              value={messageBody}
              onChange={e => setMessageBody(e.target.value)}
              rows={4}
              placeholder="Hi {{name}}, we have a special offer this week..."
              required
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <p style={{ fontSize: 12, color: '#aaa' }}>
                Use <code style={{ background: '#f3f3f1', padding: '1px 4px', borderRadius: 4 }}>{'{{name}}'}</code> to personalise each message
              </p>
              <p style={{ fontSize: 12, color: '#aaa' }}>{messageBody.length} / 1600</p>
            </div>
          </div>

          {/* Live preview */}
          {messageBody.includes('{{name}}') && (
            <div style={{ background: '#f9f9f8', border: '1px solid #e8e8e6', borderRadius: 8, padding: '0.75rem 1rem' }}>
              <p style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preview (for "Amaka")</p>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{previewMessage}</p>
            </div>
          )}

          {/* Send to */}
          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Send to</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ALL_TAGS.map(tag => (
                <button
                  key={String(tag)}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="btn btn-outline"
                  style={{
                    fontSize: 12, padding: '4px 12px',
                    background: targetTags.includes(tag) ? '#4338ca' : undefined,
                    color:      targetTags.includes(tag) ? '#fff'    : undefined,
                    borderColor: targetTags.includes(tag) ? '#4338ca' : undefined,
                  }}
                >
                  {String(tag)}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>
              {targetTags.length === 0 ? 'No tags selected — will send to all contacts' : `Sending to: ${targetTags.join(', ')}`}
            </p>
          </div>

          {/* Send now toggle */}
          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 8 }}>When to send</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setSendNow(false)}
                className="btn btn-outline"
                style={{
                  fontSize: 12, padding: '6px 14px',
                  background: !sendNow ? '#4338ca' : undefined,
                  color:      !sendNow ? '#fff'    : undefined,
                  borderColor: !sendNow ? '#4338ca' : undefined,
                }}
              >
                Schedule for later
              </button>
              <button
                type="button"
                onClick={() => setSendNow(true)}
                className="btn btn-outline"
                style={{
                  fontSize: 12, padding: '6px 14px',
                  background: sendNow ? '#4338ca' : undefined,
                  color:      sendNow ? '#fff'    : undefined,
                  borderColor: sendNow ? '#4338ca' : undefined,
                }}
              >
                Send now
              </button>
            </div>
          </div>

          {/* Schedule time — only shown when not sending now */}
          {!sendNow && (
            <div>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Schedule time</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                min={getLocalDatetimeMin()}
                required={!sendNow}
              />
            </div>
          )}

          {sendNow && (
            <div style={{ background: '#eaf3de', border: '1px solid #97c459', borderRadius: 8, padding: '0.75rem 1rem', fontSize: 13, color: '#27500a' }}>
              ✓ This broadcast will be sent within the next minute
            </div>
          )}

          {/* WhatsApp policy note */}
          <div style={{ background: '#faeeda', border: '1px solid #ef9f27', borderRadius: 8, padding: '0.75rem 1rem', fontSize: 13, color: '#633806' }}>
            <strong>WhatsApp policy:</strong> You can only message contacts who have messaged you first within the last 24 hours, or use pre-approved Message Templates.
          </div>

          {error && (
            <p style={{ background: '#fcebeb', color: '#a32d2d', fontSize: 13, padding: '0.5rem 0.75rem', borderRadius: 8 }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {loading && <Spinner size={13} color="#fff" />}
              {loading ? 'Saving...' : sendNow ? 'Send broadcast now' : 'Schedule broadcast'}
            </button>
            <Link href="/broadcasts" className="btn btn-outline">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
