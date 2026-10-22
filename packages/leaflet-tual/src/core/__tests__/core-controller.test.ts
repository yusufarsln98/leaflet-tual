import { describe, it, expect, vi } from 'vitest'
import {
  VERSION,
  createLeafletTualController,
  createLeafletTual,
  type ArrowItem,
} from '../../index.js'
import pkg from '../../../package.json'
import { createMockCanvasContext, createMockMap } from './test-utils.js'

describe('leaflet-tual core controller & vanilla instance', () => {
  it('exports VERSION from root entry', () => {
    expect(VERSION).toBe(pkg.version)
    expect(createLeafletTual).toBeDefined()
    expect(createLeafletTualController).toBeDefined()
  })

  it('manages state, history, and JSON export/import without React', () => {
    const onChange = vi.fn()
    const controller = createLeafletTualController({ onChange })

    expect(controller.items).toHaveLength(0)
    expect(controller.activeTool).toBe('select')

    const arrow: ArrowItem = {
      id: 'arrow-1',
      type: 'arrow',
      arrowStyle: 'linear',
      start: { lat: 41.0, lng: 28.9 },
      end: { lat: 41.1, lng: 29.0 },
      color: '#2563eb',
      strokeWidth: 3,
      createdAt: 1,
    }

    controller.addItem(arrow)
    controller.notifyChangeComplete(arrow)
    expect(controller.items).toHaveLength(1)
    expect(controller.canUndo).toBe(true)
    expect(onChange).toHaveBeenCalled()

    controller.undo()
    expect(controller.items).toHaveLength(0)
    expect(controller.canRedo).toBe(true)

    controller.redo()
    expect(controller.items).toHaveLength(1)

    const json = controller.exportJSON()
    controller.clearAll()
    expect(controller.items).toHaveLength(0)

    expect(controller.importJSON(json)).toBe(true)
    expect(controller.items).toHaveLength(1)
    controller.destroy()
  })

  it('mounts and destroys a vanilla Leaflet canvas overlay', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      createMockCanvasContext() as unknown as RenderingContext,
    )
    const map = createMockMap()
    const instance = createLeafletTual(map)

    expect(instance.container.getAttribute('data-tual-overlay')).toBe('true')
    expect(map.getContainer().contains(instance.container)).toBe(true)

    instance.controller.setTool('arrow-curved')
    expect(instance.controller.activeTool).toBe('arrow-curved')

    instance.destroy()
    expect(map.getContainer().contains(instance.container)).toBe(false)
  })
})
