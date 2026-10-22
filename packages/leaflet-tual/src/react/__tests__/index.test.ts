import { describe, it, expect } from 'vitest'
import {
  VERSION,
  createId,
  createLeafletCanvas,
  createLeafletCanvasController,
  LeafletCanvas,
  CanvasToolbar,
  InlineShapeLabelEditor,
  NoteOverlay,
  TextOverlay,
  useLeafletCanvas,
  useLeafletSync,
  computeDefaultControlGeoPoint,
  constrainToAspectRatio,
  constrainAngleTo45Degrees,
  distanceToSegment,
  distanceToQuadraticBezier,
  calculateGeodesicDistance,
  formatRealWorldDistance,
  calculateLineDistance,
  renderShapeOnCanvas,
  renderArrowOnCanvas,
  renderRulerOnCanvas,
  projectRuler,
  hitTestRuler,
  hitTestRulerHandle,
} from '../../react.js'

import pkg from '../../../package.json'

describe('leaflet-tual package exports', () => {
  it('exports VERSION constant', () => {
    expect(VERSION).toBe(pkg.version)
  })

  it('creates unique ids with prefix', () => {
    const id1 = createId('arrow')
    const id2 = createId('arrow')
    expect(id1.startsWith('arrow-')).toBe(true)
    expect(id1).not.toBe(id2)
  })

  it('exports all core public components and hooks from leaflet-tual/react', () => {
    expect(LeafletCanvas).toBeDefined()
    expect(CanvasToolbar).toBeDefined()
    expect(InlineShapeLabelEditor).toBeDefined()
    expect(NoteOverlay).toBeDefined()
    expect(TextOverlay).toBeDefined()
    expect(useLeafletCanvas).toBeDefined()
    expect(useLeafletSync).toBeDefined()
    expect(createLeafletCanvas).toBeDefined()
    expect(createLeafletCanvasController).toBeDefined()
  })

  it('exports all core geometry and rendering utilities', () => {
    expect(computeDefaultControlGeoPoint).toBeDefined()
    expect(constrainToAspectRatio).toBeDefined()
    expect(constrainAngleTo45Degrees).toBeDefined()
    expect(distanceToSegment).toBeDefined()
    expect(distanceToQuadraticBezier).toBeDefined()
    expect(renderShapeOnCanvas).toBeDefined()
    expect(renderArrowOnCanvas).toBeDefined()
    expect(renderRulerOnCanvas).toBeDefined()
    expect(projectRuler).toBeDefined()
    expect(hitTestRuler).toBeDefined()
    expect(hitTestRulerHandle).toBeDefined()
    expect(calculateGeodesicDistance).toBeDefined()
    expect(formatRealWorldDistance).toBeDefined()
    expect(calculateLineDistance).toBeDefined()
  })
})
