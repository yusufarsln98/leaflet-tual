import { useEffect } from 'react'
import type { Controller } from '../../../core/index.js'

export function useKeyboardShortcuts(
  controller: Controller,
  onEscape: () => void,
  onFinishPen?: () => void,
) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return
      }

      const key = e.key.toUpperCase()
      const isMeta = e.metaKey || e.ctrlKey

      if (isMeta && key === 'Z') {
        e.preventDefault()
        if (e.shiftKey) controller.redo()
        else controller.undo()
        return
      }
      if (isMeta && key === 'Y') {
        e.preventDefault()
        controller.redo()
        return
      }

      if (isMeta && key === 'D') {
        e.preventDefault()
        for (const item of controller.selected) {
          const dLat = 0.001
          const dLng = 0.001
          if (item.type === 'arrow' || item.type === 'shape' || item.type === 'ruler') {
            controller.add({
              ...item,
              id: undefined,
              from: { lat: item.from.lat + dLat, lng: item.from.lng + dLng },
              to: { lat: item.to.lat + dLat, lng: item.to.lng + dLng },
            })
          } else if (item.type === 'freedraw') {
            controller.add({
              ...item,
              id: undefined,
              points: item.points.map((point) => ({
                lat: point.lat + dLat,
                lng: point.lng + dLng,
              })),
            })
          } else if (item.type === 'pen') {
            const offset = (point: { lat: number; lng: number }) => ({
              lat: point.lat + dLat,
              lng: point.lng + dLng,
            })
            controller.add({
              ...item,
              id: undefined,
              points: item.points.map((point) => ({
                at: offset(point.at),
                ...(point.in ? { in: offset(point.in) } : {}),
                ...(point.out ? { out: offset(point.out) } : {}),
              })),
            })
          } else if (item.type === 'note' && item.from && item.to) {
            controller.add({
              ...item,
              id: undefined,
              from: { lat: item.from.lat + dLat, lng: item.from.lng + dLng },
              to: { lat: item.to.lat + dLat, lng: item.to.lng + dLng },
            })
          } else if (item.type === 'note' || item.type === 'text') {
            const at = item.at ?? { lat: 0, lng: 0 }
            controller.add({
              ...item,
              id: undefined,
              at: { lat: at.lat + dLat, lng: at.lng + dLng },
            })
          }
        }
        return
      }

      if (e.key === 'Enter') {
        if (controller.tool === 'pen' && onFinishPen) {
          e.preventDefault()
          onFinishPen()
          return
        }
        const selected = controller.selected
        if (selected.length === 1 && (selected[0].type === 'shape' || selected[0].type === 'text')) {
          e.preventDefault()
          controller.edit(selected[0].id)
          return
        }
      }

      if (e.key === 'Escape') {
        onEscape()
        controller.select(null)
        controller.setTool('select')
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (controller.selection.length > 0) {
          e.preventDefault()
          controller.remove()
        }
        return
      }

      switch (key) {
        case 'V': controller.setTool('select'); break
        case 'T': controller.setTool('text'); break
        case 'N': controller.setTool('note'); break
        case 'F': controller.setTool('freedraw'); break
        case 'P': controller.setTool('pen'); break
        case 'L': controller.setTool('arrow'); break
        case 'S': controller.setTool('shape'); break
        case 'R': controller.setTool('ruler'); break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => { window.removeEventListener('keydown', onKeyDown) }
  }, [controller, onEscape, onFinishPen])
}

