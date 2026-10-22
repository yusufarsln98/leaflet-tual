import { useEffect, useRef, useState } from 'react'
import type { LeafletCanvasController } from '../../types/index.js'
import { isArrowTool } from './utils.js'

export function useToolbarContext(controller: LeafletCanvasController, readOnly: boolean) {
  const { activeTool, selectedItem } = controller
  const [arrowDropdownOpen, setArrowDropdownOpen] = useState(false)
  const [shapesModalOpen, setShapesModalOpen] = useState(false)
  const arrowGroupRef = useRef<HTMLDivElement | null>(null)
  const shapesGroupRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!arrowDropdownOpen && !shapesModalOpen) return
    const handleOutsideClick = (e: PointerEvent) => {
      if (arrowDropdownOpen && arrowGroupRef.current && !arrowGroupRef.current.contains(e.target as Node)) {
        setArrowDropdownOpen(false)
      }
      if (shapesModalOpen && shapesGroupRef.current && !shapesGroupRef.current.contains(e.target as Node)) {
        setShapesModalOpen(false)
      }
    }
    window.addEventListener('pointerdown', handleOutsideClick)
    return () => window.removeEventListener('pointerdown', handleOutsideClick)
  }, [arrowDropdownOpen, shapesModalOpen])

  const isArrowToolActive = isArrowTool(activeTool)
  const isShapeToolActive = activeTool === 'shape'
  const isArrowContext = isArrowToolActive || selectedItem?.type === 'arrow'
  const isFreeDrawContext = activeTool === 'freedraw' || selectedItem?.type === 'freedraw'
  const isShapeContext = isShapeToolActive || selectedItem?.type === 'shape'
  const isRulerContext = activeTool === 'ruler' || selectedItem?.type === 'ruler'
  const isNoteContext = activeTool === 'note' || selectedItem?.type === 'note'
  const isTextContext = activeTool === 'text' || selectedItem?.type === 'text'

  const showSettingsBar =
    !readOnly &&
    !arrowDropdownOpen &&
    !shapesModalOpen &&
    (isArrowContext || isFreeDrawContext || isShapeContext || isRulerContext || isTextContext || isNoteContext)

  return {
    isArrowToolActive,
    isShapeToolActive,
    isArrowContext,
    isFreeDrawContext,
    isShapeContext,
    isRulerContext,
    isNoteContext,
    isTextContext,
    showSettingsBar,
    arrowDropdownOpen,
    setArrowDropdownOpen,
    shapesModalOpen,
    setShapesModalOpen,
    arrowGroupRef,
    shapesGroupRef,
  }
}
