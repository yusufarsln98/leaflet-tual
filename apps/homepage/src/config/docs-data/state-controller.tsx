import {
  DocParagraph,
  DocCode,
  DocHeading,
  DocTable,
  DocCallout,
  Checklist,
} from '../../components/docs-elements'
import { DocSection } from '../docs-data'

export const stateControllerSection: DocSection = {
  id: 'state-controller',
  title: 'useLeafletTual Controller',
  category: 'advanced',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          State management in <strong className="text-text-primary font-semibold">leaflet-tual</strong>{' '}
          is handled by the decoupled <DocCode highlight>useLeafletTual</DocCode> hook. It supports
          both uncontrolled operation (with a completion-driven undo/redo history stack) and fully
          controlled operation for enterprise state containers (Redux, Zustand, React Query).
        </DocParagraph>
      </div>

      <DocHeading level={3} id="hook-options">
        1. Hook Initialization Options (UseLeafletTualOptions)
      </DocHeading>

      <DocTable
        headers={['Option', 'Type', 'Default', 'Description']}
        rows={[
          ['initialItems', 'CanvasItem[]', '[]', 'Initial array of items to load onto the canvas (uncontrolled mode).'],
          ['items', 'CanvasItem[]', 'undefined', 'Controlled array of canvas items. When provided, component operates in controlled mode.'],
          ['maxHistory', 'number', '50', 'Maximum undo/redo stack depth in uncontrolled mode.'],
          ['initialTool', 'CanvasTool', "'select'", 'Active drawing tool when the canvas mounts.'],
          ['readOnly', 'boolean', 'false', 'Disables drawing interactions, hides selection handles, and sets toolbar to read-only presentation mode.'],
          ['interactive', 'boolean', 'true', 'Whether canvas surface responds to pointer drag and click interactions.'],
          ['defaultColor', 'string', "'#000000'", 'Default stroke color for new arrows, shapes, and freehand sketches.'],
          ['defaultStrokeWidth', 'number', '2', 'Default stroke width in pixels for new vector items.'],
          ['defaultNoteColor', 'string', "'#fef9c3'", 'Default background color for new sticky notes.'],
          ['defaultFontSize', 'number', '16', 'Default font size in pixels for text annotations.'],
          ['defaultShape', 'ShapeKind', "'square'", 'Default shape kind selected in the toolbar.'],
          ['onChange / onItemsChange', '(items: CanvasItem[]) => void', 'undefined', 'Immediate callback triggered on every interaction tick, drag move, or property change.'],
          ['onChangeComplete / onItemsChangeComplete', '(items: CanvasItem[], targetItem?: CanvasItem | null) => void', 'undefined', 'Completion callback triggered when editing finishes (deselect, blur, outside click activating select mode, Escape).'],
          ['onEditEnd / onEditComplete', '(items: CanvasItem[], targetItem?: CanvasItem | null) => void', 'undefined', 'Aliases for onChangeComplete.'],
          ['onItemSelect', '(item: CanvasItem | null) => void', 'undefined', 'Fired when selection changes to a specific item or is cleared.'],
          ['onItemCreate', '(item: CanvasItem) => void', 'undefined', 'Fired when a new item is created on the canvas.'],
          ['onItemChange', '(item: CanvasItem) => void', 'undefined', 'Fired on every intermediate modification of an existing item.'],
          ['onItemChangeComplete', '(item: CanvasItem) => void', 'undefined', 'Fired when an item finishes its editing cycle.'],
          ['onItemDelete', '(id: string) => void', 'undefined', 'Fired when an item is removed from the canvas.'],
          ['onToolChange', '(tool: CanvasTool) => void', 'undefined', 'Fired when the active drawing tool changes.'],
        ]}
      />

      <DocHeading level={3} id="controller-state">
        2. Controller State Properties
      </DocHeading>

      <DocParagraph>
        The controller object returned by <DocCode highlight>useLeafletTual()</DocCode> exposes the
        following reactive state properties:
      </DocParagraph>

      <DocTable
        headers={['Property', 'Type', 'Description']}
        rows={[
          ['items', 'CanvasItem[]', 'Array of all current canvas annotations.'],
          ['activeTool', 'CanvasTool', 'Currently active tool (e.g. "select", "arrow-curved", "shape", "note", "text", "freedraw").'],
          ['readOnly', 'boolean', 'Whether the canvas is in presentation read-only mode.'],
          ['activeShape', 'ShapeKind', 'Currently selected shape kind for the shape tool ("square", "circle", "star", etc.).'],
          ['shapeFilled', 'boolean', 'Whether new or selected shapes have their fill enabled.'],
          ['selectedId', 'string | null', 'ID of the currently selected canvas item, or null if none.'],
          ['selectedItem', 'CanvasItem | null', 'The currently selected CanvasItem object, or null if none.'],
          ['activeColor', 'string', 'Currently active stroke color hex code.'],
          ['strokeWidth', 'number', 'Currently active stroke width in pixels.'],
          ['dashed', 'boolean', 'Whether dashed stroke style is active.'],
          ['noteColor', 'string', 'Currently active sticky note background color.'],
          ['fontSize', 'number', 'Currently active text overlay font size.'],
          ['fontWeight', "'normal' | 'bold'", 'Currently active text overlay font weight.'],
          ['canUndo', 'boolean', 'True if there are earlier snapshots in the undo history stack.'],
          ['canRedo', 'boolean', 'True if there are reverted snapshots available to redo.'],
        ]}
      />

      <DocHeading level={3} id="controller-methods">
        3. Controller Methods
      </DocHeading>

      <DocTable
        headers={['Method', 'Signature', 'Description']}
        rows={[
          ['setActiveTool / setTool', '(tool: CanvasTool) => void', 'Changes the active drawing tool.'],
          ['setReadOnly', '(readOnly: boolean) => void', 'Dynamically toggles presentation read-only mode.'],
          ['setActiveShape', '(shape: ShapeKind) => void', 'Sets the shape primitive to draw when the shape tool is used.'],
          ['setShapeFilled', '(filled: boolean) => void', 'Toggles filled styling for the active shape and currently selected shape.'],
          ['setSelectedId / selectItem', '(id: string | null) => void', 'Selects an item by ID or clears selection with null.'],
          ['setActiveColor', '(color: string) => void', 'Sets the active stroke color and updates the currently selected item.'],
          ['setStrokeWidth', '(width: number) => void', 'Sets the active stroke width and updates the currently selected item.'],
          ['setDashed', '(dashed: boolean) => void', 'Toggles dashed stroke styling for active and selected items.'],
          ['setNoteColor', '(color: string) => void', 'Sets the background color for new and selected sticky notes.'],
          ['setFontSize', '(size: number) => void', 'Sets the font size for text annotations.'],
          ['setFontWeight', '(weight: "normal" | "bold") => void', 'Sets the font weight for text annotations.'],
          ['addItem', '(item: CanvasItem) => void', 'Appends a new annotation item to the canvas.'],
          ['updateItem', '(id: string, patch: Partial<CanvasItem>) => void', 'Applies partial attribute updates to an existing item.'],
          ['removeItem / deleteItem', '(id: string) => void', 'Removes an annotation by its ID.'],
          ['deleteSelected', '() => void', 'Deletes the currently selected item, if any.'],
          ['clearAll / clear', '() => void', 'Removes all annotations from the canvas.'],
          ['undo', '() => void', 'Reverts to the previous finalized edit snapshot.'],
          ['redo', '() => void', 'Reapplies the previously reverted history snapshot.'],
          ['notifyChangeComplete', '(targetItem?: CanvasItem | null) => void', 'Manually triggers the onChangeComplete lifecycle callback.'],
          ['exportJSON', '() => string', 'Serializes all current canvas items to a JSON string.'],
          ['importJSON', '(json: string) => boolean', 'Parses and loads items from a JSON string, returning true if successful.'],
        ]}
      />

      <DocHeading level={3} id="history-architecture">
        4. Completion-Driven History Architecture
      </DocHeading>

      <DocParagraph>
        Unlike naive implementations that record a history snapshot on every mouse move tick, leaflet-tual
        uses a <strong>completion-driven</strong> undo/redo architecture:
      </DocParagraph>

      <Checklist
        items={[
          {
            title: 'Granular Edit Sessions',
            desc: 'Drawing a shape, dragging an arrow handle, or tweaking a color swatch creates continuous updates, but collapses into exactly one clean undo step upon completion.',
          },
          {
            title: 'Automatic Triggers',
            desc: 'A completion snapshot is automatically saved when: pointer is released, selection changes, user clicks outside activating Select mode, or blurs an input.',
          },
          {
            title: 'Disabled State Feedback',
            desc: 'Undo and redo buttons in the toolbar automatically reflect canUndo and canRedo with dimmed opacity (0.45) and disabled cursors.',
          },
        ]}
      />

      <DocCallout variant="tip" title="External Toolbar Connection">
        You can pass the <DocCode highlight>controller</DocCode> instance directly into an external{' '}
        <DocCode highlight>&lt;CanvasToolbar controller={'{controller}'} /&gt;</DocCode> positioned
        anywhere in your application tree (e.g. inside an application navigation bar or floating dock).
      </DocCallout>
    </div>
  ),
  subsections: [
    { id: 'hook-options', title: '1. Hook Initialization Options', content: null },
    { id: 'controller-state', title: '2. Controller State Properties', content: null },
    { id: 'controller-methods', title: '3. Controller Methods', content: null },
    { id: 'history-architecture', title: '4. Completion-Driven History Architecture', content: null },
  ],
}
