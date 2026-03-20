import Link from 'next/link'
import type { LimitKey } from '@/lib/limits'

const MESSAGES: Record<LimitKey, { title: string; description: string }> = {
  contacts: {
    title: "You've reached your contact limit",
    description: "Free accounts can store up to 50 contacts. Upgrade to add up to 500 contacts.",
  },
  templates: {
    title: "You've reached your auto-reply limit",
    description: "Free accounts can have up to 3 auto-reply rules. Upgrade for up to 20.",
  },
  broadcasts: {
    title: "You've reached your broadcast limit",
    description: "Free accounts can schedule up to 2 broadcasts at a time. Upgrade for up to 10.",
  },
}

export default function UpgradePrompt({
  resource,
  current,
  limit,
}: {
  resource: LimitKey
  current: number
  limit: number
}) {
  const { title, description } = MESSAGES[resource]

  return (
    <div style={{
      background: '#f0effe',
      border: '1px solid #afa9ec',
      borderRadius: 12,
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div>
        <p style={{ fontWeight: 500, fontSize: 15, color: '#3c3489', marginBottom: 4 }}>
          {title}
        </p>
        <p style={{ fontSize: 13, color: '#534ab7' }}>
          {description}
        </p>
        <p style={{ fontSize: 12, color: '#7f77dd', marginTop: 4 }}>
          {current} / {limit} used
        </p>
      </div>
      <Link
        href="/subscribe"
        className="btn"
        style={{ background: '#4338ca', color: '#fff', fontSize: 13, flexShrink: 0 }}
      >
        Upgrade now →
      </Link>
    </div>
  )
}
