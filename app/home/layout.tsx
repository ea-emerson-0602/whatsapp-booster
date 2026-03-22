import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WA Booster — Automate Your WhatsApp Business',
  description: 'Save hours every week by automating your WhatsApp customer management. Auto-replies, scheduled broadcasts, contact management and more.',
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
