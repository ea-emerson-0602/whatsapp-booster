'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Mode = 'login' | 'signup' | 'reset'

// ── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'auth-spin 0.7s linear infinite', flexShrink: 0 }}>
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5"/>
        <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <style>{`@keyframes auth-spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  )
}

// ── OAuth Button ──────────────────────────────────────────────────────────────
function OAuthButton({
  provider,
  label,
  icon,
  loading,
  onClick,
}: {
  provider: string
  label: string
  icon: React.ReactNode
  loading: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '0.6rem 1rem',
        border: '1px solid #e8e8e6',
        borderRadius: 8,
        background: '#fff',
        fontSize: 14,
        color: '#1a1a1a',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition: 'background 0.15s, border-color 0.15s',
        fontWeight: 500,
      }}
      onMouseEnter={e => { if (!loading) (e.target as HTMLElement).closest('button')!.style.background = '#f9f9f8' }}
      onMouseLeave={e => { (e.target as HTMLElement).closest('button')!.style.background = '#fff' }}
    >
      {loading ? <Spinner /> : icon}
      {label}
    </button>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
      <div style={{ flex: 1, height: 1, background: '#e8e8e6' }} />
      <span style={{ fontSize: 12, color: '#aaa', flexShrink: 0 }}>or</span>
      <div style={{ flex: 1, height: 1, background: '#e8e8e6' }} />
    </div>
  )
}

// ── Main AuthCard ─────────────────────────────────────────────────────────────
export default function AuthCard({ mode }: { mode: Mode }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  const supabase = createClient()
  const router   = useRouter()

  // ── OAuth ──
  async function handleOAuth(provider: 'google' | 'facebook') {
    setOauthLoading(provider)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setOauthLoading(null)
    }
    // No need to setLoading(false) — page will redirect
  }

  // ── Email login ──
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  // ── Email signup ──
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  // ── Password reset ──
  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess('Check your email — we sent you a password reset link.')
    }
  }

  const isReset  = mode === 'reset'
  const isSignup = mode === 'signup'
  const isLogin  = mode === 'login'

  const title    = isReset ? 'Reset your password' : isSignup ? 'Create your account' : 'Welcome back'
  const subtitle = isReset
    ? "Enter your email and we'll send you a reset link"
    : isSignup
    ? 'Start your 7-day free trial — no credit card required'
    : 'Sign in to your WA Booster account'

  const submitLabel   = isReset ? 'Send reset link' : isSignup ? 'Create account' : 'Sign in'
  const loadingLabel  = isReset ? 'Sending...' : isSignup ? 'Creating account...' : 'Signing in...'
  const handleSubmit  = isReset ? handleReset : isSignup ? handleSignup : handleLogin

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9f9f8',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: '#fff',
        border: '1px solid #e8e8e6',
        borderRadius: 16,
        padding: '2rem',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>📲</p>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>WA Booster</h1>
          <p style={{ fontSize: 14, color: '#888' }}>{subtitle}</p>
        </div>

        {/* OAuth buttons — not shown on reset screen */}
        {!isReset && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <OAuthButton
                provider="google"
                label="Continue with Google"
                loading={oauthLoading === 'google'}
                onClick={() => handleOAuth('google')}
                icon={
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                }
              />
            </div>
            <Divider />
          </>
        )}

        {/* Email form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@business.com"
              required
              autoComplete="email"
            />
          </div>

          {!isReset && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: 13, color: '#555' }}>Password</label>
                {isLogin && (
                  <Link href="/forgot-password" style={{ fontSize: 12, color: '#4338ca' }}>
                    Forgot password?
                  </Link>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isSignup ? 'Min. 8 characters' : '••••••••'}
                minLength={isSignup ? 8 : undefined}
                required
                autoComplete={isSignup ? 'new-password' : 'current-password'}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: '#fcebeb', color: '#a32d2d', fontSize: 13, padding: '0.6rem 0.75rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ flexShrink: 0 }}>⚠</span> {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{ background: '#eaf3de', color: '#27500a', fontSize: 13, padding: '0.6rem 0.75rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ flexShrink: 0 }}>✓</span> {success}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !!oauthLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '0.65rem 1rem',
              background: loading ? '#6d64d4' : '#4338ca',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: loading || !!oauthLoading ? 'not-allowed' : 'pointer',
              opacity: !!oauthLoading ? 0.7 : 1,
              transition: 'background 0.15s',
              marginTop: 4,
            }}
          >
            {loading && <Spinner />}
            {loading ? loadingLabel : submitLabel}
          </button>
        </form>

        {/* Footer links */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: 13, color: '#888' }}>
          {isLogin && (
            <p>Don't have an account? <Link href="/signup" style={{ color: '#4338ca', fontWeight: 500 }}>Sign up free</Link></p>
          )}
          {isSignup && (
            <p>Already have an account? <Link href="/login" style={{ color: '#4338ca', fontWeight: 500 }}>Sign in</Link></p>
          )}
          {isReset && (
            <p><Link href="/login" style={{ color: '#4338ca', fontWeight: 500 }}>← Back to sign in</Link></p>
          )}
        </div>
      </div>
    </div>
  )
}
