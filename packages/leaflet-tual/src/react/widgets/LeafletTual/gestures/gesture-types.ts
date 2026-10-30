import type {
  GeoPoint,
  Item,
  PenHandleType,
  PenPoint,
  ScreenPoint,
  ShapeHandleType,
} from '../../../../core/index.js'

export type CanvasGesture =
  | {
      type: 'draw'
      tool: string
      variant: string | null
      startPt: ScreenPoint
      startGeo: GeoPoint
      currentPt: ScreenPoint
      currentGeo: GeoPoint
      freedrawPoints?: GeoPoint[]
    }
  | {
      type: 'pen-draft'
      points: PenPoint[]
      activeIndex: number | null
      dragging: boolean
      currentPt: ScreenPoint
      currentGeo: GeoPoint
    }
  | {
      type: 'drag-item'
      itemIds: string[]
      startPt: ScreenPoint
      startGeo: GeoPoint
      initialItems: Item[]
    }
  | {
      type: 'edit-pen'
      penId: string
      pointIndex: number
      handle: PenHandleType
      startGeo: GeoPoint
      initialPoints: PenPoint[]
    }
  | {
      type: 'resize-shape'
      shapeId: string
      handle: ShapeHandleType
      initialAt: GeoPoint
      initialWidth: number
      initialHeight: number
      startPt: ScreenPoint
      startGeo: GeoPoint
    }
  | {
      type: 'resize-arrow'
      arrowId: string
      handle: 'start' | 'end' | 'via'
      startGeo: GeoPoint
    }
  | {
      type: 'resize-ruler'
      rulerId: string
      handle: 'start' | 'end'
      startGeo: GeoPoint
    }

export interface PendingClickSelection {
  itemId: string | null
  shiftKey: boolean
  startPt: ScreenPoint
}
