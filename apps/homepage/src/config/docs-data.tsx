import React from 'react'
import { introductionSection } from './docs-data/introduction'
import { quickstartSection } from './docs-data/quickstart'
import { geoProjectionSection } from './docs-data/geo-projection'
import { drawingEngineSection, arrowsShapesSection } from './docs-data/drawing-engine'
import { itemsSchemaSection } from './docs-data/items-schema'
import { stickyNotesSection } from './docs-data/sticky-notes'
import { stateControllerSection } from './docs-data/state-controller'
import { toolbarOptionsSection } from './docs-data/toolbar-options'
import { apiReferenceSection } from './docs-data/api-reference'
import { skillMdSection } from './docs-data/skill-md'

export interface DocSubSection {
  id: string
  title: string
  content: React.ReactNode
}

export interface DocSection {
  id: string
  title: string
  category: 'overview' | 'core' | 'advanced' | 'api'
  content?: React.ReactNode
  subsections?: DocSubSection[]
}

export const docsData: DocSection[] = [
  introductionSection,
  quickstartSection,
  geoProjectionSection,
  drawingEngineSection,
  itemsSchemaSection,
  stickyNotesSection,
  stateControllerSection,
  toolbarOptionsSection,
  apiReferenceSection,
  skillMdSection,
]

export {
  introductionSection,
  quickstartSection,
  geoProjectionSection,
  drawingEngineSection,
  arrowsShapesSection,
  itemsSchemaSection,
  stickyNotesSection,
  stateControllerSection,
  toolbarOptionsSection,
  apiReferenceSection,
  skillMdSection,
}
