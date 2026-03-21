'use client'
import { useEffect, useState, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function ProgressBar() {
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible]   = useState(false)
  const timerRef  = useRef<NodeJS.Timeout | null>(null)
  const startRef  = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Route changed — finish the bar
    if (visible) {
      setProgress(100)
      timerRef.current = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 300)
    }
  }, [pathname, searchParams])

  // Expose a way to start the bar from anywhere
  useEffect(() => {
    function handleStart() {
      if (timerRef.current)  clearTimeout(timerRef.current)
      if (startRef.current)  clearTimeout(startRef.current)
      setProgress(0)
      setVisible(true)
      // Animate to 80% quickly, then slow down waiting for route change
      startRef.current = setTimeout(() => setProgress(30), 10)
      timerRef.current = setTimeout(() => setProgress(60), 200)
      timerRef.current = setTimeout(() => setProgress(80), 600)
    }

    window.addEventListener('progressbar:start', handleStart)
    return () => window.removeEventListener('progressbar:start', handleStart)
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #4338ca, #818cf8)',
        transition: progress === 100
          ? 'width 0.2s ease-out, opacity 0.3s ease'
          : 'width 0.4s ease',
        opacity: progress === 100 ? 0 : 1,
        borderRadius: '0 2px 2px 0',
      }} />
    </div>
  )
}
