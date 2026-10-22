import { useCallback, useRef } from 'react'
import type L from 'leaflet'
import type {
  ArrowItem,
  CanvasItem,
  FreeDrawItem,
  LeafletCanvasProps,
  NoteItem,
  RulerItem,
  ShapeItem,
  TextItem,
} from '../../types/index.js'
import { useLeafletCanvas, useLeafletSync } from '../../features/index.js'
import { useCanvasPainter } from './use-canvas-painter.js'
import { useCanvasKeyboardShortcuts } from './use-canvas-keyboard-shortcuts.js'
import { useSelectInteractions } from './use-select-interactions.js'
import { useDrawingInteractions } from './use-drawing-interactions.js'
import { useBlockMapDblClick } from './use-block-map-dblclick.js'
import {
  useOutsideCanvasPointerDown,
  useStableItemArray,
} from './use-outside-canvas-deselect.js'

export function useLeafletCanvasOverlay(
  props: LeafletCanvasProps & { map: L.Map | null },
) {
  const {
    map,
    controller: externalController,
    readOnly: propReadOnly,
    showToolbar: propShowToolbar,
    annotationTheme,
    arrowTheme,
    labels,
    ...hookOptions
  } = props

  const isReadOnly = Boolean(propReadOnly ?? externalController?.readOnly ?? false)
  const internalController = useLeafletCanvas({ ...hookOptions, readOnly: isReadOnly })
  const controller = externalController ?? internalController
  const showToolbar = propShowToolbar ?? !isReadOnly

  const propCallbacksRef = useRef(hookOptions)
  propCallbacksRef.current = hookOptions

  const notifyChangeComplete = useCallback(
    (targetItem?: CanvasItem | null) => {
      controller.notifyChangeComplete(targetItem)
      if (externalController) {
        propCallbacksRef.current.onItemsChangeComplete?.(controller.items, targetItem)
        propCallbacksRef.current.onChangeComplete?.(controller.items, targetItem)
        propCallbacksRef.current.onEditEnd?.(controller.items, targetItem)
        propCallbacksRef.current.onEditComplete?.(controller.items, targetItem)
        if (targetItem) propCallbacksRef.current.onItemChangeComplete?.(targetItem)
      }
    },
    [controller, externalController],
  )

  const {
    items,
    activeTool,
    setActiveTool,
    activeShape,
    shapeFilled,
    selectedId,
    setSelectedId,
    activeColor,
    strokeWidth,
    dashed,
    noteColor,
    fontSize,
    fontWeight,
    addItem,
    updateItem,
    removeItem,
    deleteSelected,
  } = controller

  useOutsideCanvasPointerDown(map, isReadOnly, activeTool, setActiveTool, selectedId, setSelectedId, notifyChangeComplete)

  const viewport = useLeafletSync(map)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const arrowItems = useStableItemArray<ArrowItem>(items, 'arrow')
  const freeDrawItems = useStableItemArray<FreeDrawItem>(items, 'freedraw')
  const shapeItems = useStableItemArray<ShapeItem>(items, 'shape')
  const rulerItems = useStableItemArray<RulerItem>(items, 'ruler')
  const noteItems = useStableItemArray<NoteItem>(items, 'note')
  const textItems = useStableItemArray<TextItem>(items, 'text')

  const {
    draftArrow,
    setDraftArrow,
    draftShape,
    setDraftShape,
    draftRuler,
    setDraftRuler,
    draftFreeDrawRef,
    clearDraftFreeDraw,
    handleInteractionPointerDown,
    handleInteractionPointerMove,
  } = useDrawingInteractions({
    map,
    activeTool,
    setActiveTool,
    activeShape,
    shapeFilled,
    activeColor,
    strokeWidth,
    dashed,
    noteColor,
    fontSize,
    fontWeight,
    labels,
    addItem,
    paintCanvas: () => paintCanvas(),
  })

  const paintCanvas = useCanvasPainter({
    map,
    viewport,
    canvasRef,
    arrowItems,
    shapeItems,
    freeDrawItems,
    rulerItems,
    selectedId,
    draftShape,
    draftArrow,
    draftRuler,
    draftFreeDrawRef,
    activeColor,
    strokeWidth,
    dashed,
    shapeFilled,
    annotationTheme: annotationTheme ?? arrowTheme,
    isReadOnly,
  })

  useCanvasKeyboardShortcuts({
    isReadOnly,
    selectedId,
    selectedItem: controller.selectedItem,
    items: controller.items,
    isEditingLabel: controller.isEditingLabel,
    setEditingLabel: controller.setEditingLabel,
    deleteSelected,
    setSelectedId,
    setActiveTool,
    setDraftArrow,
    setDraftShape,
    setDraftRuler,
    clearDraftFreeDraw,
    notifyChangeComplete,
  })

  useBlockMapDblClick(map)

  const hoverCursor = useSelectInteractions({
    map,
    activeTool,
    isReadOnly,
    arrowItems,
    shapeItems,
    freeDrawItems,
    rulerItems,
    selectedId,
    setSelectedId,
    setEditingLabel: controller.setEditingLabel,
    updateItem,
    notifyChangeComplete,
  })

  const isDrawingTool = !isReadOnly && activeTool !== 'select'

  return {
    controller,
    isReadOnly,
    showToolbar,
    viewport,
    canvasRef,
    isDrawingTool,
    hoverCursor,
    arrowItems,
    shapeItems,
    freeDrawItems,
    noteItems,
    textItems,
    selectedId,
    setSelectedId,
    updateItem,
    removeItem,
    notifyChangeComplete,
    handleInteractionPointerDown,
    handleInteractionPointerMove,
  }
}

