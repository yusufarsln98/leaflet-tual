import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Toolbar, useLeafletTual } from '../index.js'
import { emptyDoc } from '../../core/index.js'

describe('React i18n translation customization', () => {
  it('renders custom translation tokens on toolbar buttons and pages', () => {
    let ctrl: ReturnType<typeof useLeafletTual> | null = null

    function Harness() {
      const controller = useLeafletTual({
        defaultValue: emptyDoc(),
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

    // Adding a page uses the pageDefault translation token
    act(() => {
      const newPageId = ctrl!.pages.add()
      ctrl!.pages.select(newPageId)
    })

    expect(screen.getByText('Sayfa 2')).toBeDefined()
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
      ctrl!.setTranslations({ select: 'Auswählen' })
    })

    expect(screen.getByTitle(/^Auswählen/)).toBeDefined()
  })
})
