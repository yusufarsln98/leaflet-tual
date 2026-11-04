'use client'

import { Trash2 } from 'lucide-react'
import type { Controller } from 'leaflet-tual/react'

interface WorkbenchAnnotationsListProps {
  controller: Controller
  readOnly: boolean
}

export function WorkbenchAnnotationsList({
  controller,
  readOnly,
}: WorkbenchAnnotationsListProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="font-semibold text-text-secondary">
          Annotations ({controller.items.length})
        </span>
        {controller.items.length > 0 && !readOnly && (
          <button
            type="button"
            onClick={() => controller.clear()}
            className="text-[11px] text-danger hover:underline font-semibold cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5 pr-1">
        {controller.items.length === 0 ? (
          <div className="text-[11px] font-mono text-text-muted italic py-3 text-center">
            No annotations on map.
          </div>
        ) : (
          controller.items.map((item) => {
            const isSelected = controller.selection.includes(item.id)
            let label = item.type.toUpperCase()
            let detail = ''
            if (item.type === 'arrow') {
              label = `Arrow (${item.kind})`
              detail = item.label || 'Vector arrow'
            } else if (item.type === 'shape') {
              label = `Shape (${item.kind})`
              detail = item.label || 'Geometric shape'
            } else if (item.type === 'note') {
              label = 'Sticky Note'
              detail = item.title || item.text.slice(0, 18) || 'Sticky note'
            } else if (item.type === 'text') {
              label = 'Text'
              detail = item.text || 'Text annotation'
            } else if (item.type === 'freedraw') {
              label = 'Free draw'
              detail = `${item.points.length} pts`
            } else if (item.type === 'pen') {
              label = 'Pen'
              detail = `${item.points.length} anchors${item.closed ? ' · closed' : ''}`
            } else if (item.type === 'ruler') {
              label = 'Ruler'
              detail = item.label || 'Distance meter'
            }

            return (
              <div
                key={item.id}
                tabIndex={0}
                onClick={() => controller.select(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    controller.select(item.id)
                    controller.edit(item.id)
                  }
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors border outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                  isSelected
                    ? 'bg-accent/15 border-accent text-accent font-semibold'
                    : 'bg-bg-pane border-border-primary/60 text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="flex flex-col truncate pr-2">
                  <span className="text-[11px] font-bold">{label}</span>
                  <span className="text-[10px] text-text-muted truncate">{detail}</span>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      controller.remove(item.id)
                    }}
                    className="p-1 text-text-muted hover:text-danger cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
