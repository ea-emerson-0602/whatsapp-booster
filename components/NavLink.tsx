'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

// Drop-in replacement for Link that fires the progress bar on click
export default function NavLink({
  href,
  className,
  children,
  style,
  prefetch,
}: {
  href: string
  className?: string
  children: ReactNode
  style?: React.CSSProperties
  prefetch?: boolean
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  function handleClick() {
    if (pathname !== href) {
      window.dispatchEvent(new Event('progressbar:start'))
    }
  }

  return (
    <Link
      href={href}
      className={className}
      style={style}
      prefetch={prefetch}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}
