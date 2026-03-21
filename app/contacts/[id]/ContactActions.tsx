'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Tag, Customer } from '@/lib/types'
import Spinner from '@/components/Spinner'

const TAGS: { value: Tag; label: string }[] = [
  { value: 'Lead', label: 'Lead' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Pending', label: 'Pending' },
]

export default function ContactActions({ contact }: { contact: Customer }) {
  const [tag, setTag] = useState<Tag>(contact.tag)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleTagChange(newTag: Tag) {
    if (newTag === tag) return
    setSaving(true)
    await supabase.from('customers').update({ tag: newTag }).eq('id', contact.id)
    setTag(newTag)
    setSaving(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    await supabase.from('customers').delete().eq('id', contact.id)
    router.push('/contacts')
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Show hint if currently untagged */}
      {tag === null && (
        <p style={{ fontSize: 12, color: '#aaa', marginBottom: 2 }}>
          No tag set — pick one below:
        </p>
      )}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {TAGS.map(({ value, label }) => (
          <button
            key={label}
            onClick={() => handleTagChange(value)}
            disabled={saving}
            className={`tag tag-${value}`}
            style={{
              cursor: saving ? 'wait' : 'pointer',
              border: tag === value ? '2px solid currentColor' : '2px solid transparent',
              background: tag === value ? undefined : '#f3f3f1',
              color: tag === value ? undefined : '#aaa',
              opacity: saving ? 0.6 : 1,
              transition: 'all 0.15s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {saving && tag !== value && <Spinner size={10} />}
            {label}
          </button>
        ))}
        {saving && <span style={{ fontSize: 12, color: '#aaa' }}>Saving...</span>}
      </div>

      <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            fontSize: 12,
            color: confirmDelete ? '#a32d2d' : '#aaa',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontWeight: confirmDelete ? 500 : 400,
          }}
        >
          {deleting ? 'Deleting...' : confirmDelete ? 'Tap again to confirm delete' : 'Delete contact'}
        </button>
        {confirmDelete && (
          <button
            onClick={() => setConfirmDelete(false)}
            style={{ fontSize: 12, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
