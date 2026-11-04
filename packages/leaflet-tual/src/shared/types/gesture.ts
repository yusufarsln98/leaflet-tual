import type { GeoPoint, ScreenPoint } from './geo.js'
import type { Item, PenPoint } from '../../entities/item/types.js'
import type { ToolVariant } from '../../core/types.js'
import type { PenHandleType } from '../../features/drawing-tools/pen/pen-handles.js'
import type { ShapeHandleType } from '../../features/drawing-tools/shape/shape-handles.js'

export type CanvasGesture =
  | {
      type: 'draw'
      tool: string
      variant: ToolVariant | null
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
  | {
      type: 'resize-area'
      areaId: string
      vertexIndex: number
      startGeo: GeoPoint
    }
  | {
      type: 'area-draft'
      points: GeoPoint[]
      currentPt: ScreenPoint
      currentGeo: GeoPoint
    }
  | {
      type: 'marquee'
      startPt: ScreenPoint
      startGeo: GeoPoint
      currentPt: ScreenPoint
      currentGeo: GeoPoint
    }

export interface PendingClickSelection {
  itemId: string | null
  shiftKey: boolean
  startPt: ScreenPoint
  canvasStartPt?: ScreenPoint
  startGeo?: GeoPoint
}
