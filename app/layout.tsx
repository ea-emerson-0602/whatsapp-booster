import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import './globals.css'

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
  // Use getUser() only once here in the root layout.
  // Middleware handles per-route auth redirects so this
  // result is just used to decide whether to show the sidebar.
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body>
        {user ? (
          // Single flex container — sidebar + main are siblings
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
