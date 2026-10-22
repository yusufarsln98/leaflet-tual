'use client'

import Link from 'next/link'
import { Maximize2 } from 'lucide-react'

export function WorkbenchMockHeader() {
  return (
    <div className="px-4 py-2.5 bg-bg-sidebar/95 border-b border-border-primary flex items-center justify-between gap-3 text-xs font-mono select-none">
      {/* Traffic light window controls */}
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
      </div>

      {/* Right: Fullscreen Button */}
      <div className="flex items-center">
        <Link
          href="/demo"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold bg-accent hover:bg-accent-strong text-accent-fg transition-all cursor-pointer shadow-2xs"
          title="Open full-screen interactive demo"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Fullscreen Demo</span>
        </Link>
      </div>
    </div>
  )
}

