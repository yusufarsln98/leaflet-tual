'use client'

import Link from 'next/link'
import { NAV_ITEMS } from './constants'

interface NavbarLinksProps {
  pathname: string
  onPrefetch: (href: string) => void
}

export function NavbarLinks({ pathname, onPrefetch }: NavbarLinksProps) {
  return (
    <div className="hidden md:flex items-center h-14">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.to || (item.to === '/releases' && pathname === '/changelog')
        return (
          <Link
            key={item.to}
            href={item.to}
            onMouseEnter={() => onPrefetch(item.to)}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex items-center gap-1.5 h-14 px-3.5 text-[13px] transition-colors hover:text-text-primary ${
              isActive
                ? 'text-text-primary font-semibold'
                : 'text-text-secondary font-medium'
            }`}
          >
            <span>{item.label}</span>
            {item.badge && (
              <span className="px-1 text-[9px] font-mono text-accent rounded-[2px] bg-accent/10 border border-accent/25 leading-4">
                {item.badge}
              </span>
            )}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute left-3.5 right-3.5 bottom-0 h-px bg-accent"
              />
            )}
          </Link>
        )
      })}
    </div>
  )
}
