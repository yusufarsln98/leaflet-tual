import type L from 'leaflet'
import type { Item } from '../../entities/item/types.js'
import type { TranslationTokens } from '../../shared/i18n/types.js'
import { renderArrowOnCanvas } from './arrow/render-arrow.js'
import { renderShapeOnCanvas } from './shape/render-shape.js'
import { renderFreedrawOnCanvas } from './freedraw/render-freedraw.js'
import { renderPenOnCanvas } from './pen/render-pen.js'
import { renderRulerOnCanvas } from './ruler/render-ruler.js'
import { renderAreaOnCanvas } from './area/render-area.js'

export interface RenderItemOptions {
  isSelected?: boolean
  isHovered?: boolean
  isEditing?: boolean
  translations?: Partial<TranslationTokens>
  fontFamily?: string
}

export function renderItemOnCanvas(
  ctx: CanvasRenderingContext2D,
  map: L.Map,
  item: Item,
  options?: RenderItemOptions,
): void {
  switch (item.type) {
    case 'arrow':
      renderArrowOnCanvas(ctx, map, item, options)
      break
    case 'shape':
      renderShapeOnCanvas(ctx, map, item, options)
      break
    case 'freedraw':
      renderFreedrawOnCanvas(ctx, map, item, options)
      break
    case 'pen':
      renderPenOnCanvas(ctx, map, item, options)
      break
    case 'ruler':
      renderRulerOnCanvas(ctx, map, item, options)
      break
    case 'area':
      renderAreaOnCanvas(ctx, map, item, options)
      break
  }
}
