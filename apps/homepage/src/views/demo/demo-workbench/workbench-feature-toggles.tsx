'use client'

interface WorkbenchFeatureTogglesProps {
  readOnly: boolean
  onToggleReadOnly: (val: boolean) => void
}

export function WorkbenchFeatureToggles({
  readOnly,
  onToggleReadOnly,
}: WorkbenchFeatureTogglesProps) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-bg-pane border border-border-primary text-xs font-mono shadow-2xs">
      <label className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary">
        <input
          type="checkbox"
          checked={readOnly}
          onChange={(e) => onToggleReadOnly(e.target.checked)}
          className="rounded border-border-primary text-accent focus:ring-accent"
        />
        <span>Read-Only</span>
      </label>
    </div>
  )
}
