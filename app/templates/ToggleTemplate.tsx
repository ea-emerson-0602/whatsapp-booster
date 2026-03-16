'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ToggleTemplate({ id, isActive }: { id: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    const next = !active
    await supabase.from('templates').update({ is_active: next }).eq('id', id)
    setActive(next)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="btn btn-outline"
      style={{ fontSize: 12, padding: '4px 10px' }}
    >
      {active ? 'Pause' : 'Activate'}
    </button>
  )
}
