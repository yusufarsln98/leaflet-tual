import { HANDLE_COLOR, LABEL_BG, LABEL_BORDER, LABEL_FONT, LABEL_TEXT } from './item-styles'

/** Canvas label pill, as drawn by `drawLabelPill` in leaflet-tual. */
export function SvgLabel({ x, y, children }: { x: number; y: number; children: string }) {
  const width = Math.max(36, children.length * 6.2 + 8)
  const height = 16

  return (
    <g>
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        rx={3}
        fill={LABEL_BG}
        stroke={LABEL_BORDER}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <text
        x={x}
        y={y}
        fill={LABEL_TEXT}
        fontSize={12}
        fontWeight={400}
        fontFamily={LABEL_FONT}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {children}
      </text>
    </g>
  )
}

/** Selection handle, as drawn by `drawHandle` in leaflet-tual. */
export function Handle({ x, y }: { x: number; y: number }) {
  const size = 8

  return (
    <rect
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      fill={LABEL_BG}
      stroke={HANDLE_COLOR}
      strokeWidth={2}
      vectorEffect="non-scaling-stroke"
    />
  )
}

/** Filled triangle arrowhead, matching `drawArrowHead`. */
export function TriangleHead({
  x,
  y,
  angle,
  size,
  color,
}: {
  x: number
  y: number
  angle: number
  size: number
  color: string
}) {
  return (
    <path
      d={`M 0 0 L ${-size * 1.15} ${-size * 0.4} L ${-size * 0.72} 0 L ${-size * 1.15} ${
        size * 0.4
      } Z`}
      fill={color}
      transform={`translate(${x} ${y}) rotate(${angle})`}
    />
  )
}

/** Open V arrowhead, matching `drawArrowHead`. */
export function OpenHead({
  x,
  y,
  angle,
  size,
  color,
  lineWidth,
}: {
  x: number
  y: number
  angle: number
  size: number
  color: string
  lineWidth: number
}) {
  return (
    <path
      d={`M ${-size * 0.85} ${-size * 0.45} L 0 0 L ${-size * 0.85} ${size * 0.45}`}
      fill="none"
      stroke={color}
      strokeWidth={lineWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      transform={`translate(${x} ${y}) rotate(${angle})`}
    />
  )
}
