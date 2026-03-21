import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function OnboardingChecklist({ userId }: { userId: string }) {
  const supabase = createClient()

  // Check completion of each step in parallel
  const [
    { count: contactCount },
    { count: templateCount },
    { count: broadcastCount },
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('templates').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('broadcasts').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ])

  const steps = [
    {
      id: 'contact',
      label: 'Add your first contact',
      description: 'Import a customer to get started',
      done: (contactCount ?? 0) > 0,
      href: '/contacts/new',
      cta: 'Add contact →',
    },
    {
      id: 'template',
      label: 'Create an auto-reply',
      description: 'Set up a keyword to reply automatically',
      done: (templateCount ?? 0) > 0,
      href: '/templates/new',
      cta: 'Create auto-reply →',
    },
    {
      id: 'broadcast',
      label: 'Schedule a broadcast',
      description: 'Send a message to your contacts',
      done: (broadcastCount ?? 0) > 0,
      href: '/broadcasts/new',
      cta: 'Schedule broadcast →',
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const allDone = completedCount === steps.length

  // Hide checklist once everything is done
  if (allDone) return null

  const progressPct = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="card" style={{ marginBottom: '1.5rem', background: '#fafafa' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <p style={{ fontWeight: 500, fontSize: 15 }}>Get started with WA Booster</p>
          <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
            {completedCount} of {steps.length} steps completed
          </p>
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#4338ca' }}>{progressPct}%</span>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#e8e8e6', borderRadius: 99, height: 5, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{
          height: '100%',
          borderRadius: 99,
          width: `${progressPct}%`,
          background: '#4338ca',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((step, i) => (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '0.75rem 1rem',
              borderRadius: 10,
              background: step.done ? '#f3f3f1' : '#fff',
              border: `1px solid ${step.done ? '#e8e8e6' : '#e0dffd'}`,
              opacity: step.done ? 0.7 : 1,
            }}
          >
            {/* Step number / check */}
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: step.done ? '#eaf3de' : '#f0effe',
              color: step.done ? '#27500a' : '#4338ca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              flexShrink: 0,
            }}>
              {step.done ? '✓' : i + 1}
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: 14,
                fontWeight: 500,
                color: step.done ? '#888' : '#1a1a1a',
                textDecoration: step.done ? 'line-through' : 'none',
              }}>
                {step.label}
              </p>
              {!step.done && (
                <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{step.description}</p>
              )}
            </div>

            {/* CTA */}
            {!step.done && (
              <Link
                href={step.href}
                style={{
                  fontSize: 12,
                  color: '#4338ca',
                  fontWeight: 500,
                  textDecoration: 'none',
                  flexShrink: 0,
                }}
              >
                {step.cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
