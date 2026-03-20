'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function Spinner() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 0.7s linear infinite' }}>
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5"/>
        <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  )
}

export default function ResetPasswordPage() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [validSession, setValidSession] = useState(false)
  const supabase = createClient()
  const router   = useRouter()

  // Check we have a valid recovery session from the email link
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setValidSession(true)
    })
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f8', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', border: '1px solid #e8e8e6', borderRadius: 16, padding: '2rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>📲</p>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Set new password</h1>
          <p style={{ fontSize: 14, color: '#888' }}>Choose a strong password for your account</p>
        </div>

        {success ? (
          <div style={{ background: '#eaf3de', color: '#27500a', fontSize: 14, padding: '1rem', borderRadius: 10, textAlign: 'center' }}>
            ✓ Password updated! Redirecting you to the dashboard...
          </div>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>New password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div style={{ background: '#fcebeb', color: '#a32d2d', fontSize: 13, padding: '0.6rem 0.75rem', borderRadius: 8, display: 'flex', gap: 6 }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '0.65rem 1rem', background: loading ? '#6d64d4' : '#4338ca', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
              }}
            >
              {loading && <Spinner />}
              {loading ? 'Updating password...' : 'Set new password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
