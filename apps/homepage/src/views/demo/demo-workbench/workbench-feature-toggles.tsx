'use client'

interface WorkbenchFeatureTogglesProps {
  readOnly: boolean
  onToggleReadOnly: (val: boolean) => void
  applyTheme: boolean
  onToggleApplyTheme: (val: boolean) => void
  showSidebar: boolean
  onToggleSidebar: (val: boolean) => void
}

export function WorkbenchFeatureToggles({
  readOnly,
  onToggleReadOnly,
  applyTheme,
  onToggleApplyTheme,
  showSidebar,
  onToggleSidebar,
}: WorkbenchFeatureTogglesProps) {
  return (
    <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-bg-pane border border-border-primary text-xs font-mono shadow-2xs">
      <label className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary">
        <input
          type="checkbox"
          checked={readOnly}
          onChange={(e) => onToggleReadOnly(e.target.checked)}
          className="rounded border-border-primary text-accent focus:ring-accent"
        />
        <span>Read-Only</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary">
        <input
          type="checkbox"
          checked={applyTheme}
          onChange={(e) => onToggleApplyTheme(e.target.checked)}
          className="rounded border-border-primary text-accent focus:ring-accent"
        />
        <span>Apply App Theme</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary">
        <input
          type="checkbox"
          checked={showSidebar}
          onChange={(e) => onToggleSidebar(e.target.checked)}
          className="rounded border-border-primary text-accent focus:ring-accent"
        />
        <span>Show Sidebar</span>
      </label>
    </div>
  )
}
