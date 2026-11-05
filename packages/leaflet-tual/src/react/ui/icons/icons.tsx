import type { ReactNode } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  BringToFront,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Copy,
  CornerUpRight,
  Diamond,
  Expand,
  Fullscreen,
  Hexagon,
  Laser,
  Layers2,
  LineStyle,
  List,
  Lock,
  MapPin,
  MoreHorizontal,
  MousePointer2,
  MoveRight,
  PenTool,
  Pencil,
  PencilLine,
  PersonStanding,
  Plus,
  SquareRoundCorner,
  Redo,
  Redo2,
  Ruler,
  SendToBack,
  SlidersHorizontal,
  Square,
  SquareDashed,
  SquareMinus,
  SquarePaddingBottom,
  SquarePaddingTop,
  VectorPolygon,
  Star,
  StickyNote,
  Trash2,
  Triangle,
  Type,
  Underline,
  Undo2,
  Unlock,
  X,
  type LucideIcon,
} from 'lucide-react'

type IconFactory = (size?: number) => ReactNode

function icon(Component: LucideIcon, defaultSize = 16, strokeWidth = 1.7): IconFactory {
  return (size = defaultSize) => (
    <Component size={size} strokeWidth={strokeWidth} aria-hidden="true" />
  )
}

/**
 * Shared icon map. Every icon is imported by name from lucide-react so bundlers
 * only pull the icons actually referenced here, never the whole Lucide set.
 */
export const ICONS = {
  // Tools
  select: icon(MousePointer2),
  text: icon(Type),
  note: icon(StickyNote),
  pencil: icon(Pencil),
  pen: icon(PenTool),
  arrow: icon(MoveRight),
  shape: icon(Square),
  ruler: icon(Ruler),
  area: icon(VectorPolygon),
  laser: icon(Laser),

  // Arrow variants
  linear: icon(MoveRight),
  curved: icon(Redo),
  elbow: icon(CornerUpRight),

  // Shape variants
  square: icon(Square),
  circle: icon(Circle),
  star: icon(Star),
  actor: icon(PersonStanding),
  triangle: icon(Triangle),
  diamond: icon(Diamond),
  hexagon: icon(Hexagon),
  marker: icon(MapPin),

  // Navigation
  'chevron-down-sm': icon(ChevronDown),
  chevronDown: icon(ChevronDown, 14),
  chevronRight: icon(ChevronRight, 14),
  chevronUp: icon(ChevronUp, 14),

  // Actions
  check: icon(Check, 14, 2.2),
  more: icon(MoreHorizontal, 14),
  plus: icon(Plus, 14),
  close: icon(X, 15),
  trash: icon(Trash2, 14),
  duplicate: icon(Copy, 14),
  edit: icon(PencilLine, 14),

  // Style controls
  radius: icon(SquareRoundCorner, 15),
  dash: icon(SquareDashed, 15),
  lineStyle: icon(LineStyle, 15),
  strokeWidth: icon(SlidersHorizontal, 15),
  alignLeft: icon(AlignLeft, 15),
  alignCenter: icon(AlignCenter, 15),
  alignRight: icon(AlignRight, 15),
  underline: icon(Underline, 15),
  bullets: icon(List, 15),
  top: icon(SquarePaddingTop),
  center: icon(SquareMinus),
  bottom: icon(SquarePaddingBottom),

  // Layer order
  bringToFront: icon(BringToFront, 14),
  bringForward: icon(ArrowUpToLine, 14),
  sendBackward: icon(ArrowDownToLine, 14),
  sendToBack: icon(SendToBack, 14),

  // Misc
  lock: icon(Lock, 14),
  unlock: icon(Unlock, 14),
  fitSelection: icon(Expand, 14),
  fitAll: icon(Fullscreen, 16),
  undo: icon(Undo2, 16),
  redo: icon(Redo2, 16),
  page: icon(Layers2, 16),
} as const

export type IconName = keyof typeof ICONS
