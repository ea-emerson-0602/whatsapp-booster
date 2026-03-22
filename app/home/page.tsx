'use client'
import Link from 'next/link'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant auto-replies',
    description: 'Set keywords so customers get answers immediately — even while you sleep. "Price", "order", "delivery" — you decide what triggers the reply.',
  },
  {
    icon: '📣',
    title: 'Scheduled broadcasts',
    description: 'Write your promo once, schedule it to go to hundreds of customers at the perfect time. No copy-pasting. No stress.',
  },
  {
    icon: '👥',
    title: 'Contact management',
    description: 'Tag customers as Lead, Paid, or Pending. Filter, search, and bulk message specific groups. Your entire customer list, organised.',
  },
  {
    icon: '📊',
    title: 'Analytics dashboard',
    description: 'See exactly how many messages you sent, your reply rate, and which auto-replies are working hardest for your business.',
  },
  {
    icon: '📥',
    title: 'Bulk CSV import',
    description: 'Already have a customer list in Excel or Google Sheets? Import all of them in seconds — no manual entry needed.',
  },
  {
    icon: '🔔',
    title: 'Smart reminders',
    description: 'Get notified about customers you haven\'t followed up with in a while. Never let a lead go cold again.',
  },
]

const STEPS = [
  { step: '01', title: 'Connect your WhatsApp', description: 'Link your WhatsApp Business number in minutes. No technical knowledge needed.' },
  { step: '02', title: 'Add your contacts', description: 'Import your existing customer list or add contacts manually. Tag them by status.' },
  { step: '03', title: 'Set up auto-replies', description: 'Create keyword rules once. Your business responds instantly 24/7 from that point on.' },
]

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif", color: '#0f0f0f', background: '#fff' }}>

      {/* Load DM Sans font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap" rel="stylesheet" />

      {/* ── Nav ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 5%', borderBottom: '1px solid #f0f0ee',
        position: 'sticky', top: 0, background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)', zIndex: 100,
      }}>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, letterSpacing: '-0.3px' }}>
          📲 WA Booster
        </span>
        <div className="nav-links" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link className="nav-signin" href="/login" style={{ fontSize: 14, color: '#555', textDecoration: 'none', padding: '0.5rem 1rem' }}>
            Sign in
          </Link>
          <Link href="/signup" style={{
            fontSize: 14, fontWeight: 500, color: '#fff',
            background: '#4338ca', padding: '0.5rem 1.25rem',
            borderRadius: 8, textDecoration: 'none',
          }}>
            Start free trial
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(160deg, #1a1560 0%, #2d2080 50%, #1a1560 100%)',
        color: '#fff', padding: '6rem 5% 5rem', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 99, padding: '6px 16px', fontSize: 13,
            marginBottom: '1.5rem', color: 'rgba(255,255,255,0.85)',
          }}>
            ✦ 7-day free trial · No credit card required
          </div>

          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(2.2rem, 6vw, 3.75rem)',
            lineHeight: 1.1, letterSpacing: '-1px',
            marginBottom: '1.5rem', fontWeight: 400,
          }}>
            Stop answering the same<br />
            <span style={{ color: '#a5b4fc' }}>WhatsApp messages</span> manually
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'rgba(255,255,255,0.72)', lineHeight: 1.7,
            marginBottom: '2.5rem', maxWidth: 520, margin: '0 auto 2.5rem',
          }}>
            WA Booster automates your WhatsApp customer management — auto-replies,
            scheduled broadcasts, and contact tracking — so you can focus on
            actually running your business.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{
              fontSize: 15, fontWeight: 600, color: '#1a1560',
              background: '#fff', padding: '0.875rem 2rem',
              borderRadius: 10, textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            }}>
              Start free — 7 days free trial
            </Link>
            <Link href="/login" style={{
              fontSize: 15, fontWeight: 500, color: '#fff',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '0.875rem 2rem', borderRadius: 10, textDecoration: 'none',
            }}>
              Sign in →
            </Link>
          </div>

          {/* Social proof */}
          <p style={{ marginTop: '2rem', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
            Trusted by small businesses across Nigeria
          </p>
        </div>
      </section>

      {/* ── Problem section ── */}
      <section style={{ padding: '5rem 5%', background: '#fafaf9', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', color: '#4338ca', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Sound familiar?
          </p>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', lineHeight: 1.2, marginBottom: '1.5rem', fontWeight: 400 }}>
            You're spending hours on WhatsApp every day
          </h2>
          <p style={{ fontSize: 16, color: '#666', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 3rem' }}>
            Answering "how much?", "do you deliver?", "what's the price?" over and
            over again. Manually sending promos to hundreds of customers one by one.
            Forgetting to follow up with potential buyers. There's a better way.
          </p>

          {/* Pain points */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { emoji: '😩', text: 'Answering the same questions repeatedly' },
              { emoji: '📋', text: 'Copy-pasting promo messages to every customer' },
              { emoji: '😰', text: 'Losing track of who has paid or is pending' },
              { emoji: '⏰', text: 'Spending your evenings responding to messages' },
            ].map(({ emoji, text }) => (
              <div key={text} style={{
                background: '#fff', border: '1px solid #e8e8e6',
                borderRadius: 12, padding: '1.25rem',
                display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left',
              }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{emoji}</span>
                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.5 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '5rem 5%' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', color: '#4338ca', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Features
            </p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', lineHeight: 1.2, fontWeight: 400 }}>
              Everything your WhatsApp business needs
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {FEATURES.map(({ icon, title, description }) => (
              <div key={title} style={{
                padding: '1.75rem', borderRadius: 14,
                border: '1px solid #e8e8e6', background: '#fff',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#4338ca'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(67,56,202,0.08)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#e8e8e6'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: '#f0effe', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 22, marginBottom: '1rem',
                }}>
                  {icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '5rem 5%', background: '#fafaf9' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', color: '#4338ca', textTransform: 'uppercase', marginBottom: '1rem' }}>
            How it works
          </p>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', lineHeight: 1.2, marginBottom: '3rem', fontWeight: 400 }}>
            Up and running in under 10 minutes
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {STEPS.map(({ step, title, description }) => (
              <div key={step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: '#4338ca', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, margin: '0 auto 1rem',
                }}>
                  {step}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ padding: '5rem 5%', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', color: '#4338ca', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Pricing
          </p>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', lineHeight: 1.2, marginBottom: '1rem', fontWeight: 400 }}>
            Simple, honest pricing
          </h2>
          <p style={{ fontSize: 15, color: '#666', marginBottom: '2.5rem' }}>
            One plan. Everything included. Cancel anytime.
          </p>

          <div style={{
            border: '2px solid #4338ca', borderRadius: 20,
            padding: '2.5rem', position: 'relative', overflow: 'hidden',
          }}>
            {/* Popular badge */}
            <div style={{
              position: 'absolute', top: 16, right: 16,
              background: '#4338ca', color: '#fff',
              fontSize: 11, fontWeight: 600, padding: '4px 12px',
              borderRadius: 99, letterSpacing: '0.05em',
            }}>
              MOST POPULAR
            </div>

            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Starter Plan</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 52, lineHeight: 1 }}>₦10,000</span>
              <span style={{ fontSize: 15, color: '#888' }}> / month</span>
            </div>

            <div style={{ borderTop: '1px solid #f0f0ee', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
              {[
                '7-day free trial — no charge upfront',
                'Up to 500 contacts',
                'Unlimited keyword auto-replies',
                'Scheduled broadcasts',
                'Analytics dashboard',
                'CSV bulk import',
                'WhatsApp webhook integration',
              ].map(feat => (
                <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, textAlign: 'left' }}>
                  <span style={{ color: '#4338ca', fontSize: 16, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14, color: '#444' }}>{feat}</span>
                </div>
              ))}
            </div>

            <Link href="/signup" style={{
              display: 'block', fontSize: 15, fontWeight: 600, color: '#fff',
              background: '#4338ca', padding: '0.875rem',
              borderRadius: 10, textDecoration: 'none', textAlign: 'center',
            }}>
              Start your free trial →
            </Link>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 12 }}>
              No credit card charged during trial · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{
        padding: '5rem 5%', textAlign: 'center',
        background: 'linear-gradient(160deg, #1a1560 0%, #2d2080 100%)',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', lineHeight: 1.2, marginBottom: '1rem', fontWeight: 400 }}>
            Your competitors are already automating. Are you?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Join small businesses saving hours every week with WA Booster.
            Start your 7-day free trial today — no credit card needed.
          </p>
          <Link href="/signup" style={{
            display: 'inline-block', fontSize: 15, fontWeight: 600, color: '#1a1560',
            background: '#fff', padding: '0.875rem 2.5rem',
            borderRadius: 10, textDecoration: 'none',
          }}>
            Get started free →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '2rem 5%', borderTop: '1px solid #f0f0ee',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12, fontSize: 13, color: '#999',
      }}>
        <span style={{ fontFamily: "'DM Serif Display', serif", color: '#1a1a1a', fontSize: 15 }}>
          📲 WA Booster
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/login" style={{ color: '#999', textDecoration: 'none' }}>Sign in</Link>
          <Link href="/signup" style={{ color: '#999', textDecoration: 'none' }}>Sign up</Link>
        </div>
        <span>© {new Date().getFullYear()} WA Booster</span>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        * { box-sizing: border-box; }
        @media (max-width: 600px) {
          .nav-links { gap: 8px; }
          .nav-signin { display: none; }
        }
      `}} />
    </div>
  )
}
