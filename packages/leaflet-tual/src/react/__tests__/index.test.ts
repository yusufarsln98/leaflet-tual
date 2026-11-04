import { describe, it, expect } from 'vitest'
import {
  VERSION,
  createId,
  emptyDoc,
  parseDoc,
  DocError,
  LeafletTual,
  LaserPointer,
  Laser,
  useLaserPointer,
  renderLaserOnCanvas,
  LASER_LIFETIME_MS,
  Toolbar,
  ToolbarMeasureGroup,
  ContextMenu,
  Sidebar,
  SidebarTriggerBar,
  useLeafletTual,
  useLeafletSync,
  useControllerStore,
  createController,
  ALL_ARROW_KINDS,
  ALL_SHAPE_KINDS,
  ALL_DRAW_KINDS,
  ALL_MEASURE_KINDS,
  isArrowKind,
  isShapeKind,
  isDrawKind,
  isMeasureKind,
  isToolVariant,
  getPageItems,
  geoToScreen,
  screenToGeo,
  toWorld,
  fromWorld,
  lockAspect,
  snapAngle,
  defaultVia,
  hitTest,
  bounds,
  getItemBounds,
  isItemInViewport,
  isItemInGeoBounds,
  getSelectionScreenBounds,
  findItemsInMarquee,
  distance,
  pathDistance,
  formatDistance,
  polygonArea,
  polygonCentroid,
  formatArea,
  resolveColor,
  renderArrowOnCanvas,
  renderFreedrawOnCanvas,
  renderShapeOnCanvas,
  renderPenOnCanvas,
  renderRulerOnCanvas,
  renderAreaOnCanvas,
  hitTestShapeHandle,
  hitTestAreaHandle,
  resizeShape,
  DEFAULT_TRANSLATION_TOKENS,
  resolveTranslations,
  createTranslator,
  getDefaultTranslations,
  setDefaultTranslations,
  resetDefaultTranslations,
  useTranslation,
  TranslationProvider,
  Button,
  IconButton,
  PillButton,
  SegmentedControl,
  Select,
  SelectField,
  Popover,
  ConfirmPopover,
  DropdownMenu,
  DropdownItem,
  ColorSwatch,
  ColorPaletteGrid,
  ColorSwatchList,
  CustomColorPicker,
  NumberField,
  TextField,
  Divider,
  ICONS,
  useLeafletDomGuard,
  disableTualDomPropagation,
} from '../../react.js'

import pkg from '../../../package.json'

describe('leaflet-tual v2 package contract exports', () => {
  it('exports VERSION constant matching package.json', () => {
    expect(VERSION).toBe(pkg.version)
    expect(VERSION).toBe('2.0.1')
  })

  it('creates unique ids with prefix', () => {
    const id1 = createId('arrow')
    const id2 = createId('arrow')
    expect(id1.startsWith('arrow-')).toBe(true)
    expect(id1).not.toBe(id2)
  })

  it('exports all core public components and hooks from leaflet-tual/react', () => {
    expect(LeafletTual).toBeDefined()
    expect(LaserPointer).toBeDefined()
    expect(Laser).toBeDefined()
    expect(useLaserPointer).toBeDefined()
    expect(Toolbar).toBeDefined()
    expect(ToolbarMeasureGroup).toBeDefined()
    expect(ContextMenu).toBeDefined()
    expect(Sidebar).toBeDefined()
    expect(SidebarTriggerBar).toBeDefined()
    expect(useLeafletTual).toBeDefined()
    expect(useLeafletSync).toBeDefined()
    expect(useControllerStore).toBeDefined()
    expect(createController).toBeDefined()
    expect(getPageItems).toBeDefined()
    expect(useLeafletDomGuard).toBeDefined()
    expect(disableTualDomPropagation).toBeDefined()
    expect(emptyDoc).toBeDefined()
    expect(parseDoc).toBeDefined()
    expect(DocError).toBeDefined()
  })

  it('exports tool variant constants and type guards', () => {
    expect(ALL_ARROW_KINDS).toEqual(['linear', 'curved', 'elbow', 's-curve'])
    expect(ALL_SHAPE_KINDS).toEqual([
      'square',
      'circle',
      'star',
      'actor',
      'triangle',
      'diamond',
      'hexagon',
      'marker',
    ])
    expect(ALL_DRAW_KINDS).toEqual(['freedraw', 'pen'])
    expect(ALL_MEASURE_KINDS).toEqual(['ruler', 'area'])

    expect(isArrowKind('curved')).toBe(true)
    expect(isArrowKind('circle')).toBe(false)
    expect(isShapeKind('star')).toBe(true)
    expect(isShapeKind('curved')).toBe(false)
    expect(isDrawKind('pen')).toBe(true)
    expect(isDrawKind('ruler')).toBe(false)
    expect(isMeasureKind('ruler')).toBe(true)
    expect(isMeasureKind('pen')).toBe(false)
    expect(isToolVariant('star')).toBe(true)
    expect(isToolVariant('curved')).toBe(true)
    expect(isToolVariant('select')).toBe(false)
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
    expect(getItemBounds).toBeDefined()
    expect(isItemInViewport).toBeDefined()
    expect(isItemInGeoBounds).toBeDefined()
    expect(getSelectionScreenBounds).toBeDefined()
    expect(findItemsInMarquee).toBeDefined()
    expect(distance).toBeDefined()
    expect(pathDistance).toBeDefined()
    expect(formatDistance).toBeDefined()
    expect(polygonArea).toBeDefined()
    expect(polygonCentroid).toBeDefined()
    expect(formatArea).toBeDefined()
    expect(resolveColor).toBeDefined()
    expect(renderArrowOnCanvas).toBeDefined()
    expect(renderFreedrawOnCanvas).toBeDefined()
    expect(renderShapeOnCanvas).toBeDefined()
    expect(renderPenOnCanvas).toBeDefined()
    expect(renderRulerOnCanvas).toBeDefined()
    expect(renderAreaOnCanvas).toBeDefined()
    expect(renderLaserOnCanvas).toBeDefined()
    expect(LASER_LIFETIME_MS).toBe(1000)
    expect(hitTestShapeHandle).toBeDefined()
    expect(hitTestAreaHandle).toBeDefined()
    expect(resizeShape).toBeDefined()
  })

  it('exports React UI primitives from react/ui', () => {
    expect(Button).toBeDefined()
    expect(IconButton).toBeDefined()
    expect(PillButton).toBeDefined()
    expect(SegmentedControl).toBeDefined()
    expect(Select).toBeDefined()
    expect(SelectField).toBeDefined()
    expect(Popover).toBeDefined()
    expect(ConfirmPopover).toBeDefined()
    expect(DropdownMenu).toBeDefined()
    expect(DropdownItem).toBeDefined()
    expect(ColorSwatch).toBeDefined()
    expect(ColorPaletteGrid).toBeDefined()
    expect(ColorSwatchList).toBeDefined()
    expect(CustomColorPicker).toBeDefined()
    expect(NumberField).toBeDefined()
    expect(TextField).toBeDefined()
    expect(Divider).toBeDefined()
    expect(ICONS).toBeDefined()
  })

  it('exports translation and internationalization utilities', () => {
    expect(DEFAULT_TRANSLATION_TOKENS).toBeDefined()
    expect(typeof DEFAULT_TRANSLATION_TOKENS).toBe('object')
    expect(resolveTranslations).toBeDefined()
    expect(createTranslator).toBeDefined()
    expect(getDefaultTranslations).toBeDefined()
    expect(setDefaultTranslations).toBeDefined()
    expect(resetDefaultTranslations).toBeDefined()
    expect(useTranslation).toBeDefined()
    expect(TranslationProvider).toBeDefined()
  })
})
