import { resolveColor } from '../../../shared/theme/index.js'
import type { LaserPoint, LaserState } from './types.js'

export const LASER_LIFETIME_MS = 1000

export function renderLaserOnCanvas(
  ctx: CanvasRenderingContext2D,
  laserState: LaserState,
  lifetimeMs = LASER_LIFETIME_MS,
): void {
  const now = Date.now()
  const rawTrail = laserState.trail.filter((p) => now - p.time < lifetimeMs)
  const baseColor = resolveColor(laserState.color ?? 'red')

  // Group trail points into strokes by strokeId
  const strokes: LaserPoint[][] = []
  let currentStroke: LaserPoint[] = []
  let currentStrokeId: number | undefined = undefined

  for (const pt of rawTrail) {
    if (pt.strokeId !== currentStrokeId) {
      if (currentStroke.length > 0) {
        strokes.push(currentStroke)
      }
      currentStroke = [pt]
      currentStrokeId = pt.strokeId
    } else {
      currentStroke.push(pt)
    }
  }
  if (currentStroke.length > 0) {
    strokes.push(currentStroke)
  }

  // Connect head of current active stroke to current pointer position ONLY when actively drawing
  if (laserState.active && laserState.isDrawing && laserState.pointerPos && strokes.length > 0) {
    const lastStroke = strokes[strokes.length - 1]
    const last = lastStroke[lastStroke.length - 1]
    const cur = laserState.pointerPos
    if (Math.hypot(last.x - cur.x, last.y - cur.y) > 1) {
      lastStroke.push({ x: cur.x, y: cur.y, time: now, strokeId: last.strokeId })
    }
  }

  // 1. Draw smooth ribbon trail (single solid shape per stroke - no overlapping node dots)
  for (const stroke of strokes) {
    if (stroke.length === 0) continue

    // Filter points too close together to maintain clean geometry
    const pts: LaserPoint[] = [stroke[0]]
    for (let i = 1; i < stroke.length; i += 1) {
      const prev = pts[pts.length - 1]
      const cur = stroke[i]
      if (i === stroke.length - 1 || Math.hypot(cur.x - prev.x, cur.y - prev.y) >= 2) {
        pts.push(cur)
      }
    }

    if (pts.length === 1) {
      const p = pts[0]
      const age = (now - p.time) / lifetimeMs
      const progress = Math.max(0, Math.min(1, 1 - age))
      if (progress > 0) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(p.x, p.y, progress * 4, 0, Math.PI * 2)
        ctx.fillStyle = baseColor
        ctx.shadowColor = baseColor
        ctx.shadowBlur = 8
        ctx.globalAlpha = progress * 0.9
        ctx.fill()
        ctx.restore()
      }
      continue
    }

    const n = pts.length
    const left: Array<{ x: number; y: number }> = []
    const right: Array<{ x: number; y: number }> = []

    for (let i = 0; i < n; i += 1) {
      let dx: number
      let dy: number
      if (i === 0) {
        dx = pts[1].x - pts[0].x
        dy = pts[1].y - pts[0].y
      } else if (i === n - 1) {
        dx = pts[n - 1].x - pts[n - 2].x
        dy = pts[n - 1].y - pts[n - 2].y
      } else {
        dx = pts[i + 1].x - pts[i - 1].x
        dy = pts[i + 1].y - pts[i - 1].y
      }

      const len = Math.hypot(dx, dy) || 1
      const nx = -dy / len
      const ny = dx / len

      const age = (now - pts[i].time) / lifetimeMs
      const progress = Math.max(0, Math.min(1, 1 - age))
      const halfWidth = Math.max(0.75, progress * 3.5)

      left.push({ x: pts[i].x + nx * halfWidth, y: pts[i].y + ny * halfWidth })
      right.push({ x: pts[i].x - nx * halfWidth, y: pts[i].y - ny * halfWidth })
    }

    const headAge = (now - pts[n - 1].time) / lifetimeMs
    const headProgress = Math.max(0, Math.min(1, 1 - headAge))
    if (headProgress <= 0) continue

    ctx.save()
    ctx.beginPath()

    // Trace left boundary forwards
    ctx.moveTo(left[0].x, left[0].y)
    for (let i = 1; i < n - 1; i += 1) {
      const mx = (left[i].x + left[i + 1].x) / 2
      const my = (left[i].y + left[i + 1].y) / 2
      ctx.quadraticCurveTo(left[i].x, left[i].y, mx, my)
    }
    ctx.lineTo(left[n - 1].x, left[n - 1].y)

    // Rounded tip at head
    const headPt = pts[n - 1]
    const headW = Math.max(0.75, headProgress * 3.5)
    const headAngle = Math.atan2(left[n - 1].y - headPt.y, left[n - 1].x - headPt.x)
    ctx.arc(headPt.x, headPt.y, headW, headAngle, headAngle + Math.PI)

    // Trace right boundary backwards
    ctx.lineTo(right[n - 1].x, right[n - 1].y)
    for (let i = n - 2; i > 0; i -= 1) {
      const mx = (right[i].x + right[i - 1].x) / 2
      const my = (right[i].y + right[i - 1].y) / 2
      ctx.quadraticCurveTo(right[i].x, right[i].y, mx, my)
    }
    ctx.lineTo(right[0].x, right[0].y)

    // Rounded tip at tail
    const tailPt = pts[0]
    const tailAge = (now - tailPt.time) / lifetimeMs
    const tailProgress = Math.max(0, Math.min(1, 1 - tailAge))
    const tailW = Math.max(0.75, tailProgress * 3.5)
    const tailAngle = Math.atan2(right[0].y - tailPt.y, right[0].x - tailPt.x)
    ctx.arc(tailPt.x, tailPt.y, tailW, tailAngle, tailAngle + Math.PI)

    ctx.closePath()

    // Single solid color fill - perfectly smooth ribbon with zero inner beads or points
    ctx.fillStyle = baseColor
    ctx.shadowColor = baseColor
    ctx.shadowBlur = 10
    ctx.globalAlpha = Math.max(0.15, headProgress * 0.95)
    ctx.fill()

    ctx.restore()
  }

  // 2. Draw glowing laser pointer dot at current mouse / pointer position (single solid red)
  if (laserState.active && laserState.pointerPos) {
    const { x, y } = laserState.pointerPos
    ctx.save()

    // Outer aura
    ctx.beginPath()
    ctx.arc(x, y, 9, 0, Math.PI * 2)
    ctx.fillStyle = baseColor
    ctx.globalAlpha = 0.25
    ctx.shadowColor = baseColor
    ctx.shadowBlur = 14
    ctx.fill()

    // Glowing dot
    ctx.beginPath()
    ctx.arc(x, y, 4.5, 0, Math.PI * 2)
    ctx.fillStyle = baseColor
    ctx.globalAlpha = 0.95
    ctx.shadowColor = baseColor
    ctx.shadowBlur = 8
    ctx.fill()

    ctx.restore()
  }
}
