import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Message } from '@/lib/types'
import { LocalTime } from '@/components/LocalTime'
import ContactActions from './ContactActions'
import MessageBox from './MessageBox'
import EditContact from './EditContact'

export default async function ContactDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: contact }, { data: messages }] = await Promise.all([
    supabase
      .from('customers')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user!.id)
      .single(),
    supabase
      .from('messages')
      .select('*')
      .eq('customer_id', params.id)
      .order('created_at', { ascending: true }),
  ])

  if (!contact) notFound()

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link href="/contacts" style={{ color: '#888', fontSize: 13, flexShrink: 0 }}>← Contacts</Link>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>{contact.name}</h1>
        <span className={`tag tag-${contact.tag ?? 'Untagged'}`}>
          {contact.tag ?? 'Untagged'}
        </span>
      </div>

      {/* Contact info card */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Phone</p>
            <p style={{ fontSize: 14, fontWeight: 500 }}>{contact.phone}</p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Added</p>
            <p style={{ fontSize: 14 }}>
              <LocalTime dateString={contact.created_at} showTime={false} />
            </p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Last message</p>
            <p style={{ fontSize: 14 }}>
              {contact.last_message_at
                ? <LocalTime dateString={contact.last_message_at} showTime={true} />
                : '—'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Tag</p>
            <ContactActions contact={contact} />
          </div>
        </div>

        {contact.notes && (
          <div style={{ borderTop: '1px solid #f0f0ee', paddingTop: 12, marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Notes</p>
            <p style={{ fontSize: 14, color: '#555' }}>{contact.notes}</p>
          </div>
        )}

        {/* Inline edit form */}
        <EditContact contact={contact} />
      </div>

      {/* Message history */}
      <div className="card" style={{ marginBottom: '1rem', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0ee' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Message history
          </p>
        </div>

        <div style={{ maxHeight: 400, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages && messages.length > 0 ? messages.map((msg: Message) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.direction === 'outbound' ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{
                maxWidth: '75%',
                padding: '0.5rem 0.875rem',
                borderRadius: msg.direction === 'outbound' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: msg.direction === 'outbound' ? '#4338ca' : '#f3f3f1',
                color: msg.direction === 'outbound' ? '#fff' : '#1a1a1a',
                fontSize: 14,
                lineHeight: 1.5,
              }}>
                {msg.body}
              </div>
              <p style={{ fontSize: 11, color: '#bbb', marginTop: 3, padding: '0 4px' }}>
                <LocalTime dateString={msg.created_at} showTime={true} />
              </p>
            </div>
          )) : (
            <p style={{ color: '#bbb', fontSize: 13, textAlign: 'center', padding: '1rem' }}>
              No messages yet. Send the first one below.
            </p>
          )}
        </div>
      </div>

      {/* Send message box */}
      <MessageBox customerId={contact.id} customerName={contact.name} />
    </div>
  )
}
