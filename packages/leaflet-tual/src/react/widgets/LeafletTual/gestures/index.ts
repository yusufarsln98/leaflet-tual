export * from './types.js'
export * from './use-canvas-gestures.js'
export * from './drafts/index.js'
export * from './handlers/index.js'

// Backward-compatible re-exports for canvas and gesture operations
export {
  drawCanvasScene,
  findResizeGestureUnderPointer,
  updateCanvasHoverCursor,
  getShapeScreenHandles,
  hitTestArrowHandle,
  hitTestRulerHandle,
  hitTestShapeHandle,
  resizeShape,
  type ShapeHandle,
  type ShapeHandleType,
} from '../../../../core/index.js'
