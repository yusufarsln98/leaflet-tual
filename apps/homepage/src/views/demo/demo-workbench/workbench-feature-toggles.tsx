'use client'

interface WorkbenchFeatureTogglesProps {
  readOnly: boolean
  onToggleReadOnly: (val: boolean) => void
  collapsible: boolean
  onCollapsibleChange: (val: boolean) => void
  showToolLabels: boolean
  onShowToolLabelsChange: (val: boolean) => void
}

export function WorkbenchFeatureToggles({
  readOnly,
  onToggleReadOnly,
  collapsible,
  onCollapsibleChange,
  showToolLabels,
  onShowToolLabelsChange,
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
      <span className="text-text-muted">•</span>
      <label className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary">
        <input
          type="checkbox"
          checked={collapsible}
          onChange={(e) => onCollapsibleChange(e.target.checked)}
          className="rounded border-border-primary text-accent focus:ring-accent"
        />
        <span>Collapsible</span>
      </label>
      <span className="text-text-muted">•</span>
      <label className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary">
        <input
          type="checkbox"
          checked={showToolLabels}
          onChange={(e) => onShowToolLabelsChange(e.target.checked)}
          className="rounded border-border-primary text-accent focus:ring-accent"
        />
        <span>Labels</span>
      </label>
    </div>
  )
}

