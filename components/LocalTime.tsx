'use client'

// Formats a UTC date string into the user's local timezone
// Must be a client component — server components don't know the user's timezone
export function LocalTime({ dateString, showTime = true }: { dateString: string; showTime?: boolean }) {
  const date = new Date(dateString)

  const formatted = date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(showTime && { hour: '2-digit', minute: '2-digit' }),
  })

  return <span>{formatted}</span>
}
