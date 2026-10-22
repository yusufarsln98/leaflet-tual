'use client'

import { Check, Code, Copy } from 'lucide-react'
import type { LeafletCanvasController } from 'leaflet-tual/react'

interface WorkbenchLiveJsonProps {
  controller: LeafletCanvasController
  copied: boolean
  onCopyJson: () => void
}

export function WorkbenchLiveJson({
  controller,
  copied,
  onCopyJson,
}: WorkbenchLiveJsonProps) {
  return (
    <div className="flex flex-col gap-1.5 mt-auto pt-2 border-t border-border-primary">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="font-bold text-[11px] uppercase tracking-wider text-accent flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5" />
          <span>Live JSON State</span>
        </span>
        <button
          type="button"
          onClick={onCopyJson}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-bg-pane border border-border-primary text-[10px] font-mono text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-500 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="font-mono text-[10px] bg-bg-app border border-border-primary rounded-lg p-2.5 max-h-40 overflow-y-auto text-emerald-600 dark:text-emerald-400 leading-relaxed scrollbar-thin">
        {controller.exportJSON()}
      </pre>
    </div>
  )
}

