import { MARITIME_PRESET } from './maritime'
import { BAY_AREA_PRESET } from './bay-area'
import { ALPINE_PRESET } from './alpine'
import type { ShowcasePreset } from './types'

export type { ShowcasePreset }

export const SHOWCASE_PRESETS: ShowcasePreset[] = [
  MARITIME_PRESET,
  BAY_AREA_PRESET,
  ALPINE_PRESET,
]

