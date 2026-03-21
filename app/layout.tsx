import type { Metadata } from 'next'
import './globals.css'
import './styles.css'

import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import ProgressBar from '@/components/ProgressBar'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'WhatsApp Booster',
  description: 'Automate your WhatsApp Business workflow',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        {user ? (
          <div className="app-shell">
            <Sidebar user={user} />
            <main className="app-main">
              {children}
            </main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  )
}
