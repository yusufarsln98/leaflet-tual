import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Toolbar, useLeafletTual, setDefaultTranslations, resetDefaultTranslations } from '../index.js'
import { emptyDoc } from '../../core/index.js'

describe('React i18n translation customization', () => {
  beforeEach(() => {
    resetDefaultTranslations()
  })

  it('renders custom translation tokens on toolbar buttons and pages', () => {
    let ctrl: ReturnType<typeof useLeafletTual> | null = null

    function Harness() {
      const controller = useLeafletTual({
        translations: {
          select: 'Seç',
          draw: 'Çiz',
          arrow: 'Ok',
          shape: 'Şekil',
          ruler: 'Cetvel',
          note: 'Not',
          text: 'Metin',
          undo: 'Geri Al',
          redo: 'Yinele',
          pageDefault: 'Sayfa {n}',
        },
      })
      ctrl = controller
      return <Toolbar controller={controller} />
    }

    render(<Harness />)

    expect(screen.getByTitle(/^Seç/)).toBeDefined()
    expect(screen.getByTitle(/^Çiz/)).toBeDefined()
    expect(screen.getByTitle(/^Ok/)).toBeDefined()
    expect(screen.getByTitle(/^Şekil/)).toBeDefined()
    expect(screen.getByTitle(/^Cetvel/)).toBeDefined()
    expect(screen.getByTitle(/^Not/)).toBeDefined()
    expect(screen.getByTitle(/^Metin/)).toBeDefined()
    expect(screen.getByTitle(/Sayfa 1/)).toBeDefined()

    // Adding a page uses the pageDefault translation token
    act(() => {
      const newPageId = ctrl!.pages.add()
      ctrl!.pages.select(newPageId)
    })

    expect(screen.getByTitle(/Sayfa 2/)).toBeDefined()
  })

  it('updates dynamically when controller.setTranslations is called', () => {
    let ctrl: ReturnType<typeof useLeafletTual> | null = null

    function DynamicHarness() {
      const controller = useLeafletTual({
        defaultValue: emptyDoc(),
      })
      ctrl = controller
      return <Toolbar controller={controller} />
    }

    render(<DynamicHarness />)
    expect(screen.getByTitle(/^Select/)).toBeDefined()

    act(() => {
      ctrl!.setTranslations({
        select: 'Auswählen',
      })
    })

    expect(screen.getByTitle(/^Auswählen/)).toBeDefined()
  })

  it('supports global setDefaultTranslations across controllers', () => {
    setDefaultTranslations({
      select: 'Choisir',
    })

    function GlobalHarness() {
      const controller = useLeafletTual()
      return <Toolbar controller={controller} />
    }

    render(<GlobalHarness />)
    expect(screen.getByTitle(/^Choisir/)).toBeDefined()
  })
})
