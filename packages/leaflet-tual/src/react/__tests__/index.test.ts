import { describe, it, expect } from 'vitest'
import {
  VERSION,
  createId,
  emptyDoc,
  parseDoc,
  DocError,
  LeafletTual,
  Toolbar,
  Sidebar,
  SidebarTriggerBar,
  useLeafletTual,
  useLeafletSync,
  createController,
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
  distance,
  pathDistance,
  formatDistance,
  resolveColor,
  renderArrowOnCanvas,
  renderFreedrawOnCanvas,
  renderShapeOnCanvas,
  renderPenOnCanvas,
  renderRulerOnCanvas,
  hitTestShapeHandle,
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
    expect(Sidebar).toBeDefined()
    expect(SidebarTriggerBar).toBeDefined()
    expect(useLeafletTual).toBeDefined()
    expect(useLeafletSync).toBeDefined()
    expect(createController).toBeDefined()
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
    expect(getItemBounds).toBeDefined()
    expect(distance).toBeDefined()
    expect(pathDistance).toBeDefined()
    expect(formatDistance).toBeDefined()
    expect(resolveColor).toBeDefined()
    expect(renderArrowOnCanvas).toBeDefined()
    expect(renderFreedrawOnCanvas).toBeDefined()
    expect(renderShapeOnCanvas).toBeDefined()
    expect(renderPenOnCanvas).toBeDefined()
    expect(renderRulerOnCanvas).toBeDefined()
    expect(hitTestShapeHandle).toBeDefined()
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
