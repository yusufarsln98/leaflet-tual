'use client'

import { CornerDownLeft } from 'lucide-react'
import { QUICK_LINKS } from './constants'

interface SearchQuickLinksProps {
  selectedIndex: number
  onHoverIndex: (idx: number) => void
  onSelect: (id: string) => void
}

export function SearchQuickLinks({
  selectedIndex,
  onHoverIndex,
  onSelect,
}: SearchQuickLinksProps) {
  return (
    <div className="py-2">
      <div className="px-3 py-1.5 eyebrow text-text-muted">Suggested Navigation</div>
      {QUICK_LINKS.map((link, idx) => {
        const Icon = link.icon
        const isActive = idx === selectedIndex
        return (
          <button
            key={link.id}
            data-active={isActive}
            onClick={() => onSelect(link.id)}
            onMouseEnter={() => onHoverIndex(idx)}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
              isActive
                ? 'bg-accent/15 border border-accent/35 text-text-primary shadow-xs'
                : 'border border-transparent text-text-secondary hover:bg-bg-sidebar hover:text-text-primary'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-1.5 rounded-lg shrink-0 ${
                  isActive
                    ? 'bg-accent text-accent-fg'
                    : 'bg-bg-pane-inner border border-border-primary text-text-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary">{link.title}</div>
                <div className="text-[10px] text-text-muted font-mono">{link.category}</div>
              </div>
            </div>
            {isActive && (
              <kbd className="kbd text-[9px] flex items-center gap-1 shrink-0">
                <span>Jump</span>
                <CornerDownLeft className="h-2.5 w-2.5" />
              </kbd>
            )}
          </button>
        )
      })}
    </div>
  )
}

