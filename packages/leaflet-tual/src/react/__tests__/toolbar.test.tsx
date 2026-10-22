import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'
import {
  useLeafletTual,
  TualToolbar,
  getDropdownChevronRotation,
  getCollapseChevronRotation,
  getExpandChevronRotation,
  type ArrowItem,
  type TextItem,
} from '../index.js'
import { getHistoryBtnStyle } from '../widgets/TualToolbar/action-buttons-styles.js'
import { TestToolbarHarness } from './test-utils.js'

describe('TualToolbar', () => {
  it('opens Arrows dropdown without overlapping settings bar until an arrow is selected', () => {
    const { getByText, queryByText, queryByRole, getByRole, container } = render(
      React.createElement(TestToolbarHarness),
    )
    expect(getByText('Free Draw')).toBeTruthy()
    expect(getByText('Arrows')).toBeTruthy()
    expect(getByText('Shapes')).toBeTruthy()
    expect(queryByRole('menu')).toBeNull()

    // Click Arrows -> opens dropdown menu, settings bar is NOT rendered while dropdown is open
    fireEvent.click(getByText('Arrows'))
    expect(getByRole('menu')).toBeTruthy()
    expect(container.querySelector('.rlc-toolbar-secondary')).toBeNull()

    // Verify all arrow options are present (dashed flow is removed as a separate type, styled via dashed toggle)
    expect(getByText('Linear Arrow')).toBeTruthy()
    expect(getByText('Curved Arrow')).toBeTruthy()
    expect(getByText('Double-Headed')).toBeTruthy()
    expect(getByText('Elbow / Step')).toBeTruthy()
    expect(getByText('S-Curve Arrow')).toBeTruthy()
    expect(queryByText('Dashed Flow')).toBeNull()

    // Select Elbow / Step from dropdown -> closes menu and shows draw settings bar
    fireEvent.click(getByText('Elbow / Step'))
    expect(queryByRole('menu')).toBeNull()
    expect(container.querySelector('.rlc-toolbar-secondary')).toBeTruthy()
  })

  it('opens Shapes modal with Star, Square, Circle, Actor, Triangle, Diamond, Hexagon, and Marker and shows contextual settings bar', () => {
    const { getByText, queryByRole, queryByText, getByRole, container } = render(
      React.createElement(TestToolbarHarness),
    )

    fireEvent.click(getByText('Shapes'))
    expect(getByRole('dialog')).toBeTruthy()
    expect(container.querySelector('.rlc-toolbar-secondary')).toBeNull()

    expect(getByText('Square')).toBeTruthy()
    expect(getByText('Circle')).toBeTruthy()
    expect(getByText('Star')).toBeTruthy()
    expect(getByText('Actor')).toBeTruthy()
    expect(getByText('Triangle')).toBeTruthy()
    expect(getByText('Diamond')).toBeTruthy()
    expect(getByText('Hexagon')).toBeTruthy()
    expect(getByText('Marker')).toBeTruthy()
    expect(queryByText('Cloud')).toBeNull()

    fireEvent.click(getByText('Actor'))
    expect(queryByRole('dialog')).toBeNull()
    expect(container.querySelector('.rlc-toolbar-secondary')).toBeTruthy()

    // Contextual settings are rendered (width, dashed, filled)
    expect(getByText('Dashed')).toBeTruthy()
    expect(getByText('Fill')).toBeTruthy()
    // 1:1 global setting button should not exist
    expect(queryByText('1:1 (Shift)')).toBeNull()
  })

  it('applies toolButtonActive styles and data-active when dashed is toggled', () => {
    const { getByText } = render(
      React.createElement(TestToolbarHarness, {
        styles: {
          actionButton: { color: '#9CA3AF' },
          toolButtonActive: { color: '#111827', backgroundColor: '#B6F03C' },
        },
      }),
    )

    // Open Arrows dropdown and select Linear Arrow to activate arrow context
    fireEvent.click(getByText('Arrows'))
    fireEvent.click(getByText('Linear Arrow'))

    const dashedBtn = getByText('Dashed')
    expect(dashedBtn.getAttribute('data-active')).toBeNull()
    expect(dashedBtn.style.color).toBe('rgb(156, 163, 175)')

    // Toggle Dashed on
    fireEvent.click(dashedBtn)
    expect(dashedBtn.getAttribute('data-active')).toBe('true')
    expect(dashedBtn.classList.contains('rlc-action-btn')).toBe(true)
    expect(dashedBtn.style.color).toBe('rgb(17, 24, 39)')
    expect(dashedBtn.style.backgroundColor).toBe('rgb(182, 240, 60)')

    // Toggle Dashed off
    fireEvent.click(dashedBtn)
    expect(dashedBtn.getAttribute('data-active')).toBeNull()
    expect(dashedBtn.style.color).toBe('rgb(156, 163, 175)')
  })

  it('renders width option as a selectbox for arrows, shapes, and freedraw and updates stroke width', () => {
    let currentController!: ReturnType<typeof useLeafletTual>
    const Harness: React.FC = () => {
      const controller = useLeafletTual({
        initialItems: [
          {
            id: 'arrow-1',
            type: 'arrow',
            arrowStyle: 'linear',
            start: { lat: 41.0, lng: 28.9 },
            end: { lat: 41.02, lng: 28.95 },
            color: '#2563eb',
            strokeWidth: 3,
            createdAt: 1,
          },
        ],
      })
      currentController = controller
      React.useEffect(() => {
        controller.setSelectedId('arrow-1')
      }, [controller])

      return React.createElement(TualToolbar, {
        controller,
        classNames: { toolbarSelect: 'custom-select-class' },
        styles: { toolbarSelect: { color: 'rgb(255, 255, 255)' } },
      })
    }

    const { container } = render(React.createElement(Harness))
    const select = container.querySelector('select.rlc-toolbar-select') as HTMLSelectElement
    expect(select).toBeTruthy()
    expect(select.classList.contains('custom-select-class')).toBe(true)
    expect(select.getAttribute('aria-label')).toBe('Width')
    expect(select.value).toBe('3')

    // Contains pixel options
    const options = Array.from(select.querySelectorAll('option')).map((opt) => opt.textContent)
    expect(options).toContain('1px')
    expect(options).toContain('2px')
    expect(options).toContain('3px')
    expect(options).toContain('5px')
    expect(options).toContain('8px')

    // Changing the select box updates controller and selected item strokeWidth
    fireEvent.change(select, { target: { value: '5' } })
    expect(select.value).toBe('5')
    expect(currentController.strokeWidth).toBe(5)
    expect((currentController.items[0] as ArrowItem).strokeWidth).toBe(5)
  })

  it('supports custom strokeWidthOptions in TualToolbar', () => {
    const Harness: React.FC = () => {
      const controller = useLeafletTual()
      React.useEffect(() => {
        controller.setActiveTool('freedraw')
      }, [controller])

      return React.createElement(TualToolbar, {
        controller,
        strokeWidthOptions: [2, 4, 8, 16],
      })
    }

    const { container } = render(React.createElement(Harness))
    const select = container.querySelector('select.rlc-toolbar-select') as HTMLSelectElement
    expect(select).toBeTruthy()
    const optionValues = Array.from(select.querySelectorAll('option')).map((opt) => opt.value)
    expect(optionValues).toEqual(['2', '4', '8', '16'])
  })

  it('supports custom labels on TualToolbar', () => {
    const { getByText } = render(
      React.createElement(TestToolbarHarness, {
        labels: {
          select: 'Cursor',
          freedraw: 'Sketch',
          arrowGroup: 'Vectors',
          shapesGroup: 'Figures',
          note: 'Sticky Pin',
          text: 'Heading',
        },
      }),
    )
    expect(getByText('Cursor')).toBeTruthy()
    expect(getByText('Sketch')).toBeTruthy()
    expect(getByText('Vectors')).toBeTruthy()
    expect(getByText('Figures')).toBeTruthy()
    expect(getByText('Sticky Pin')).toBeTruthy()
    expect(getByText('Heading')).toBeTruthy()
  })

  it('hides all button labels including delete and clear when showToolLabels is false', () => {
    const Harness: React.FC = () => {
      const controller = useLeafletTual({
        initialItems: [
          {
            id: 'arrow-1',
            type: 'arrow',
            arrowStyle: 'linear',
            start: { lat: 41.0, lng: 28.9 },
            end: { lat: 41.02, lng: 28.95 },
            color: '#2563eb',
            strokeWidth: 3,
            createdAt: 1,
          },
        ],
      })

      React.useEffect(() => {
        controller.setSelectedId('arrow-1')
      }, [controller])

      return React.createElement(TualToolbar, {
        controller,
        showToolLabels: false,
      })
    }

    const { queryByText, container } = render(React.createElement(Harness))
    // Standard tool labels should not be present
    expect(queryByText('Select')).toBeNull()
    expect(queryByText('Free Draw')).toBeNull()
    expect(queryByText('Arrows')).toBeNull()
    expect(queryByText('Shapes')).toBeNull()
    expect(queryByText('Note Card')).toBeNull()
    expect(queryByText('Normal Text')).toBeNull()

    // Delete and Clear action buttons should NOT have label text
    expect(queryByText('Delete')).toBeNull()
    expect(queryByText('Clear')).toBeNull()

    // But the buttons themselves must still be rendered with their icons & titles
    const deleteBtn = container.querySelector('.rlc-delete-btn')
    expect(deleteBtn).toBeTruthy()
    expect(deleteBtn?.getAttribute('title')).toContain('Delete')

    const clearBtn = container.querySelector('button[title*="Clear all"]')
    expect(clearBtn).toBeTruthy()
  })

  it('renders dropdown chevrons as clean corner indicators pointing down without overlapping icons in vertical orientation without labels', () => {
    const Harness: React.FC = () => {
      const controller = useLeafletTual()
      return React.createElement(TualToolbar, {
        controller,
        position: 'left-center',
        showToolLabels: false,
      })
    }

    const { container } = render(React.createElement(Harness))
    const arrowGroup = container.querySelector('.rlc-arrow-group') as HTMLElement
    expect(arrowGroup).toBeTruthy()
    expect(arrowGroup.style.width).toBe('30px')
    expect(arrowGroup.style.height).toBe('30px')

    const shapesGroup = container.querySelector('.rlc-shapes-group') as HTMLElement
    expect(shapesGroup).toBeTruthy()
    expect(shapesGroup.style.width).toBe('30px')
    expect(shapesGroup.style.height).toBe('30px')

    const arrowBtn = arrowGroup.querySelector('button[data-tool="arrow-group"]') as HTMLElement
    expect(arrowBtn).toBeTruthy()
    const arrowChevron = arrowBtn.querySelector('span[aria-hidden="true"]') as HTMLElement
    expect(arrowChevron).toBeTruthy()
    // When closed: points downwards (rotate(0deg)), NOT sideways rotate(-90deg)
    expect(arrowChevron.style.transform).toBe('rotate(0deg)')
    expect(arrowChevron.style.position).toBe('absolute')
    expect(arrowChevron.style.width).toBe('8px')
    expect(arrowChevron.style.height).toBe('8px')

    // Click arrow button to open dropdown: flips to rotate(180deg)
    fireEvent.click(arrowBtn)
    expect(arrowChevron.style.transform).toBe('rotate(180deg)')
  })

  it('renders delete and clear button labels and menu-item grid layout in vertical orientation when showToolLabels is true', () => {
    const Harness: React.FC = () => {
      const controller = useLeafletTual({
        initialItems: [
          {
            id: 'arrow-1',
            type: 'arrow',
            arrowStyle: 'linear',
            start: { lat: 41.0, lng: 28.9 },
            end: { lat: 41.02, lng: 28.95 },
            color: '#2563eb',
            strokeWidth: 3,
            createdAt: 1,
          },
        ],
      })

      React.useEffect(() => {
        controller.setSelectedId('arrow-1')
      }, [controller])

      return React.createElement(TualToolbar, {
        controller,
        orientation: 'vertical',
        showToolLabels: true,
      })
    }

    const { getByText, container } = render(React.createElement(Harness))
    expect(getByText('Delete')).toBeTruthy()
    expect(getByText('Clear')).toBeTruthy()

    const deleteBtn = container.querySelector('.rlc-delete-btn') as HTMLButtonElement
    expect(deleteBtn).toBeTruthy()
    expect(deleteBtn.style.display).toBe('grid')
    expect(deleteBtn.style.gridTemplateColumns).toBe('20px 1fr auto')
    expect(deleteBtn.style.columnGap).toBe('10px')
    expect(deleteBtn.style.padding).toBe('8px 12px')
    expect(deleteBtn.style.textAlign).toBe('left')

    const clearBtn = container.querySelector('button[title*="Clear all"]') as HTMLButtonElement
    expect(clearBtn).toBeTruthy()
    expect(clearBtn.style.display).toBe('grid')
    expect(clearBtn.style.gridTemplateColumns).toBe('20px 1fr auto')
  })

  it('renders simplified shapes modal with optional custom title when provided', () => {
    const { getByText, queryByText, getByRole } = render(
      React.createElement(TestToolbarHarness, {
        labels: {
          shapesModalTitle: 'Custom Shapes Palette',
        },
      }),
    )

    fireEvent.click(getByText('Shapes'))
    expect(getByRole('dialog')).toBeTruthy()
    expect(getByText('Custom Shapes Palette')).toBeTruthy()
    // Simplified modal does NOT have the old noisy helper text
    expect(queryByText('Click or drag on map')).toBeNull()

    // All shape items are still available and clickable
    fireEvent.click(getByText('Diamond'))
    expect(queryByText('Custom Shapes Palette')).toBeNull()
  })

  it('renders contextual settings bar for Normal Text tool and updates text styling and content', () => {
    function TextToolbarHarness() {
      const controller = useLeafletTual({
        initialItems: [
          {
            id: 'text-1',
            type: 'text',
            position: { lat: 41.0, lng: 28.9 },
            text: 'Initial Text',
            color: '#2563eb',
            initialFontSize: 16,
            fontWeight: 'normal',
            createdAt: 1,
          },
        ],
      })
      return React.createElement(TualToolbar, { controller })
    }

    const { getByText, getByTitle, container } = render(
      React.createElement(TextToolbarHarness),
    )

    // Activate text tool
    fireEvent.click(getByText('Normal Text'))

    // Contextual settings bar is visible
    expect(container.querySelector('.rlc-toolbar-secondary')).toBeTruthy()

    // Font size select is visible
    const sizeSelect = container.querySelector('select[data-control="font-size"]') as HTMLSelectElement
    expect(sizeSelect).toBeTruthy()
    expect(sizeSelect.getAttribute('aria-label')).toBe('Size')
    expect(sizeSelect.value).toBe('16')

    // Change font size via select
    fireEvent.change(sizeSelect, { target: { value: '20' } })
    expect(sizeSelect.value).toBe('20')

    // Bold button is initially active by default
    const boldBtn = getByTitle('Toggle bold')
    expect(boldBtn).toBeTruthy()
    expect(boldBtn.getAttribute('data-active')).toBe('true')

    // Click bold toggle to switch to normal
    fireEvent.click(boldBtn)
    expect(boldBtn.getAttribute('data-active')).toBeNull()

    // Click again to switch back to bold
    fireEvent.click(boldBtn)
    expect(boldBtn.getAttribute('data-active')).toBe('true')
  })

  it('supports custom fontSizeOptions in TualToolbar', () => {
    const Harness: React.FC = () => {
      const controller = useLeafletTual()
      React.useEffect(() => {
        controller.setActiveTool('text')
      }, [controller])

      return React.createElement(TualToolbar, {
        controller,
        fontSizeOptions: [12, 18, 24, 36],
      })
    }

    const { container } = render(React.createElement(Harness))
    const select = container.querySelector('select[data-control="font-size"]') as HTMLSelectElement
    expect(select).toBeTruthy()
    const optionValues = Array.from(select.querySelectorAll('option')).map((opt) => opt.value)
    expect(optionValues).toEqual(['12', '16', '18', '24', '36'])
  })

  it('allows editing selected text item via input in contextual settings bar', () => {
    let testController: ReturnType<typeof useLeafletTual> | null = null
    function SelectedTextHarness() {
      const controller = useLeafletTual({
        initialItems: [
          {
            id: 'text-1',
            type: 'text',
            position: { lat: 41.0, lng: 28.9 },
            text: 'Hello Map',
            color: '#2563eb',
            initialFontSize: 16,
            fontWeight: 'normal',
            createdAt: 1,
          },
        ],
      })
      testController = controller
      return React.createElement(TualToolbar, { controller })
    }

    const { getByPlaceholderText, container } = render(
      React.createElement(SelectedTextHarness),
    )

    // Select the text item
    act(() => {
      testController?.setSelectedId('text-1')
    })

    // Contextual settings bar is visible
    expect(container.querySelector('.rlc-toolbar-secondary')).toBeTruthy()

    // Input for text is rendered
    const textInput = getByPlaceholderText('Text...') as HTMLInputElement
    expect(textInput).toBeTruthy()
    expect(textInput.value).toBe('Hello Map')

    // Edit text in input
    fireEvent.change(textInput, { target: { value: 'Updated Map Text' } })
    expect((testController!.items[0] as TextItem).text).toBe('Updated Map Text')
  })

  it('stacks settings controls horizontally first with wrap and min-width for inputs in vertical orientation', () => {
    function VerticalTextToolbarHarness() {
      const controller = useLeafletTual({
        initialItems: [
          {
            id: 'text-1',
            type: 'text',
            position: { lat: 41.0, lng: 28.9 },
            text: 'Hello Map',
            color: '#2563eb',
            initialFontSize: 16,
            fontWeight: 'normal',
            createdAt: 1,
          },
        ],
      })
      React.useEffect(() => {
        controller.selectItem('text-1')
      }, [controller])
      return React.createElement(TualToolbar, {
        controller,
        orientation: 'vertical',
      })
    }

    const { container, getByPlaceholderText } = render(
      React.createElement(VerticalTextToolbarHarness),
    )

    const secondaryBar = container.querySelector('.rlc-toolbar-secondary') as HTMLElement
    expect(secondaryBar).toBeTruthy()
    expect(secondaryBar.style.flexDirection).toBe('row')
    expect(secondaryBar.style.flexWrap).toBe('wrap')
    expect(secondaryBar.style.alignItems).toBe('center')

    const textInput = getByPlaceholderText('Text...') as HTMLInputElement
    expect(textInput).toBeTruthy()
    expect(textInput.style.minWidth).toBe('100px')
    expect(textInput.style.flex).toBe('1 1 auto')
  })

  describe('toolbar orientation & positioning', () => {
    it('sets up horizontal orientation automatically for top and bottom positions', () => {
      const { container, rerender } = render(
        React.createElement(TestToolbarHarness, { position: 'top' }),
      )
      let toolbar = container.querySelector('[data-tual-toolbar]')
      expect(toolbar?.getAttribute('data-position')).toBe('top')
      expect(toolbar?.getAttribute('data-orientation')).toBe('horizontal')

      rerender(React.createElement(TestToolbarHarness, { position: 'bottom' }))
      toolbar = container.querySelector('[data-tual-toolbar]')
      expect(toolbar?.getAttribute('data-position')).toBe('bottom')
      expect(toolbar?.getAttribute('data-orientation')).toBe('horizontal')
    })

    it('sets up vertical orientation automatically for left and right positions', () => {
      const { container, rerender } = render(
        React.createElement(TestToolbarHarness, { position: 'left' }),
      )
      let toolbar = container.querySelector('[data-tual-toolbar]')
      expect(toolbar?.getAttribute('data-position')).toBe('left')
      expect(toolbar?.getAttribute('data-orientation')).toBe('vertical')

      rerender(React.createElement(TestToolbarHarness, { position: 'right' }))
      toolbar = container.querySelector('[data-tual-toolbar]')
      expect(toolbar?.getAttribute('data-position')).toBe('right')
      expect(toolbar?.getAttribute('data-orientation')).toBe('vertical')
    })

    it('allows explicit orientation override regardless of position', () => {
      const { container } = render(
        React.createElement(TestToolbarHarness, {
          position: 'top',
          orientation: 'vertical',
        }),
      )
      const toolbar = container.querySelector('[data-tual-toolbar]')
      expect(toolbar?.getAttribute('data-position')).toBe('top')
      expect(toolbar?.getAttribute('data-orientation')).toBe('vertical')
    })

    it('properly configures chevron rotation for dropdowns across positions and orientations', () => {
      // Top (horizontal): closed points down (0deg), open points up (180deg)
      expect(getDropdownChevronRotation(false, 'top', 'horizontal')).toBe('rotate(0deg)')
      expect(getDropdownChevronRotation(true, 'top', 'horizontal')).toBe('rotate(180deg)')

      // Bottom (horizontal): closed points up (180deg), open points down (0deg)
      expect(getDropdownChevronRotation(false, 'bottom', 'horizontal')).toBe('rotate(180deg)')
      expect(getDropdownChevronRotation(true, 'bottom', 'horizontal')).toBe('rotate(0deg)')

      // Left (vertical): closed points right (-90deg), open points left (90deg)
      expect(getDropdownChevronRotation(false, 'left', 'vertical')).toBe('rotate(-90deg)')
      expect(getDropdownChevronRotation(true, 'left', 'vertical')).toBe('rotate(90deg)')

      // Right (vertical): closed points left (90deg), open points right (-90deg)
      expect(getDropdownChevronRotation(false, 'right', 'vertical')).toBe('rotate(90deg)')
      expect(getDropdownChevronRotation(true, 'right', 'vertical')).toBe('rotate(-90deg)')
    })

    it('properly configures collapse and expand chevron rotation across positions and orientations', () => {
      // Top: collapse points up (0deg), expand points down (0deg)
      expect(getCollapseChevronRotation('top', 'horizontal')).toBe('rotate(0deg)')
      expect(getExpandChevronRotation('top', 'horizontal')).toBe('rotate(0deg)')

      // Bottom: collapse points down (180deg), expand points up (180deg)
      expect(getCollapseChevronRotation('bottom', 'horizontal')).toBe('rotate(180deg)')
      expect(getExpandChevronRotation('bottom', 'horizontal')).toBe('rotate(180deg)')

      // Left: collapse points left (-90deg), expand points right (-90deg)
      expect(getCollapseChevronRotation('left', 'vertical')).toBe('rotate(-90deg)')
      expect(getExpandChevronRotation('left', 'vertical')).toBe('rotate(-90deg)')

      // Right: collapse points right (90deg), expand points left (90deg)
      expect(getCollapseChevronRotation('right', 'vertical')).toBe('rotate(90deg)')
      expect(getExpandChevronRotation('right', 'vertical')).toBe('rotate(90deg)')
    })

    it('renders squarish tool buttons with centered icons in vertical orientation', () => {
      const { container } = render(
        React.createElement(TestToolbarHarness, {
          orientation: 'vertical',
        }),
      )
      const selectBtn = container.querySelector('[data-tool="select"]') as HTMLButtonElement
      expect(selectBtn).toBeTruthy()
      expect(selectBtn.style.width).toBe('30px')
      expect(selectBtn.style.height).toBe('30px')
      expect(selectBtn.style.padding).toBe('0px')
      // Inline text labels are omitted in vertical mode to ensure squarish alignment
      expect(selectBtn.querySelector('span')).toBeNull()

      // Arrow dropdown button also uses 30x30px with corner indicator
      const arrowBtn = container.querySelector('[data-tool="arrow-group"]') as HTMLButtonElement
      expect(arrowBtn).toBeTruthy()
      expect(arrowBtn.style.width).toBe('30px')
      expect(arrowBtn.style.height).toBe('30px')

      // Action buttons (undo, redo) are also 30x30px in vertical mode
      const undoBtn = container.querySelector('[aria-label="Undo"]') as HTMLButtonElement
      expect(undoBtn).toBeTruthy()
      expect(undoBtn.style.width).toBe('30px')
      expect(undoBtn.style.height).toBe('30px')

      // Undo/Redo are stacked vertically and never show label text
      const redoBtn = container.querySelector('[aria-label="Redo"]') as HTMLButtonElement
      expect(redoBtn).toBeTruthy()
      expect(undoBtn.parentElement).toBe(redoBtn.parentElement)
      expect(undoBtn.parentElement?.style.flexDirection).toBe('column')
      expect(undoBtn.querySelector('span')).toBeNull()
      expect(redoBtn.querySelector('span')).toBeNull()
    })

    it('renders labels properly and expands layout in vertical orientation when showToolLabels is true', () => {
      const { container, getByText } = render(
        React.createElement(TestToolbarHarness, {
          orientation: 'vertical',
          showToolLabels: true,
          labels: {
            undo: 'Undo Action',
            redo: 'Redo Action',
          },
        }),
      )

      // Primary toolbar container has auto minWidth/width and stretches column items
      const primaryBar = container.querySelector('.rlc-toolbar-primary') as HTMLElement
      expect(primaryBar).toBeTruthy()
      expect(primaryBar.style.flexDirection).toBe('column')
      expect(primaryBar.style.alignItems).toBe('stretch')
      expect(primaryBar.style.width).toBe('auto')

      // Select button displays label text properly with full-width alignment
      const selectBtn = container.querySelector('[data-tool="select"]') as HTMLButtonElement
      expect(selectBtn).toBeTruthy()
      expect(selectBtn.style.display).toBe('grid')
      expect(selectBtn.style.gridTemplateColumns).toBe('20px 1fr auto')
      expect(selectBtn.style.columnGap).toBe('10px')
      expect(selectBtn.style.padding).toBe('8px 12px')
      expect(selectBtn.style.width).toBe('100%')
      expect(selectBtn.style.textAlign).toBe('left')
      expect(getByText('Select')).toBeTruthy()

      // Arrow dropdown displays label text and uses grid
      const arrowBtn = container.querySelector('[data-tool="arrow-group"]') as HTMLButtonElement
      expect(arrowBtn).toBeTruthy()
      expect(arrowBtn.style.display).toBe('grid')
      expect(arrowBtn.style.gridTemplateColumns).toBe('20px 1fr auto')
      expect(getByText('Arrows')).toBeTruthy()

      // Shapes modal displays label text and uses grid
      const shapesBtn = container.querySelector('[data-tool="shape-group"]') as HTMLButtonElement
      expect(shapesBtn).toBeTruthy()
      expect(shapesBtn.style.display).toBe('grid')
      expect(shapesBtn.style.gridTemplateColumns).toBe('20px 1fr auto')
      expect(getByText('Shapes')).toBeTruthy()

      // Free draw displays label text
      expect(getByText('Free Draw')).toBeTruthy()

      // Note card displays label text
      expect(getByText('Note Card')).toBeTruthy()

      // Text tool displays label text
      expect(getByText('Normal Text')).toBeTruthy()

      // Action buttons remain icon-only (labels are never rendered), side-by-side in a row
      const undoBtn = container.querySelector('[aria-label="Undo Action"]') as HTMLButtonElement
      const redoBtn = container.querySelector('[aria-label="Redo Action"]') as HTMLButtonElement
      expect(undoBtn).toBeTruthy()
      expect(redoBtn).toBeTruthy()
      expect(undoBtn.querySelector('span')).toBeNull()
      expect(redoBtn.querySelector('span')).toBeNull()
      expect(undoBtn.parentElement).toBe(redoBtn.parentElement)
      expect(undoBtn.parentElement?.style.flexDirection).toBe('row')
    })

    it('renders compact rectangular trigger when collapsed in vertical mode', () => {
      const { container } = render(
        React.createElement(TestToolbarHarness, {
          orientation: 'vertical',
          collapsed: true,
        }),
      )
      const expandBtn = container.querySelector('[data-toolbar-expand="true"]') as HTMLButtonElement
      expect(expandBtn).toBeTruthy()
      expect(expandBtn.style.padding).toBe('3px 7px')
      expect(expandBtn.style.borderRadius).toBe('2px')
      // No wide text label span
      expect(expandBtn.textContent).toBe('')
    })
  })

  describe('undo/redo disabled state styling', () => {
    it('marks undo/redo buttons with disabled classes, styles, and opacity when no history action is available', () => {
      let currentController!: ReturnType<typeof useLeafletTual>
      const Harness: React.FC = () => {
        const controller = useLeafletTual()
        currentController = controller
        return React.createElement(TualToolbar, {
          controller,
          classNames: {
            actionButton: 'custom-action',
            actionButtonDisabled: 'custom-action-disabled',
          },
          styles: {
            actionButton: { color: '#1F2937' },
            actionButtonDisabled: { opacity: 0.3, cursor: 'not-allowed' },
          },
        })
      }
      const { container } = render(React.createElement(Harness))

      const undoBtn = container.querySelector('[aria-label="Undo"]') as HTMLButtonElement
      const redoBtn = container.querySelector('[aria-label="Redo"]') as HTMLButtonElement
      expect(undoBtn).toBeTruthy()
      expect(redoBtn).toBeTruthy()

      // Empty history -> both buttons are disabled with built-in + custom disabled classes
      expect(undoBtn.disabled).toBe(true)
      expect(redoBtn.disabled).toBe(true)
      expect(undoBtn.classList.contains('rlc-action-btn')).toBe(true)
      expect(undoBtn.classList.contains('rlc-action-btn-disabled')).toBe(true)
      expect(undoBtn.classList.contains('custom-action-disabled')).toBe(true)
      expect(redoBtn.classList.contains('rlc-action-btn-disabled')).toBe(true)
      expect(redoBtn.classList.contains('custom-action-disabled')).toBe(true)
      // Default disabled styling keeps the built-in opacity, overridable via the disabled style slot
      expect(undoBtn.style.opacity).toBe('0.3')
      expect(undoBtn.style.cursor).toBe('not-allowed')

      // Completing an edit fills the past stack -> undo becomes enabled and the disabled hooks are dropped
      act(() => {
        currentController.addItem({
          id: 'note-1',
          type: 'note',
          position: { lat: 41, lng: 28.9 },
          text: 'hello',
          backgroundColor: '#fff9c4',
          textColor: '#000000',
          createdAt: 1,
        })
        currentController.notifyChangeComplete()
      })

      const undoBtnAfter = container.querySelector('[aria-label="Undo"]') as HTMLButtonElement
      const redoBtnAfter = container.querySelector('[aria-label="Redo"]') as HTMLButtonElement
      expect(undoBtnAfter.disabled).toBe(false)
      expect(redoBtnAfter.disabled).toBe(true)
      expect(undoBtnAfter.classList.contains('rlc-action-btn-disabled')).toBe(false)
      expect(undoBtnAfter.classList.contains('custom-action-disabled')).toBe(false)
      expect(redoBtnAfter.classList.contains('rlc-action-btn-disabled')).toBe(true)
      expect(undoBtnAfter.style.opacity).toBe('1')
    })

    it('does not mix flex shorthand with flexShrink in history button styles', () => {
      const verticalWithLabels = getHistoryBtnStyle(true, true, true, false)
      expect(verticalWithLabels.flex).toBeUndefined()
      expect(verticalWithLabels.flexGrow).toBe(1)
      expect(verticalWithLabels.flexShrink).toBe(0)
      expect(verticalWithLabels.flexBasis).toBe(0)

      const horizontal = getHistoryBtnStyle(true, false, false, false)
      expect(horizontal.flex).toBeUndefined()
      expect(horizontal.flexShrink).toBe(0)
    })
  })

  describe('toolbar collapse functionality', () => {
    it('renders collapse button and collapses into compact trigger when clicked', () => {
      const onCollapsedChange = vi.fn()
      const { container, getByRole, queryByRole } = render(
        React.createElement(TestToolbarHarness, {
          onCollapsedChange,
        }),
      )

      // Initially expanded
      expect(getByRole('toolbar')).toBeTruthy()
      const collapseBtn = container.querySelector('[data-toolbar-collapse="true"]')
      expect(collapseBtn).toBeTruthy()

      // Click collapse
      fireEvent.click(collapseBtn!)
      expect(onCollapsedChange).toHaveBeenCalledWith(true)

      // Now collapsed: primary toolbar strip is hidden, compact expand button is shown
      expect(queryByRole('toolbar')).toBeNull()
      const expandBtn = container.querySelector('[data-toolbar-expand="true"]')
      expect(expandBtn).toBeTruthy()

      // Click expand to restore
      fireEvent.click(expandBtn!)
      expect(onCollapsedChange).toHaveBeenCalledWith(false)
      expect(getByRole('toolbar')).toBeTruthy()
    })

    it('supports controlled collapsed prop', () => {
      const { container, rerender, queryByRole } = render(
        React.createElement(TestToolbarHarness, {
          collapsed: true,
        }),
      )
      expect(queryByRole('toolbar')).toBeNull()
      expect(container.querySelector('[data-toolbar-expand="true"]')).toBeTruthy()

      rerender(
        React.createElement(TestToolbarHarness, {
          collapsed: false,
        }),
      )
      expect(queryByRole('toolbar')).toBeTruthy()
    })

    it('can hide collapse button when collapsible is false or showCollapseButton is false', () => {
      const { container, rerender } = render(
        React.createElement(TestToolbarHarness, {
          collapsible: false,
        }),
      )
      expect(container.querySelector('[data-toolbar-collapse="true"]')).toBeNull()

      rerender(
        React.createElement(TestToolbarHarness, {
          showCollapseButton: false,
        }),
      )
      expect(container.querySelector('[data-toolbar-collapse="true"]')).toBeNull()
    })
  })
})
