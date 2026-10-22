export function HeroScribble({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`oh-scribble ${className ?? ''}`}
      viewBox="0 0 220 14"
      preserveAspectRatio="none"
    >
      <path d="M4 9 C 40 2, 92 11, 132 6 S 200 3, 216 8" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
