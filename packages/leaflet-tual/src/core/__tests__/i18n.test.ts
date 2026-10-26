import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  DEFAULT_TRANSLATION_TOKENS,
  resolveTranslations,
  createTranslator,
  setDefaultTranslations,
  resetDefaultTranslations,
  formatDistance,
} from '../shared/index.js'
import { createLeafletTual } from '../features/index.js'
import { emptyDoc } from '../shared/doc.js'
import L from 'leaflet'

describe('i18n core translations and tokens', () => {
  beforeEach(() => {
    resetDefaultTranslations()
  })

  it('contains default English translations for all tokens', () => {
    expect(DEFAULT_TRANSLATION_TOKENS.select).toBe('Select')
    expect(DEFAULT_TRANSLATION_TOKENS.freedraw).toBe('Free draw')
    expect(DEFAULT_TRANSLATION_TOKENS.undo).toBe('Undo')
    expect(DEFAULT_TRANSLATION_TOKENS.redo).toBe('Redo')
    expect(DEFAULT_TRANSLATION_TOKENS.pageDefault).toBe('Page {n}')
    expect(DEFAULT_TRANSLATION_TOKENS.pageCopy).toBe('{name} Copy')
    expect(DEFAULT_TRANSLATION_TOKENS.theme).toBe('Theme')
    expect(DEFAULT_TRANSLATION_TOKENS.custom).toBe('Custom')
  })

  it('resolves translations with partial overrides', () => {
    const resolved = resolveTranslations({
      select: 'Seç',
      delete: 'Sil',
    })
    expect(resolved.select).toBe('Seç')
    expect(resolved.delete).toBe('Sil')
    expect(resolved.freedraw).toBe('Free draw')
    expect(resolved.undo).toBe('Undo')
  })

  it('createTranslator formats placeholders correctly', () => {
    const t = createTranslator({
      pageDefault: 'Sayfa {n}',
      pageCopy: '{name} (Kopya)',
    })

    expect(t('pageDefault', { n: 3 })).toBe('Sayfa 3')
    expect(t('pageCopy', { name: 'Harita 1' })).toBe('Harita 1 (Kopya)')
  })

  it('createTranslator handles unknown placeholders gracefully', () => {
    const t = createTranslator({
      select: 'Select',
    })
    expect(t('select')).toBe('Select')
  })

  it('allows updating default translations globally', () => {
    setDefaultTranslations({
      select: 'Choisir',
      undo: 'Annuler',
    })

    const t = createTranslator()
    expect(t('select')).toBe('Choisir')
    expect(t('undo')).toBe('Annuler')
    expect(t('redo')).toBe('Redo')

    resetDefaultTranslations()
    const tReset = createTranslator()
    expect(tReset('select')).toBe('Select')
  })

  it('formatDistance formats distances using translated unit tokens', () => {
    const tokens = {
      m: 'm',
      km: 'km',
      ft: 'ft',
      mi: 'mi',
    }

    expect(formatDistance(50, 'metric', tokens)).toBe('50 m')
    expect(formatDistance(1500, 'metric', tokens)).toBe('1.5 km')

    const customTokens = {
      ...tokens,
      km: 'kilometre',
      m: 'metre',
    }
    expect(formatDistance(50, 'metric', customTokens)).toBe('50 metre')
    expect(formatDistance(2000, 'metric', customTokens)).toBe('2 kilometre')
  })

  it('allows managing translations on vanilla LeafletTual controller', () => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      save: vi.fn(),
      restore: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      closePath: vi.fn(),
      setLineDash: vi.fn(),
      arc: vi.fn(),
      fillRec: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 10 }),
      setTransform: vi.fn(),
    })

    const container = document.createElement('div')
    const map = L.map(container).setView([0, 0], 1)

    const tual = createLeafletTual(map, {
      defaultValue: emptyDoc(),
      translations: {
        select: 'Auswählen',
      },
    })

    expect(tual.translations.select).toBe('Auswählen')
    expect(tual.translations.freedraw).toBe('Free draw')

    let notified = false
    tual.on('translations', () => {
      notified = true
    })

    tual.setTranslations({
      freedraw: 'Freihand',
    })

    expect(tual.translations.select).toBe('Auswählen')
    expect(tual.translations.freedraw).toBe('Freihand')
    expect(notified).toBe(true)

    tual.destroy()
    map.remove()
  })
})
