const SCALE_ENTRIES = [
  { value: '0.000px', label: 'Coordinate drift' },
  { value: '5 Styles', label: 'Vector arrows' },
  { value: '8 Shapes', label: 'Geometric shapes' },
  { value: '60 FPS Canvas', label: 'Rendering' },
] as const

export function HeroMetrics() {
  return (
    <div className="mt-14 md:mt-16 max-w-4xl mx-auto" role="group" aria-label="Key metrics">
      <div className="oh-ruler" aria-hidden="true" />
      <dl className="oh-scale">
        {SCALE_ENTRIES.map((entry) => (
          <div key={entry.label} className="oh-scale-cell">
            <dt className="oh-tick-label">{entry.label}</dt>
            <dd className="oh-scale-value">{entry.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
