'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useRef, useState, useEffect } from 'react'
import { VERSION } from 'leaflet-tual'
import { BrandIcon } from '../brand-icon'
import { NavbarLinks } from './navbar-links'
import { NavbarActions } from './navbar-actions'
import { MobileNav } from './mobile-nav'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const prefetched = useRef<Set<string>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Automatically close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const prefetch = useCallback(
    (href: string) => {
      if (prefetched.current.has(href)) return
      prefetched.current.add(href)
      router.prefetch(href)
    },
    [router],
  )

  const appVersion = VERSION

  return (
    <header className="sticky top-0 z-40 w-full" style={{ viewTransitionName: 'site-header' }}>
      <nav
        aria-label="Primary"
        className="relative bg-bg-app/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 select-none"
      >
        {/* Folio hairline rail with surveyor ticks */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px bg-border-secondary"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to right, transparent 0 calc(100% - 1px), var(--border-secondary) 0 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1.5 pointer-events-none opacity-70"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to right, var(--grid-line) 0 1px, transparent 1px 32px)',
          }}
        />

        {/* Plate mark brand */}
        <div className="relative flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <BrandIcon name="map" size={22} className="transition-transform group-hover:scale-105" />
            <span className="font-display text-lg tracking-tight text-text-primary leading-none">
              leaflet-tual
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 text-[10px] font-mono text-text-muted border border-border-primary bg-bg-pane rounded-[2px] leading-4">
              v{appVersion}
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavbarLinks pathname={pathname} onPrefetch={prefetch} />

        {/* Right Action Controls */}
        <NavbarActions
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
      </nav>

      {/* Mobile Popover Navigation */}
      {mobileMenuOpen && <MobileNav pathname={pathname} />}
    </header>
  )
}
