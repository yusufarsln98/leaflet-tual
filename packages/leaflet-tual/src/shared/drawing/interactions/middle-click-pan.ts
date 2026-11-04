import type L from 'leaflet'

export function setupMiddleClickPan(
  map: L.Map | undefined,
  container: HTMLElement | null,
): () => void {
  if (!container || !map) return () => {}

  let isPanning = false
  let lastPos: { x: number; y: number } | null = null

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault()
      e.stopPropagation()
      isPanning = true
      lastPos = { x: e.clientX, y: e.clientY }
      document.body.style.cursor = 'grabbing'
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning || !lastPos) return
    e.preventDefault()
    const dx = e.clientX - lastPos.x
    const dy = e.clientY - lastPos.y
    lastPos = { x: e.clientX, y: e.clientY }
    if (dx !== 0 || dy !== 0) {
      map.panBy([-dx, -dy], { animate: false })
    }
  }

  const handleMouseUp = (e: MouseEvent) => {
    if (e.button === 1 && isPanning) {
      e.preventDefault()
      isPanning = false
      lastPos = null
      document.body.style.cursor = ''
    }
  }

  const handleBlur = () => {
    if (isPanning) {
      isPanning = false
      lastPos = null
      document.body.style.cursor = ''
    }
  }

  container.addEventListener('mousedown', handleMouseDown)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('blur', handleBlur)

  return () => {
    container.removeEventListener('mousedown', handleMouseDown)
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('blur', handleBlur)
    if (isPanning) {
      document.body.style.cursor = ''
    }
  }
}

