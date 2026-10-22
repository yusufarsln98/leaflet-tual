import {
  DocParagraph,
  DocHeading,
  DocTable,
  DocCallout,
  DocCode,
} from '../../components/docs-elements'
import { DocSection } from '../docs-data'

export const apiReferenceSection: DocSection = {
  id: 'api-reference',
  title: 'API & Component Reference',
  category: 'api',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          Complete, verified reference for all exported components, props, hooks, controller methods,
          and TypeScript interfaces in{' '}
          <strong className="text-text-primary font-semibold">leaflet-tual</strong>.
        </DocParagraph>
      </div>

      <DocHeading level={3} id="leaflet-tual-props">
        1. &lt;LeafletTual&gt; Component Props
      </DocHeading>

      <DocParagraph>
        The main canvas container component placed inside a <DocCode highlight>&lt;MapContainer&gt;</DocCode>{' '}
        or rendered with an explicit <DocCode highlight>map</DocCode> instance. It accepts the following props:
      </DocParagraph>

      <DocTable
        headers={['Prop', 'Type', 'Default', 'Description']}
        rows={[
          ['map', 'L.Map | null', 'undefined', 'Leaflet map instance. Automatically resolved via useMap() when nested inside <MapContainer>.'],
          ['controller', 'LeafletTualController', 'undefined', 'Controller instance from useLeafletTual(). If omitted, an internal controller is instantiated.'],
          ['readOnly', 'boolean', 'false', 'Enables view-only presentation mode: hides selection handles, disables drawing surfaces, and guards against mutations while keeping map panning & zooming intact.'],
          ['showToolbar', 'boolean', '!readOnly', 'Controls visibility of the floating on-map toolbar. Defaults to false when readOnly is true.'],
          ['toolbarPosition', 'ToolbarPosition', "'top-center'", "Toolbar placement: 'top' | 'bottom' | 'left' | 'right' | 'top-center' | 'bottom-center' | 'left-center' | 'right-center'."],
          ['toolbarOrientation / orientation', 'ToolbarOrientation', 'inferred', "Toolbar layout direction: 'horizontal' | 'vertical'."],
          ['collapsible', 'boolean', 'true', 'Whether the floating toolbar can be minimized into a compact toggle trigger.'],
          ['defaultCollapsed', 'boolean', 'false', 'Initial collapsed state when uncontrolled.'],
          ['collapsed', 'boolean', 'undefined', 'Controlled collapsed state.'],
          ['onCollapsedChange', '(collapsed: boolean) => void', 'undefined', 'Callback fired when the toolbar expands or collapses.'],
          ['showCollapseButton', 'boolean', 'true', 'Whether to render the collapse chevron button.'],
          ['enabledTools', 'readonly ToolbarToolGroupId[]', 'undefined', "Allowed tool groups: 'select' | 'freedraw' | 'arrow' | 'shape' | 'note' | 'text'."],
          ['customTools', 'readonly CustomToolbarItem[]', 'undefined', 'Custom buttons or widgets injected into the primary toolbar strip.'],
          ['showHistoryControls', 'boolean', 'true', 'Whether to display undo and redo history buttons.'],
          ['showDeleteButton', 'boolean', 'true', 'Whether to display the delete selected item button.'],
          ['showClearButton', 'boolean', 'true', 'Whether to display the clear all annotations button.'],
          ['showToolLabels', 'boolean', 'true', 'Whether tool buttons display text labels alongside their icons.'],
          ['labels', 'TualLabels', '{}', 'Custom localized strings for toolbar buttons, tooltips, and place-holders.'],
          ['icons', 'TualIcons', '{}', 'Custom ReactNode icon overrides for tool buttons and actions.'],
          ['zIndex', 'number', '650', 'CSS z-index applied to the canvas overlay container portal.'],
          ['unstyled', 'boolean', 'false', 'When true, removes default inline styling rules for full custom CSS styling.'],
          ['classNames', 'LeafletTualClassNames', '{}', 'CSS class slots for container, canvas, toolbar, notes, and text overlays.'],
          ['styles', 'LeafletTualStyles', '{}', 'Inline style slots mirroring classNames with state-aware slots (toolButtonActive, actionButtonDisabled, etc.).'],
          ['annotationTheme', 'TualAnnotationTheme', 'DEFAULT_THEME', 'Custom styling for 2D canvas selection glow, handles, and guidelines.'],
          ['arrowTheme', 'ArrowRenderTheme', 'undefined', 'Custom rendering parameters for vector arrowheads and shafts.'],
          ['strokeColors', 'readonly string[]', 'STROKE_COLORS', 'Array of hex color swatches available in the contextual settings bar.'],
          ['strokeWidthOptions', 'readonly number[]', '[1, 2, 3, 4, 5, 6, 8, 10, 12]', 'Pixel stroke widths selectable in the Width dropdown.'],
          ['fontSizeOptions', 'readonly number[]', '[10, 12, ... 48]', 'Font sizes in pixels selectable in the Size dropdown for text.'],
          ['renderToolbar', '(controller) => ReactNode', 'undefined', 'Custom render function replacing the built-in toolbar.'],
          ['renderNote', '(props: RenderNoteProps) => ReactNode', 'undefined', 'Custom render function for geopinned sticky notes.'],
          ['renderText', '(props: RenderTextProps) => ReactNode', 'undefined', 'Custom render function for floating text annotations.'],
          ['clampOverlaysToViewport', 'boolean', 'true', 'Prevents sticky notes and text from drifting outside the map boundaries.'],
          ['autoMinimizeNotesZoom', 'number', 'undefined', 'Map zoom threshold below which sticky notes automatically collapse into compact badges.'],
          ['autoMinimizeTextZoom', 'number', 'undefined', 'Map zoom threshold below which text annotations auto-minimize.'],
          ['className', 'string', 'undefined', 'Custom CSS class applied to the root canvas overlay container.'],
          ['style', 'CSSProperties', 'undefined', 'Inline style overrides for the root canvas overlay container.'],
        ]}
      />

      <DocHeading level={3} id="canvas-toolbar-props">
        2. &lt;TualToolbar&gt; Component Props
      </DocHeading>

      <DocParagraph>
        Use <DocCode highlight>&lt;TualToolbar&gt;</DocCode> when rendering an external, decoupled
        toolbar outside of <DocCode highlight>&lt;MapContainer&gt;</DocCode>:
      </DocParagraph>

      <DocTable
        headers={['Prop', 'Type', 'Default', 'Description']}
        rows={[
          ['controller', 'LeafletTualController', 'required', 'Active controller instance managing the target canvas overlay.'],
          ['position', 'ToolbarPosition', "'top-center'", 'Position styling helper if embedded in a custom relative container.'],
          ['orientation', 'ToolbarOrientation', "'horizontal'", "Layout direction: 'horizontal' | 'vertical'."],
          ['collapsible', 'boolean', 'true', 'Whether the toolbar can be collapsed to a compact trigger.'],
          ['defaultCollapsed', 'boolean', 'false', 'Initial collapsed state when uncontrolled.'],
          ['collapsed', 'boolean', 'undefined', 'Controlled collapsed state.'],
          ['onCollapsedChange', '(collapsed: boolean) => void', 'undefined', 'Callback fired on collapse state change.'],
          ['showCollapseButton', 'boolean', 'true', 'Whether to render the collapse toggle button.'],
          ['readOnly', 'boolean', 'false', 'When true, disables creation tools and mutation actions.'],
          ['enabledTools', 'readonly ToolbarToolGroupId[]', 'undefined', 'List of allowed tool groups.'],
          ['customTools', 'readonly CustomToolbarItem[]', 'undefined', 'Custom action buttons added to the toolbar.'],
          ['showHistoryControls', 'boolean', 'true', 'Displays undo and redo buttons.'],
          ['showDeleteButton', 'boolean', 'true', 'Displays the delete selected item button.'],
          ['showClearButton', 'boolean', 'true', 'Displays the clear all items button.'],
          ['showToolLabels', 'boolean', 'true', 'Displays textual label below each icon button.'],
          ['labels', 'TualLabels', '{}', 'Localized text labels and tooltip strings.'],
          ['icons', 'TualIcons', '{}', 'Custom icon ReactNodes.'],
          ['unstyled', 'boolean', 'false', 'Strips default styling.'],
          ['classNames', 'LeafletTualClassNames', '{}', 'Custom CSS class slots.'],
          ['styles', 'LeafletTualStyles', '{}', 'Custom inline style slots.'],
          ['strokeColors', 'readonly string[]', 'STROKE_COLORS', 'Color swatches shown in the settings bar.'],
          ['strokeWidthOptions', 'readonly number[]', 'DEFAULT_OPTIONS', 'Stroke width dropdown options.'],
          ['fontSizeOptions', 'readonly number[]', 'DEFAULT_OPTIONS', 'Font size dropdown options.'],
          ['className', 'string', 'undefined', 'Wrapper container CSS class.'],
          ['style', 'CSSProperties', 'undefined', 'Wrapper container inline CSS style.'],
        ]}
      />

      <DocHeading level={3} id="use-leaflet-tual-options">
        3. useLeafletTual(options) Options
      </DocHeading>

      <DocTable
        headers={['Option', 'Type', 'Default', 'Description']}
        rows={[
          ['initialItems', 'TualItem[]', '[]', 'Initial annotations array in uncontrolled mode.'],
          ['items', 'TualItem[]', 'undefined', 'Controlled array of canvas annotations.'],
          ['maxHistory', 'number', '50', 'Maximum undo/redo stack depth.'],
          ['readOnly', 'boolean', 'false', 'Enables presentation read-only mode.'],
          ['initialTool', 'TualTool', "'select'", 'Active tool on initial mount.'],
          ['interactive', 'boolean', 'true', 'Enables pointer dragging and selection on canvas.'],
          ['defaultColor', 'string', "'#000000'", 'Default stroke color for new items.'],
          ['defaultStrokeWidth', 'number', '2', 'Default stroke width in pixels.'],
          ['defaultNoteColor', 'string', "'#fef9c3'", 'Default background color for sticky notes.'],
          ['defaultFontSize', 'number', '16', 'Default font size for text annotations.'],
          ['defaultShape', 'ShapeKind', "'square'", 'Default shape primitive.'],
          ['onChange / onItemsChange', '(items: TualItem[]) => void', 'undefined', 'Immediate callback fired on every modification.'],
          ['onChangeComplete / onItemsChangeComplete', '(items, targetItem?) => void', 'undefined', 'Completion callback fired when editing finishes.'],
          ['onEditEnd / onEditComplete', '(items, targetItem?) => void', 'undefined', 'Aliases for onChangeComplete.'],
          ['onItemSelect', '(item: TualItem | null) => void', 'undefined', 'Callback fired when an item is selected or deselected.'],
          ['onItemCreate', '(item: TualItem) => void', 'undefined', 'Callback fired when a new item is created.'],
          ['onItemChange', '(item: TualItem) => void', 'undefined', 'Callback fired on intermediate modification.'],
          ['onItemChangeComplete', '(item: TualItem) => void', 'undefined', 'Callback fired when an item completes editing.'],
          ['onItemDelete', '(id: string) => void', 'undefined', 'Callback fired when an item is removed.'],
          ['onToolChange', '(tool: TualTool) => void', 'undefined', 'Callback fired when active tool changes.'],
        ]}
      />

      <DocHeading level={3} id="controller-api">
        4. LeafletTualController API
      </DocHeading>

      <DocTable
        headers={['Property / Method', 'Type / Signature', 'Description']}
        rows={[
          ['items', 'TualItem[]', 'Array of all current canvas annotations.'],
          ['activeTool', 'TualTool', 'Currently active tool.'],
          ['readOnly', 'boolean', 'Current presentation read-only state.'],
          ['activeShape', 'ShapeKind', 'Active shape primitive.'],
          ['shapeFilled', 'boolean', 'Whether fill is enabled on active/selected shape.'],
          ['selectedId', 'string | null', 'ID of the selected item, or null.'],
          ['selectedItem', 'TualItem | null', 'The selected item object, or null.'],
          ['activeColor', 'string', 'Active stroke color hex.'],
          ['strokeWidth', 'number', 'Active stroke width in pixels.'],
          ['dashed', 'boolean', 'Whether dashed line styling is active.'],
          ['noteColor', 'string', 'Active sticky note background color.'],
          ['fontSize', 'number', 'Active text annotation font size.'],
          ['fontWeight', "'normal' | 'bold'", 'Active text annotation font weight.'],
          ['canUndo', 'boolean', 'True if undo is available in uncontrolled mode.'],
          ['canRedo', 'boolean', 'True if redo is available in uncontrolled mode.'],
          ['setActiveTool / setTool', '(tool: TualTool) => void', 'Switches the active tool.'],
          ['setReadOnly', '(readOnly: boolean) => void', 'Toggles presentation mode dynamically.'],
          ['setActiveShape', '(shape: ShapeKind) => void', 'Changes the active shape kind.'],
          ['setShapeFilled', '(filled: boolean) => void', 'Toggles fill on active/selected shape.'],
          ['setSelectedId / selectItem', '(id: string | null) => void', 'Sets or clears the selected item.'],
          ['setActiveColor', '(color: string) => void', 'Sets the active stroke color.'],
          ['setStrokeWidth', '(width: number) => void', 'Sets the active stroke width.'],
          ['setDashed', '(dashed: boolean) => void', 'Toggles dashed stroke styling.'],
          ['setNoteColor', '(color: string) => void', 'Sets sticky note background color.'],
          ['setFontSize', '(size: number) => void', 'Sets text annotation font size.'],
          ['setFontWeight', '(weight: "normal" | "bold") => void', 'Sets text font weight.'],
          ['addItem', '(item: TualItem) => void', 'Adds a new annotation item.'],
          ['updateItem', '(id: string, patch: Partial<TualItem>) => void', 'Updates attributes of an existing item.'],
          ['removeItem / deleteItem', '(id: string) => void', 'Removes an item by its ID.'],
          ['deleteSelected', '() => void', 'Deletes the currently selected item.'],
          ['clearAll / clear', '() => void', 'Removes all annotations from the canvas.'],
          ['undo / redo', '() => void', 'Reverts or reapplies history snapshots.'],
          ['notifyChangeComplete', '(targetItem?) => void', 'Triggers onChangeComplete manually.'],
          ['exportJSON', '() => string', 'Exports all canvas items as a JSON string.'],
          ['importJSON', '(json: string) => boolean', 'Imports items from a JSON string.'],
        ]}
      />

      <DocCallout variant="tip" title="TypeScript Strict Mode">
        leaflet-tual is written in strict TypeScript. All union types, component props, and
        controller return interfaces are fully typed with exported definitions.
      </DocCallout>
    </div>
  ),
  subsections: [
    { id: 'leaflet-tual-props', title: '1. <LeafletTual> Component Props', content: null },
    { id: 'canvas-toolbar-props', title: '2. <TualToolbar> Component Props', content: null },
    { id: 'use-leaflet-tual-options', title: '3. useLeafletTual Options', content: null },
    { id: 'controller-api', title: '4. LeafletTualController API', content: null },
  ],
}
