'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CancelButton({ subscriptionId }: { subscriptionId: string }) {
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    if (!confirming) {
      setConfirming(true)
      return
    }

    setLoading(true)
    const res = await fetch('/api/subscribe/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId }),
    })

    const data = await res.json()
    if (data.success) {
      router.refresh()
    } else {
      alert(data.error || 'Failed to cancel. Please try again.')
      setLoading(false)
      setConfirming(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {confirming && (
        <p style={{ fontSize: 13, color: '#a32d2d', textAlign: 'center', background: '#fcebeb', padding: '0.5rem', borderRadius: 8 }}>
          Are you sure? Your access will end at the current period end.
        </p>
      )}
      <button
        onClick={handleCancel}
        disabled={loading}
        className="btn btn-outline"
        style={{ width: '100%', justifyContent: 'center', color: '#a32d2d', borderColor: '#f09595', fontSize: 13 }}
      >
        {loading ? 'Canceling...' : confirming ? 'Yes, cancel my subscription' : 'Cancel subscription'}
      </button>
      {confirming && !loading && (
        <button
          onClick={() => setConfirming(false)}
          className="btn btn-outline"
          style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
        >
          Keep my subscription
        </button>
      )}
    </div>
  )
}
