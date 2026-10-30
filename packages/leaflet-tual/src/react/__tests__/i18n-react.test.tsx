import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Toolbar, Sidebar, useLeafletTual, setDefaultTranslations, resetDefaultTranslations } from '../index.js'
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
    expect(screen.getByText('Sayfa 1')).toBeDefined()

    // Adding a page uses the pageDefault translation token
    act(() => {
      const newPageId = ctrl!.pages.add()
      ctrl!.pages.select(newPageId)
    })

    expect(screen.getByText('Sayfa 2')).toBeDefined()
  })

  it('updates dynamically when controller.setTranslations is called and propagates to nested Sidebar sections', () => {
    let ctrl: ReturnType<typeof useLeafletTual> | null = null

    function DynamicHarness() {
      const controller = useLeafletTual({
        defaultValue: emptyDoc(),
      })
      ctrl = controller
      return (
        <>
          <Toolbar controller={controller} />
          <Sidebar controller={controller} onClose={() => {}} />
        </>
      )
    }

    render(<DynamicHarness />)
    expect(screen.getByTitle(/^Select/)).toBeDefined()
    expect(screen.getByText('Properties')).toBeDefined()

    act(() => {
      ctrl!.setTranslations({
        select: 'Auswählen',
        properties: 'Eigenschaften',
        nothingSelected: 'Nichts ausgewählt',
      })
    })

    expect(screen.getByTitle(/^Auswählen/)).toBeDefined()
    expect(screen.getByText('Eigenschaften')).toBeDefined()
    expect(screen.getByText('Nichts ausgewählt')).toBeDefined()
  })

  it('supports global setDefaultTranslations across controllers', () => {
    setDefaultTranslations({
      select: 'Choisir',
      properties: 'Propriétés',
    })

    function GlobalHarness() {
      const controller = useLeafletTual()
      return <Toolbar controller={controller} />
    }

    render(<GlobalHarness />)
    expect(screen.getByTitle(/^Choisir/)).toBeDefined()
  })
})
