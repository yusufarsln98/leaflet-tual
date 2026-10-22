'use client'

import Link from 'next/link'
import { BrandIcon } from '../brand-icon'
import { NAV_ITEMS } from './constants'

interface MobileNavProps {
  pathname: string
}

export function MobileNav({ pathname }: MobileNavProps) {
  return (
    <div className="md:hidden fixed inset-x-3 top-16 z-50 bg-bg-pane border border-border-secondary rounded-[3px] shadow-float animate-in fade-in zoom-in-98 duration-150">
      <nav aria-label="Mobile" className="flex flex-col">
        {NAV_ITEMS.map((item, index) => {
          const isActive =
            pathname === item.to || (item.to === '/releases' && pathname === '/changelog')
          return (
            <Link
              key={item.to}
              href={item.to}
              className={`flex items-center justify-between px-4 py-3 text-sm border-b border-border-primary transition-colors ${
                isActive
                  ? 'text-text-primary font-semibold bg-bg-pane-inner'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-pane-inner/60'
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`font-mono text-[10px] ${
                    isActive ? 'text-accent' : 'text-text-muted'
                  }`}
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                {item.label}
              </span>
              {item.badge && (
                <span className="px-1 text-[10px] font-mono bg-accent/10 text-accent border border-accent/25 rounded-[2px] leading-4">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="pt-3 pb-4 px-4 grid grid-cols-2 gap-2 text-xs font-semibold">
        <a
          href="https://www.npmjs.com/package/leaflet-tual"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 py-2 px-3 border border-border-secondary bg-bg-pane-inner text-text-primary hover:border-text-muted transition-colors rounded-[2px]"
        >
          <BrandIcon name="npm" size={18} /> NPM
        </a>
        <a
          href="https://github.com/yusufarsln98/leaflet-tual"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 py-2 px-3 border border-border-secondary bg-bg-pane-inner text-text-primary hover:border-text-muted transition-colors rounded-[2px]"
        >
          <BrandIcon name="github" size={18} /> GitHub
        </a>
      </div>
    </div>
  )
}
