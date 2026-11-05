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
  area: string
  laser: string
  measure: string
  measureStyle: string
  undo: string
  redo: string

  // Toolbar Chrome & Actions
  fitSelection: string

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
  colors: string
  strokeWidth: string
  borderColor: string
  borderAndStroke: string
  cornerRadius: string
  noBorder: string
  noFill: string
  none: string
  solid: string
  dashed: string
  dotted: string
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
  regular: string
  medium: string
  semibold: string
  bold: string
  black: string
  normal: string
  italic: string
  underline: string
  bulletedList: string
  sizeSmall: string
  sizeMedium: string
  sizeLarge: string
  sizeExtraLarge: string
  sizeHuge: string
  labelPosition: string
  top: string
  bottom: string
  moreOptions: string
  fitInView: string
  close: string

  // Context menu & z-order
  duplicate: string
  bringToFront: string
  bringForward: string
  sendBackward: string
  sendToBack: string
  editLabel: string
  lock: string
  unlock: string

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

  // Placeholders & Accessibility
  placeholderNote: string
  placeholderText: string
  addLabel: string
  hexColor: string
  opacityPercentage: string
  increment: string
  decrement: string

  // Units
  m: string
  km: string
  ft: string
  mi: string
  sqM: string
  sqKm: string
  sqFt: string
  sqMi: string
  ac: string
  ha: string

  // Allow custom tokens
  [key: string]: string
}

export type TranslationToken = keyof TranslationTokens

export type Translator = (
  token: keyof TranslationTokens | (string & {}),
  params?: Record<string, string | number>,
  fallback?: string,
) => string
