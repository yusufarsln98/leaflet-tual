export function SearchModalFooter() {
  return (
    <div className="px-4 py-2.5 border-t border-border-primary bg-bg-sidebar/90 text-[10px] text-text-muted flex items-center justify-between select-none shrink-0">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <kbd className="kbd">↑</kbd>
          <kbd className="kbd">↓</kbd>
          <span>Navigate</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="kbd">↵</kbd>
          <span>Open</span>
        </span>
      </div>
      <span className="eyebrow lowercase">leaflet-tual docs search</span>
    </div>
  )
}

