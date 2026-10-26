import { describe, it, expect } from 'vitest'
import {
  VERSION,
  createId,
  emptyDoc,
  parseDoc,
  DocError,
  LeafletTual,
  Toolbar,
  useLeafletTual,
  useLeafletSync,
  createLeafletTual,
  geoToScreen,
  screenToGeo,
  toWorld,
  fromWorld,
  lockAspect,
  snapAngle,
  defaultVia,
  hitTest,
  bounds,
  distance,
  pathDistance,
  formatDistance,
  resolveColor,
  renderArrowOnCanvas,
  renderFreedrawOnCanvas,
  renderShapeOnCanvas,
  renderPenOnCanvas,
  renderRulerOnCanvas,
  renderNoteOnCanvas,
  renderTextOnCanvas,
} from '../../react.js'

import pkg from '../../../package.json'

describe('leaflet-tual v2 package contract exports', () => {
  it('exports VERSION constant matching package.json', () => {
    expect(VERSION).toBe(pkg.version)
    expect(VERSION).toBe('2.0.0')
  })

  it('creates unique ids with prefix', () => {
    const id1 = createId('arrow')
    const id2 = createId('arrow')
    expect(id1.startsWith('arrow-')).toBe(true)
    expect(id1).not.toBe(id2)
  })

  it('exports all core public components and hooks from leaflet-tual/react', () => {
    expect(LeafletTual).toBeDefined()
    expect(Toolbar).toBeDefined()
    expect(useLeafletTual).toBeDefined()
    expect(useLeafletSync).toBeDefined()
    expect(createLeafletTual).toBeDefined()
    expect(emptyDoc).toBeDefined()
    expect(parseDoc).toBeDefined()
    expect(DocError).toBeDefined()
  })

  it('exports all core geometry and rendering utilities', () => {
    expect(geoToScreen).toBeDefined()
    expect(screenToGeo).toBeDefined()
    expect(toWorld).toBeDefined()
    expect(fromWorld).toBeDefined()
    expect(lockAspect).toBeDefined()
    expect(snapAngle).toBeDefined()
    expect(defaultVia).toBeDefined()
    expect(hitTest).toBeDefined()
    expect(bounds).toBeDefined()
    expect(distance).toBeDefined()
    expect(pathDistance).toBeDefined()
    expect(formatDistance).toBeDefined()
    expect(resolveColor).toBeDefined()
    expect(renderArrowOnCanvas).toBeDefined()
    expect(renderFreedrawOnCanvas).toBeDefined()
    expect(renderShapeOnCanvas).toBeDefined()
    expect(renderPenOnCanvas).toBeDefined()
    expect(renderRulerOnCanvas).toBeDefined()
    expect(renderNoteOnCanvas).toBeDefined()
    expect(renderTextOnCanvas).toBeDefined()
  })
})
