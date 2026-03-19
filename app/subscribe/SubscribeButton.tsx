'use client'
import { useState } from 'react'

export default function SubscribeButton({
  userEmail,
  userId,
}: {
  userEmail: string
  userId: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubscribe() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/subscribe/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, userId }),
      })

      const data = await res.json()

      if (data.authorization_url) {
        // Redirect to Paystack checkout
        window.location.href = data.authorization_url
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '0.75rem' }}
      >
        {loading ? 'Redirecting to checkout...' : 'Subscribe — ₦10,000/month'}
      </button>
      {error && (
        <p style={{ color: '#a32d2d', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  )
}
