'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',    icon: '◈' },
  { href: '/contacts',   label: 'Contacts',     icon: '◉' },
  { href: '/broadcasts', label: 'Broadcasts',   icon: '◎' },
  { href: '/templates',  label: 'Auto-replies', icon: '◇' },
  { href: '/analytics',  label: 'Analytics',    icon: '◈' },
  { href: '/subscribe',  label: 'Subscription', icon: '◆' },
]

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  trialing: { bg: '#e6f1fb', color: '#0c447c', label: 'Trial' },
  active:   { bg: '#eaf3de', color: '#27500a', label: 'Active' },
  past_due: { bg: '#faeeda', color: '#633806', label: 'Past due' },
  canceled: { bg: '#fcebeb', color: '#a32d2d', label: 'Canceled' },
}

export default function Sidebar({ user }: { user: User }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()
  const [open, setOpen] = useState(false)
  const [subStatus, setSubStatus] = useState<string | null>(null)

  // Fetch subscription status
  useEffect(() => {
    supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setSubStatus(data.status)
      })
  }, [user.id])

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const statusStyle = subStatus ? STATUS_STYLES[subStatus] : null

  const navContent = (
    <>
      <div className="sidebar-logo">
        <span>📲 WA Booster</span>
        <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu">✕</button>
      </div>

      {NAV.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          prefetch={true}
          className={`nav-link ${pathname === href ? 'active' : ''}`}
        >
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ flex: 1 }}>{label}</span>
          {/* Show status badge on Subscription link */}
          {href === '/subscribe' && statusStyle && (
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 99,
              background: statusStyle.bg,
              color: statusStyle.color,
              letterSpacing: '0.02em',
            }}>
              {statusStyle.label}
            </span>
          )}
          {/* Show upgrade prompt if no subscription */}
          {href === '/subscribe' && !subStatus && (
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 99,
              background: '#f0effe',
              color: '#4338ca',
            }}>
              Free
            </span>
          )}
        </Link>
      ))}

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e8e8e6' }}>
        <p style={{ fontSize: 12, color: '#999', padding: '0 0.75rem 0.5rem', wordBreak: 'break-all' }}>
          {user.email}
        </p>
        <button
          onClick={handleSignOut}
          className="nav-link"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          ↩ Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <span className="mobile-topbar-logo">📲 WA Booster</span>
        <button className="hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
      </div>

      {/* Overlay behind drawer */}
      <div
        className={`sidebar-overlay ${open ? 'open' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar / drawer */}
      <nav className={`sidebar ${open ? 'open' : ''}`}>
        {navContent}
      </nav>
    </>
  )
}
