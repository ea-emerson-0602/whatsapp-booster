'use client'
import NavLink from '@/components/NavLink'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'

const NAV = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/contacts',
    label: 'Contacts',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: '/broadcasts',
    label: 'Broadcasts',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.1 11.9 19.79 19.79 0 0 1 1.07 3.27 2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/>
        <path d="M14.05 3a9 9 0 0 1 7 7"/><path d="M14.05 7A5 5 0 0 1 17 10"/>
      </svg>
    ),
  },
  {
    href: '/templates',
    label: 'Auto-replies',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <path d="M8 10h8"/><path d="M8 14h4"/>
      </svg>
    ),
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
  {
    href: '/subscribe',
    label: 'Subscription',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
]

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  trialing: { bg: '#e6f1fb', color: '#0c447c', label: 'Trial' },
  active:   { bg: '#eaf3de', color: '#27500a', label: 'Active' },
  past_due: { bg: '#faeeda', color: '#633806', label: 'Past due' },
  canceled: { bg: '#fcebeb', color: '#a32d2d', label: 'Canceled' },
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#4338ca', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, flexShrink: 0, letterSpacing: '-0.5px',
    }}>
      {initials}
    </div>
  )
}

export default function Sidebar({ user }: { user: User }) {
  const pathname  = usePathname()
  const supabase  = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed]   = useState(true)
  const [subStatus, setSubStatus]   = useState<string | null>(null)

  useEffect(() => {
    supabase.from('subscriptions').select('status').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setSubStatus(data.status) })
  }, [user.id])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const statusStyle  = subStatus ? STATUS_STYLES[subStatus] : null
  const displayName  = user.user_metadata?.full_name || user.user_metadata?.name || user.email || ''

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar">
        <span className="mobile-topbar-logo">📲 WA Booster</span>
        <button className="hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
      </div>

      {/* ── Mobile overlay ── */}
      <div className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />

      {/* ── Mobile sidebar — always full width, unchanged ── */}
      <nav className={`sidebar sidebar-mobile ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span>📲 WA Booster</span>
          <button className="sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">✕</button>
        </div>

        {NAV.map(({ href, label, icon }) => (
          <NavLink key={href} href={href} prefetch={true} className={`nav-link ${pathname === href ? 'active' : ''}`}>
            <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {href === '/subscribe' && statusStyle && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 99, background: statusStyle.bg, color: statusStyle.color }}>{statusStyle.label}</span>
            )}
            {href === '/subscribe' && !subStatus && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 99, background: '#f0effe', color: '#4338ca' }}>Free</span>
            )}
          </NavLink>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e8e8e6' }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', padding: '0 0.75rem 2px', wordBreak: 'break-word' }}>
            {displayName}
          </p>
          <p style={{ fontSize: 12, color: '#999', padding: '0 0.75rem 0.5rem', wordBreak: 'break-all' }}>
            {user.email}
          </p>
          <button onClick={handleSignOut} className="nav-link"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            ↩ Sign out
          </button>
        </div>
      </nav>

      {/* ── Desktop sidebar — collapsible ── */}
      <nav className="sidebar sidebar-desktop" style={{ width: collapsed ? 64 : 220, minWidth: collapsed ? 64 : 220 }}>

        {/* Toggle button */}
        <div style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.25rem' }}>
          {!collapsed && <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>📲 WA Booster</span>}
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand' : 'Collapse'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 6, borderRadius: 6, display: 'flex', lineHeight: 1 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>

        {/* Nav links */}
        {NAV.map(({ href, label, icon }) => (
          <div key={href} className="tooltip-wrapper"
            onMouseEnter={e => {
              const el = e.currentTarget.querySelector('.nav-tooltip') as HTMLElement
              if (!el) return
              const rect = e.currentTarget.getBoundingClientRect()
              el.style.top = `${rect.top + rect.height / 2 - 13}px`
              el.style.left = `${rect.right + 10}px`
            }}
          >
            <NavLink href={href} prefetch={true} className={`nav-link ${pathname === href ? 'active' : ''}`}
              style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '0.6rem' : '0.55rem 0.75rem' }}>
              <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>
              {!collapsed && (
                <>
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>{label}</span>
                  {href === '/subscribe' && statusStyle && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 99, background: statusStyle.bg, color: statusStyle.color }}>{statusStyle.label}</span>
                  )}
                  {href === '/subscribe' && !subStatus && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 99, background: '#f0effe', color: '#4338ca' }}>Free</span>
                  )}
                </>
              )}
            </NavLink>
            {collapsed && <span className="nav-tooltip">{label}</span>}
          </div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e8e8e6', display: 'flex', flexDirection: 'column', gap: 8, alignItems: collapsed ? 'center' : 'stretch' }}>
          <div className="footer-item"
            onMouseEnter={e => {
              const el = e.currentTarget.querySelector('.footer-tooltip') as HTMLElement
              if (!el) return
              const rect = e.currentTarget.getBoundingClientRect()
              el.style.top = `${rect.top + rect.height / 2 - 13}px`
              el.style.left = `${rect.right + 10}px`
              el.style.position = 'fixed'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, padding: collapsed ? 4 : '0 0.5rem', cursor: 'default', justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <Avatar name={displayName} size={32} />
              {!collapsed && (
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {displayName.split(' ')[0]}
                  </p>
                  <p style={{ fontSize: 11, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </p>
                </div>
              )}
            </div>
            {collapsed && (
              <span className="footer-tooltip">
                {displayName || user.email}
              </span>
            )}
          </div>

          <div className="footer-item"
            onMouseEnter={e => {
              const el = e.currentTarget.querySelector('.footer-tooltip') as HTMLElement
              if (!el) return
              const rect = e.currentTarget.getBoundingClientRect()
              el.style.top = `${rect.top + rect.height / 2 - 13}px`
              el.style.left = `${rect.right + 10}px`
              el.style.position = 'fixed'
            }}
          >
            <button onClick={handleSignOut}
              style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 8, padding: collapsed ? '0.5rem' : '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: '#888', borderRadius: 8, fontSize: 13, width: '100%', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f3f3f1')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {!collapsed && <span>Sign out</span>}
            </button>
            {collapsed && (
              <span className="footer-tooltip">Sign out</span>
            )}
          </div>
        </div>
      </nav>

      <style>{`
        .sidebar-mobile { display: none; }
        .sidebar-desktop { display: flex; transition: width 0.2s ease, min-width 0.2s ease; overflow: visible; }
        .tooltip-wrapper { position: relative; display: block; width: 100%; }
        .footer-item { position: relative; display: block; width: 100%; }
        .nav-tooltip {
          position: fixed;
          background: #1a1a1a;
          color: #fff;
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s;
          z-index: 999;
        }
        .footer-tooltip {
          position: absolute;
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
          background: #1a1a1a;
          color: #fff;
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s;
          z-index: 999;
        }
        .tooltip-wrapper:hover .nav-tooltip { opacity: 1; }
        .footer-item:hover .footer-tooltip { opacity: 1; }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile { display: flex !important; }
        }
      `}</style>
    </>
  )
}
