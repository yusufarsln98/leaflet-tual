import { useEffect } from 'react'
import type { RefObject } from 'react'
import { isTualUiTarget } from '../../../../shared/dom/ui-guard.js'

export {
  commitPendingClickSelection,
  applyGestureMouseMove,
  commitGestureMouseUp,
} from '../../../../core/index.js'

export function useCanvasNativeListeners(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  handleDoubleClick: (e: MouseEvent) => void,
  lastUiMouseDownRef: React.MutableRefObject<number>,
): void {
  useEffect(() => {
    const canvas = canvasRef.current
    const container = canvas?.parentElement
    if (!canvas) return
    const handleContainerDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (isTualUiTarget(e.target)) {
        lastUiMouseDownRef.current = Date.now()
      }
    }

    canvas.addEventListener('dblclick', handleDoubleClick)
    container?.addEventListener('mousedown', handleContainerDown, true)
    return () => {
      canvas.removeEventListener('dblclick', handleDoubleClick)
      container?.removeEventListener('mousedown', handleContainerDown, true)
    }
  }, [canvasRef, handleDoubleClick, lastUiMouseDownRef])
}
