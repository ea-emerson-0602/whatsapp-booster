import { createClient } from '@/lib/supabase/server'
import { checkLimit } from '@/lib/limits'
import UpgradePrompt from '@/components/UpgradePrompt'
import NewTemplateForm from './NewTemplateForm'
import Link from 'next/link'

export default async function NewTemplatePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { allowed, current, limit } = await checkLimit(user!.id, 'templates')

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <Link href="/templates" style={{ color: '#888', fontSize: 13 }}>← Auto-replies</Link>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>New auto-reply</h1>
      </div>

      {!allowed && (
        <UpgradePrompt resource="templates" current={current} limit={limit} />
      )}

      {allowed ? (
        <NewTemplateForm />
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
          <p>Upgrade your plan to create more auto-reply rules.</p>
        </div>
      )}
    </div>
  )
}
