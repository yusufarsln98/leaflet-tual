export interface TranslationTokens {
  // Tools
  select: string
  text: string
  note: string
  draw: string
  freedraw: string
  pen: string
  arrow: string
  shape: string
  ruler: string
  undo: string
  redo: string

  // Toolbar Chrome & Actions
  zoomLevel: string
  zoomIn: string
  zoomOut: string
  fitSelection: string
  toggleSidebar: string

  // Sidebar
  properties: string
  closeSidebar: string
  nothingSelected: string
  clickElementToEdit: string
  fillAndStroke: string
  stroke: string
  thickness: string
  opacity: string
  typography: string
  confirmDelete: string
  cancel: string

  // Pages
  page: string
  pageSwitcher: string
  pageOptions: string
  newPage: string
  rename: string
  delete: string
  pageDefault: string

  // Popover headers
  arrowStyle: string
  shapeType: string

  // Arrow & Shape variants
  linear: string
  curved: string
  elbow: string
  sCurve: string
  square: string
  circle: string
  star: string
  actor: string
  triangle: string
  diamond: string
  hexagon: string
  marker: string

  // Styling & Secondary tooltip
  color: string
  textColor: string
  backgroundColor: string
  colors: string
  strokeWidth: string
  strokeDash: string
  borderStyle: string
  borderColor: string
  borderAndStroke: string
  cornerRadius: string
  noBorder: string
  fill: string
  noFill: string
  none: string
  tint: string
  solid: string
  dashed: string
  dotted: string
  fontSize: string
  fontWeight: string
  fontSizePx: string
  weight: string
  align: string
  textAlignment: string
  left: string
  center: string
  right: string
  textSizeAndStyle: string
  theme: string
  custom: string
  heading1: string
  heading2: string
  body: string
  caption: string
  regular: string
  medium: string
  semibold: string
  bold: string
  black: string
  normal: string
  italic: string
  underline: string
  bulletedList: string
  thin: string
  thick: string
  labelPosition: string
  top: string
  bottom: string
  moreOptions: string
  fitInView: string
  close: string

  // Palette colors
  ink: string
  gray: string
  taupe: string
  red: string
  orange: string
  yellow: string
  green: string
  blue: string
  purple: string
  pink: string

  // Placeholders
  placeholderNote: string
  placeholderText: string
  addLabel: string

  // Units
  m: string
  km: string
  ft: string
  mi: string

  // Allow custom tokens
  [key: string]: string
}

export type TranslationToken = keyof TranslationTokens

export type Translator = (
  token: keyof TranslationTokens | (string & {}),
  params?: Record<string, string | number>,
  fallback?: string,
) => string
