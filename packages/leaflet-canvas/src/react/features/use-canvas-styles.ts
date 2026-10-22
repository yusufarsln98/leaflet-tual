import { useCallback, useState } from 'react'
import type { CanvasItem, ShapeKind } from '../types/index.js'
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_NOTE_BG,
  DEFAULT_STROKE_COLOR,
  DEFAULT_STROKE_WIDTH,
  NOTE_COLOR_THEMES,
} from '../shared/constants.js'

export interface UseCanvasStylesOptions {
  defaultColor?: string
  defaultStrokeWidth?: number
  defaultNoteColor?: string
  defaultFontSize?: number
  defaultShape?: ShapeKind
  readOnly: boolean
  selectedId: string | null
  commitItems: (updater: (prev: CanvasItem[]) => CanvasItem[]) => CanvasItem[]
}

export function useCanvasStyles(options: UseCanvasStylesOptions) {
  const {
    defaultColor = DEFAULT_STROKE_COLOR,
    defaultStrokeWidth = DEFAULT_STROKE_WIDTH,
    defaultNoteColor = DEFAULT_NOTE_BG,
    defaultFontSize = DEFAULT_FONT_SIZE,
    defaultShape = 'square',
    readOnly,
    selectedId,
    commitItems,
  } = options

  const [activeShape, setActiveShapeState] = useState<ShapeKind>(defaultShape)
  const [shapeFilled, setShapeFilledState] = useState<boolean>(true)
  const [activeColor, setActiveColorState] = useState<string>(defaultColor)
  const [strokeWidth, setStrokeWidthState] = useState<number>(defaultStrokeWidth)
  const [dashed, setDashedState] = useState<boolean>(false)
  const [noteColor, setNoteColorState] = useState<string>(defaultNoteColor)
  const [fontSize, setFontSizeState] = useState<number>(defaultFontSize)
  const [fontWeight, setFontWeightState] = useState<'normal' | 'bold'>('bold')

  const patchSelected = useCallback(
    (predicate: (it: CanvasItem) => boolean, patcher: (it: any) => any) => {
      if (!selectedId) return
      commitItems((prev) =>
        prev.map((it) => (it.id === selectedId && predicate(it) ? patcher(it) : it)),
      )
    },
    [selectedId, commitItems],
  )

  const setActiveShape = useCallback(
    (shape: ShapeKind) => {
      if (readOnly) return
      setActiveShapeState(shape)
      patchSelected((it) => it.type === 'shape', (it) => ({ ...it, shape }))
    },
    [readOnly, patchSelected],
  )

  const setShapeFilled = useCallback(
    (filled: boolean) => {
      if (readOnly) return
      setShapeFilledState(filled)
      patchSelected((it) => it.type === 'shape', (it) => ({ ...it, filled }))
    },
    [readOnly, patchSelected],
  )

  const setActiveColor = useCallback(
    (color: string) => {
      if (readOnly) return
      setActiveColorState(color)
      patchSelected((it) => it.type !== 'note', (it) => ({ ...it, color }))
    },
    [readOnly, patchSelected],
  )

  const setStrokeWidth = useCallback(
    (width: number) => {
      if (readOnly) return
      setStrokeWidthState(width)
      patchSelected(
        (it) =>
          it.type === 'arrow' ||
          it.type === 'freedraw' ||
          it.type === 'shape' ||
          it.type === 'ruler',
        (it) => ({ ...it, strokeWidth: width }),
      )
    },
    [readOnly, patchSelected],
  )

  const setDashed = useCallback(
    (nextDashed: boolean) => {
      if (readOnly) return
      setDashedState(nextDashed)
      patchSelected(
        (it) =>
          it.type === 'arrow' ||
          it.type === 'freedraw' ||
          it.type === 'shape' ||
          it.type === 'ruler',
        (it) => ({ ...it, dashed: nextDashed }),
      )
    },
    [readOnly, patchSelected],
  )

  const setNoteColor = useCallback(
    (bg: string) => {
      if (readOnly) return
      setNoteColorState(bg)
      const theme = NOTE_COLOR_THEMES.find((t) => t.bg === bg)
      patchSelected(
        (it) => it.type === 'note',
        (it) => ({ ...it, backgroundColor: bg, textColor: theme?.text ?? it.textColor }),
      )
    },
    [readOnly, patchSelected],
  )

  const setFontSize = useCallback(
    (size: number) => {
      if (readOnly) return
      setFontSizeState(size)
      patchSelected((it) => it.type === 'text', (it) => ({ ...it, initialFontSize: size }))
    },
    [readOnly, patchSelected],
  )

  const setFontWeight = useCallback(
    (weight: 'normal' | 'bold') => {
      if (readOnly) return
      setFontWeightState(weight)
      patchSelected((it) => it.type === 'text', (it) => ({ ...it, fontWeight: weight }))
    },
    [readOnly, patchSelected],
  )

  return {
    activeShape,
    setActiveShape,
    shapeFilled,
    setShapeFilled,
    activeColor,
    setActiveColor,
    strokeWidth,
    setStrokeWidth,
    dashed,
    setDashed,
    noteColor,
    setNoteColor,
    fontSize,
    setFontSize,
    fontWeight,
    setFontWeight,
  }
}

