import { describe, it, expect, beforeEach } from 'vitest'
import {
  DEFAULT_TRANSLATION_TOKENS,
  resolveTranslations,
  createTranslator,
  setDefaultTranslations,
  resetDefaultTranslations,
  formatDistance,
} from '../shared/index.js'
import { createController } from '../features/index.js'
import { emptyDoc } from '../shared/doc.js'

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
    expect(DEFAULT_TRANSLATION_TOKENS.properties).toBe('Properties')
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
    })

    expect(t('pageDefault', { n: 3 })).toBe('Sayfa 3')
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

  it('allows managing translations on controller', () => {
    const tual = createController({
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
  })
})
