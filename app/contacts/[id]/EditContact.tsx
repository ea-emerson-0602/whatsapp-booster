'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Customer } from '@/lib/types'
import Spinner from '@/components/Spinner'

export default function EditContact({ contact }: { contact: Customer }) {
  const [editing, setEditing] = useState(false)
  const [name, setName]   = useState(contact.name)
  const [phone, setPhone] = useState(contact.phone)
  const [notes, setNotes] = useState(contact.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const supabase = createClient()
  const router   = useRouter()

  function handleCancel() {
    setName(contact.name)
    setPhone(contact.phone)
    setNotes(contact.notes ?? '')
    setError('')
    setEditing(false)
  }

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return }
    if (!phone.trim()) { setError('Phone is required'); return }
    if (!phone.startsWith('+')) { setError('Phone must start with + and country code'); return }

    setSaving(true)
    setError('')

    const { error } = await supabase
      .from('customers')
      .update({ name: name.trim(), phone: phone.trim(), notes: notes.trim() || null })
      .eq('id', contact.id)

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="btn btn-outline"
        style={{ fontSize: 12, padding: '4px 12px' }}
      >
        Edit contact
      </button>
    )
  }

  return (
    <div style={{ borderTop: '1px solid #f0f0ee', paddingTop: 16, marginTop: 4 }}>
      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: '#1a1a1a' }}>
        Edit contact
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Full name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full name"
            style={{ fontSize: 13 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>
            WhatsApp number <span style={{ color: '#bbb' }}>(include country code)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+2348012345678"
            style={{ fontSize: 13 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Any notes about this contact..."
            style={{ fontSize: 13, resize: 'vertical' }}
          />
        </div>

        {error && (
          <p style={{ fontSize: 13, color: '#a32d2d', background: '#fcebeb', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
            ⚠ {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {saving && <Spinner size={13} color="#fff" />}
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="btn btn-outline"
            style={{ fontSize: 13 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
