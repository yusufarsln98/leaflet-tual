import {
  DocParagraph,
  DocCode,
  DocCodeBlock,
  DocHeading,
  DocTable,
} from '../../components/docs-elements'
import { DocSection } from '../docs-data'

export const toolbarOptionsSection: DocSection = {
  id: 'toolbar-options',
  title: 'TualToolbar Configuration & Options',
  category: 'advanced',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          The <DocCode highlight>TualToolbar</DocCode> widget provides a ready-to-use, floating or docked
          toolbar for drawing tool selection, color pickers, stroke widths, font sizes, history controls,
          and custom tools. It can be embedded inside <DocCode highlight>&lt;LeafletTual&gt;</DocCode>{' '}
          or rendered completely decoupled in an external application navigation bar.
        </DocParagraph>
      </div>

      <DocHeading level={3} id="toolbar-positions">
        1. Toolbar Positions &amp; Orientations
      </DocHeading>

      <DocParagraph>
        When embedded inside the map viewport, the toolbar supports 8 directional positions and 2 layout
        orientations:
      </DocParagraph>

      <DocTable
        headers={['Position (ToolbarPosition)', 'Orientation (ToolbarOrientation)', 'Description']}
        rows={[
          ["'top-center' (default)", "'horizontal'", 'Centered along the top map boundary, ideal for desktop dashboards.'],
          ["'bottom-center'", "'horizontal'", 'Centered along the bottom edge, convenient for mobile & tablet thumb reach.'],
          ["'left-center'", "'vertical'", 'Docked along the left vertical border, standard for CAD/GIS workflows.'],
          ["'right-center'", "'vertical'", 'Docked along the right vertical border, leaving left space for sidebars.'],
          ["'top'", "'horizontal'", 'Pinned to the top-left corner.'],
          ["'bottom'", "'horizontal'", 'Pinned to the bottom-left corner.'],
          ["'left'", "'vertical'", 'Pinned along the top-left edge vertically.'],
          ["'right'", "'vertical'", 'Pinned along the top-right edge vertically.'],
        ]}
      />

      <DocCodeBlock
        language="tsx"
        filename="ToolbarPositionExample.tsx"
        code={`// Dock toolbar vertically on the left side:
<LeafletTual
  toolbarPosition="left-center"
  toolbarOrientation="vertical"
/>`}
      />

      <DocHeading level={3} id="tool-groups">
        2. Tool Groups Filtering (enabledTools)
      </DocHeading>

      <DocParagraph>
        Restrict visible tools to a subset using <DocCode highlight>enabledTools</DocCode> with{' '}
        <DocCode highlight>ToolbarToolGroupId</DocCode> values:
      </DocParagraph>

      <DocTable
        headers={['Group ID', 'Tools Included', 'Purpose']}
        rows={[
          ["'select'", 'Select / Bounding Box tool (V)', 'Select, move, resize, and inspect annotations.'],
          ["'freedraw'", 'Freehand Pen tool (P)', 'Draw smooth freeform vector paths and perimeters.'],
          ["'arrow'", '5 Vector Arrows Dropdown (A)', 'Linear, curved Bézier, bi-directional, elbow, and s-curve arrows.'],
          ["'shape'", '8 Geometric Primitives Modal (S)', 'Square, circle, star, actor, triangle, diamond, hexagon, marker.'],
          ["'note'", 'Geopinned Sticky Note tool (N)', 'Drop draggable HTML sticky notes with markdown support.'],
          ["'text'", 'Floating Text tool (T)', 'Place editable text overlays with zoom-scaled sizing.'],
        ]}
      />

      <DocCodeBlock
        language="tsx"
        filename="EnabledToolsExample.tsx"
        code={`// Only allow arrows and shapes on the toolbar:
<LeafletTual enabledTools={['select', 'arrow', 'shape']} />`}
      />

      <DocHeading level={3} id="custom-tools">
        3. Custom Toolbar Items (customTools)
      </DocHeading>

      <DocParagraph>
        Inject custom buttons or widgets into the primary toolbar strip via the <DocCode highlight>customTools</DocCode> prop:
      </DocParagraph>

      <DocCodeBlock
        language="tsx"
        filename="CustomToolsExample.tsx"
        code={`export interface CustomToolbarItem {
  id: string
  label?: string
  title?: string
  icon?: React.ReactNode
  isActive?: boolean
  disabled?: boolean
  onClick?: (controller: LeafletTualController) => void
  render?: (controller: LeafletTualController) => React.ReactNode
}

// Example usage:
const customExportTool: CustomToolbarItem = {
  id: 'export-geojson',
  title: 'Export Layer to GeoJSON',
  label: 'Export',
  icon: <ShareIcon className="w-4 h-4" />,
  onClick: (controller) => {
    const json = controller.exportJSON()
    downloadFile('annotations.json', json)
  },
}

<LeafletTual customTools={[customExportTool]} />`}
      />

      <DocHeading level={3} id="collapsible-toolbar">
        4. Collapsible Toolbar Controls
      </DocHeading>

      <DocParagraph>
        The toolbar includes a built-in collapse mechanism that tucks the tool strip into a compact toggle button:
      </DocParagraph>

      <DocTable
        headers={['Prop', 'Type', 'Default', 'Description']}
        rows={[
          ['collapsible', 'boolean', 'true', 'Enables or disables collapsible functionality.'],
          ['defaultCollapsed', 'boolean', 'false', 'Initial collapsed state when uncontrolled.'],
          ['collapsed', 'boolean', 'undefined', 'Controlled collapsed boolean state.'],
          ['onCollapsedChange', '(collapsed: boolean) => void', 'undefined', 'Callback fired when the user expands or collapses the toolbar.'],
          ['showCollapseButton', 'boolean', 'true', 'Shows or hides the collapse chevron toggle button.'],
        ]}
      />

      <DocHeading level={3} id="custom-styling">
        5. Deep Customization with classNames &amp; styles
      </DocHeading>

      <DocParagraph>
        Customize every slot of the toolbar using state-aware class names or inline styles:
      </DocParagraph>

      <DocCodeBlock
        language="tsx"
        filename="ToolbarStylingExample.tsx"
        code={`<LeafletTual
  classNames={{
    toolbar: 'bg-slate-900/95 border-slate-700/80 shadow-2xl backdrop-blur-md',
    toolButton: 'text-slate-300 hover:text-white hover:bg-slate-800',
    toolButtonActive: 'bg-emerald-600 text-white font-semibold shadow-inner',
    swatchButtonActive: 'ring-2 ring-emerald-400 ring-offset-2',
    actionButtonDisabled: 'opacity-40 cursor-not-allowed hover:bg-transparent',
  }}
/>`}
      />

      <DocHeading level={3} id="decoupled-usage">
        6. Decoupled External Toolbar
      </DocHeading>

      <DocParagraph>
        To render the toolbar outside the Leaflet map container (for instance, in an application top
        navigation bar or side inspector dock), disable the embedded toolbar on <DocCode highlight>&lt;LeafletTual&gt;</DocCode>{' '}
        using <DocCode highlight>showToolbar={'{false}'}</DocCode> and render <DocCode highlight>&lt;TualToolbar&gt;</DocCode>{' '}
        externally:
      </DocParagraph>

      <DocCodeBlock
        language="tsx"
        filename="AppWorkspace.tsx"
        code={`import { MapContainer, TileLayer } from 'react-leaflet'
import { LeafletTual, TualToolbar, useLeafletTual } from 'leaflet-tual/react'

export function AppWorkspace() {
  const controller = useLeafletTual()

  return (
    <div className="flex flex-col h-screen">
      {/* Application Header with Decoupled Toolbar */}
      <header className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="text-white font-bold">Map Workspace</div>
        <TualToolbar controller={controller} orientation="horizontal" />
      </header>

      {/* Map View without embedded floating toolbar */}
      <div className="flex-1 relative">
        <MapContainer center={[41.01, 28.97]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LeafletTual controller={controller} showToolbar={false} />
        </MapContainer>
      </div>
    </div>
  )
}`}
      />
    </div>
  ),
  subsections: [
    { id: 'toolbar-positions', title: '1. Toolbar Positions & Orientations', content: null },
    { id: 'tool-groups', title: '2. Tool Groups Filtering (enabledTools)', content: null },
    { id: 'custom-tools', title: '3. Custom Toolbar Items (customTools)', content: null },
    { id: 'collapsible-toolbar', title: '4. Collapsible Toolbar Controls', content: null },
    { id: 'custom-styling', title: '5. Deep Customization with classNames & styles', content: null },
    { id: 'decoupled-usage', title: '6. Decoupled External Toolbar', content: null },
  ],
}
