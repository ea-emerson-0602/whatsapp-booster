'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type ParsedContact = {
  name: string
  phone: string
  valid: boolean
  error?: string
}

const TEMPLATE_CSV = `name,phone
Amaka Osei,+2348012345678
Tunde Bello,+2348098765432
Ngozi Adaeze,+2347011223344`

function parseCSV(text: string): ParsedContact[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const [name = '', phone = ''] = cols

    if (!name) return { name, phone, valid: false, error: 'Name is required' }
    if (!phone) return { name, phone, valid: false, error: 'Phone is required' }
    if (!phone.startsWith('+')) return { name, phone, valid: false, error: 'Phone must start with + and country code' }

    return { name, phone, valid: true }
  }).filter(c => c.name || c.phone)
}

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'wa-booster-contacts-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function ImportPage() {
  const [contacts, setContacts] = useState<ParsedContact[]>([])
  const [search, setSearch] = useState('')
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(0)
  const [skipped, setSkipped] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setDone(false)
    setImported(0)
    setSkipped(0)
    setErrors([])
    setSearch('')

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setContacts(parseCSV(text))
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    setImporting(true)
    setErrors([])

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const valid = contacts.filter(c => c.valid)
    let successCount = 0
    let skippedCount = 0
    const importErrors: string[] = []

    const batchSize = 10
    for (let i = 0; i < valid.length; i += batchSize) {
      const batch = valid.slice(i, i + batchSize).map(c => ({
        user_id: user.id,
        name: c.name,
        phone: c.phone,
        tag: null, // owner sets tag individually after import
      }))

      const { error, data } = await supabase
        .from('customers')
        .upsert(batch, {
          onConflict: 'phone,user_id',
          ignoreDuplicates: true,
        })
        .select()

      if (error) {
        importErrors.push(error.message)
      } else {
        const inserted = data?.length ?? 0
        successCount += inserted
        skippedCount += batch.length - inserted
      }
    }

    setImported(successCount)
    setSkipped(skippedCount)
    setErrors(importErrors)
    setImporting(false)
    setDone(true)

    if (importErrors.length === 0) {
      setTimeout(() => {
        router.push('/contacts')
        router.refresh()
      }, 2500)
    }
  }

  const validCount   = contacts.filter(c => c.valid).length
  const invalidCount = contacts.filter(c => !c.valid).length

  const filtered = contacts.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <Link href="/contacts" style={{ color: '#888', fontSize: 13 }}>← Contacts</Link>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Import contacts</h1>
      </div>

      {/* Step 1 — Template */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>Step 1 — Download template</p>
            <p style={{ fontSize: 13, color: '#888' }}>
              Fill in your contacts. Only name and phone number needed.
            </p>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
              Phone must include country code e.g. +2348012345678
            </p>
          </div>
          <button onClick={downloadTemplate} className="btn btn-outline" style={{ fontSize: 13, flexShrink: 0 }}>
            ↓ Download template
          </button>
        </div>
      </div>

      {/* Step 2 — Upload */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 12 }}>Step 2 — Upload your CSV</p>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed #d1d1ce',
            borderRadius: 10,
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: fileName ? '#f9f9f8' : '#fff',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#4338ca')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#d1d1ce')}
        >
          <p style={{ fontSize: 28, marginBottom: 8 }}>📂</p>
          {fileName ? (
            <div>
              <p style={{ fontWeight: 500, fontSize: 14 }}>{fileName}</p>
              <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Click to choose a different file</p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#4338ca' }}>Click to upload CSV</p>
              <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>Only .csv files supported</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Preview */}
      {contacts.length > 0 && !done && (
        <div className="card" style={{ marginBottom: '1rem', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0ee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: 15 }}>Step 3 — Review & import</p>
                <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                  {validCount} valid{invalidCount > 0 ? ` · ${invalidCount} with errors` : ''} · All contacts imported as Lead — change tags individually after
                </p>
              </div>
              <button
                onClick={handleImport}
                disabled={importing || validCount === 0}
                className="btn btn-primary"
                style={{ fontSize: 13 }}
              >
                {importing ? 'Importing...' : `Import ${validCount} contacts`}
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9f9f8', borderBottom: '1px solid #e8e8e6' }}>
                  <th style={{ padding: '8px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '8px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>Name</th>
                  <th style={{ padding: '8px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>Phone</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0ee', background: c.valid ? '#fff' : '#fffbf9' }}>
                    <td style={{ padding: '8px 16px' }}>
                      {c.valid
                        ? <span style={{ color: '#27500a', fontSize: 12 }}>✓ Valid</span>
                        : <span style={{ color: '#a32d2d', fontSize: 12 }}>⚠ {c.error}</span>}
                    </td>
                    <td style={{ padding: '8px 16px', fontWeight: 500 }}>{c.name || '—'}</td>
                    <td style={{ padding: '8px 16px', color: '#666' }}>{c.phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 50 && (
              <p style={{ fontSize: 12, color: '#aaa', padding: '0.75rem 1rem', textAlign: 'center' }}>
                Showing 50 of {filtered.length} rows
              </p>
            )}
            {filtered.length === 0 && search && (
              <p style={{ fontSize: 13, color: '#aaa', padding: '1rem', textAlign: 'center' }}>
                No contacts match "{search}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* Success / error state */}
      {done && (
        <div style={{
          background: errors.length === 0 ? '#eaf3de' : '#faeeda',
          border: `1px solid ${errors.length === 0 ? '#97c459' : '#ef9f27'}`,
          borderRadius: 12,
          padding: '1.25rem 1.5rem',
          fontSize: 14,
          color: errors.length === 0 ? '#27500a' : '#633806',
        }}>
          <p style={{ fontWeight: 500, marginBottom: 6 }}>
            {errors.length === 0
              ? `✓ Successfully imported ${imported} contacts!`
              : `Imported ${imported} contacts with some issues`}
          </p>
          {skipped > 0 && (
            <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
              {skipped} duplicate{skipped > 1 ? 's' : ''} skipped — already in your contacts
            </p>
          )}
          {errors.length === 0 ? (
            <p style={{ fontSize: 13, opacity: 0.8 }}>Redirecting to contacts...</p>
          ) : (
            <div>
              {errors.map((e, i) => <p key={i} style={{ fontSize: 13, marginBottom: 4 }}>• {e}</p>)}
              <Link href="/contacts" className="btn btn-outline" style={{ marginTop: 12, fontSize: 13 }}>
                Go to contacts →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
