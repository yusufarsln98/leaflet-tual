import {
  DocParagraph,
  DocCode,
  DocCodeBlock,
  DocHeading,
  DocCallout,
  DocTable,
  Checklist,
} from '../../components/docs-elements'
import { DocSection } from '../docs-data'

export const stickyNotesSection: DocSection = {
  id: 'sticky-notes',
  title: 'Geopinned Sticky Notes & Text',
  category: 'core',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          In addition to hardware-accelerated canvas vector rendering,{' '}
          <strong className="text-text-primary font-semibold">leaflet-tual</strong> provides
          rich, draggable HTML sticky note overlays and floating text annotations pinned directly to
          geographic coordinates.
        </DocParagraph>
      </div>

      <DocHeading level={3} id="note-architecture">
        1. HTML DOM + Hardware Acceleration
      </DocHeading>

      <DocParagraph>
        While vector arrows and shapes are painted on an HTML5 canvas for high performance, sticky notes
        and text annotations benefit from full HTML rendering: native text selection, accessible text inputs,
        rich typography, color themes, and responsive collapsible cards.
      </DocParagraph>

      <DocCodeBlock
        language="typescript"
        filename="NoteItem.ts"
        code={`export type NoteCollapseState = 'expanded' | 'collapsed' | 'compact'

export interface NoteItem {
  id: string
  type: 'note'
  position: GeoPoint // Anchored to exact lat/lng
  title?: string
  text: string
  backgroundColor: string
  textColor: string
  width?: number
  height?: number
  minimized?: boolean | 'compact'
  collapseState?: NoteCollapseState
  createdAt: number
}`}
      />

      <DocHeading level={3} id="note-lifecycle">
        2. 3-State Sticky Note Lifecycle
      </DocHeading>

      <DocParagraph>
        Sticky notes support three presentation states across panning and zooming:
      </DocParagraph>

      <DocTable
        headers={['Collapse State', 'Visual Appearance', 'Usage Pattern']}
        rows={[
          [
            "'expanded'",
            'Full card showing editable title header, body textarea, color themes, and resize grip.',
            'Detailed mission notes, operational debriefs, and situational reports.',
          ],
          [
            "'collapsed'",
            'Header pill bar (110px–220px) showing the title input and action buttons without the body.',
            'Medium zoom levels where title visibility is sufficient without covering map tiles.',
          ],
          [
            "'compact'",
            'Ultra-compact pill shape (34px–140px, rounded-full) featuring a note icon, truncated title, and expand button.',
            'High-density maps and low-zoom overviews to save map real estate.',
          ],
        ]}
      />

      <DocCallout variant="tip" title="Automatic Zoom Adaptation">
        When the <DocCode highlight>autoMinimizeNotesZoom</DocCode> prop is set on{' '}
        <DocCode highlight>&lt;LeafletCanvas&gt;</DocCode>, sticky notes automatically transition to compact
        pill badges when the user zooms out past that threshold, and restore when zooming back in.
      </DocCallout>

      <DocHeading level={3} id="floating-text">
        3. Floating Text Annotations (TextItem)
      </DocHeading>

      <DocParagraph>
        The text tool (<DocCode highlight>type: 'text'</DocCode>) drops editable textual annotations onto
        the map. Text items support inline double-click editing, custom colors, bold weighting, and
        optional background pills:
      </DocParagraph>

      <DocCodeBlock
        language="typescript"
        filename="TextItem.ts"
        code={`export interface TextItem {
  id: string
  type: 'text'
  position: GeoPoint
  text: string
  color: string
  initialFontSize?: number
  baseZoom?: number
  fontWeight?: 'normal' | 'bold'
  backgroundColor?: string
  createdAt: number
}`}
      />

      <Checklist
        items={[
          {
            title: 'Dynamic Font Scaling',
            desc: 'Text elements scale smoothly as the user zooms in and out, maintaining visual proportion relative to geographic landmarks.',
          },
          {
            title: 'Drag & Repositioning',
            desc: 'Click and drag the handle bar or text body to reposition notes and labels anywhere on the globe.',
          },
          {
            title: 'Presentation Safety',
            desc: 'In readOnly mode, textareas and inputs become read-only while maintaining text readability and compact badges.',
          },
        ]}
      />
    </div>
  ),
  subsections: [
    { id: 'note-architecture', title: '1. HTML DOM + Hardware Acceleration', content: null },
    { id: 'note-lifecycle', title: '2. 3-State Sticky Note Lifecycle', content: null },
    { id: 'floating-text', title: '3. Floating Text Annotations (TextItem)', content: null },
  ],
}
