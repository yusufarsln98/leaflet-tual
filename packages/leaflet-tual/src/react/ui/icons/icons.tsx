import type { ReactNode } from 'react'

export const ICONS: Record<string, (size?: number) => ReactNode> = {
  // Shared icons
  cursor: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.28"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.05 4.31 Q5.04 1.44 7.13 3.41 L11.47 7.5 Q12.48 8.45 11.15 8.86 L10.11 9.19 Q9.82 9.28 9.95 9.55 L11.07 11.88 Q11.28 12.33 10.87 12.59 L9.96 13.2 Q9.13 13.75 8.71 12.85 L7.66 10.61 Q7.47 10.2 7.05 10.38 L6.27 10.71 Q5.07 11.23 5.07 9.92Z" />
    </svg>
  ),
  select: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.28"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.05 4.31 Q5.04 1.44 7.13 3.41 L11.47 7.5 Q12.48 8.45 11.15 8.86 L10.11 9.19 Q9.82 9.28 9.95 9.55 L11.07 11.88 Q11.28 12.33 10.87 12.59 L9.96 13.2 Q9.13 13.75 8.71 12.85 L7.66 10.61 Q7.47 10.2 7.05 10.38 L6.27 10.71 Q5.07 11.23 5.07 9.92Z" />
    </svg>
  ),
  text: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.19"
      strokeLinecap="butt"
      strokeLinejoin="miter"
    >
      <path d="M3.39 3.55 H13.27 M8.39 3.55 V13.95" />
    </svg>
  ),
  'frame-grid': () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.19"
      strokeLinecap="butt"
      strokeLinejoin="miter"
    >
      <path d="M2.07 5.55 H13.77 M2.07 10.45 H13.77 M5.54 2.09 V13.91 M10.24 2.09 V13.91" />
    </svg>
  ),
  'sticky-note': () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.17"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.42 3.04 H11.3 Q13.73 3.04 13.73 5.47 V6.72 C13.73 11.24 9.81 13.94 6.35 13.94 H5.42 Q2.99 13.94 2.99 11.51 V5.47 Q2.99 3.04 5.42 3.04Z" />
      <path d="M8.38 13.64 V10.58 Q8.38 8.48 10.47 8.48 H13.52" />
    </svg>
  ),
  note: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.17"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.42 3.04 H11.3 Q13.73 3.04 13.73 5.47 V6.72 C13.73 11.24 9.81 13.94 6.35 13.94 H5.42 Q2.99 13.94 2.99 11.51 V5.47 Q2.99 3.04 5.42 3.04Z" />
      <path d="M8.38 13.64 V10.58 Q8.38 8.48 10.47 8.48 H13.52" />
    </svg>
  ),
  pencil: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.19"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.28 13.32 Q2.3 13.64 2.59 12.66 L3.4 9.89 Q3.49 9.61 3.69 9.4 L9.85 3.22 Q11.27 1.8 12.49 3.39 L13 4.05 Q13.71 4.99 12.88 5.82 L6.49 12.23 Q6.43 12.29 6.35 12.31Z" />
    </svg>
  ),
  pen: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 14.1 L4.3 9.3 Q3.95 8.8 4.1 8.35 L5.2 3.95 Q5.35 3.4 5.9 3.4 H10.1 Q10.65 3.4 10.8 3.95 L11.9 8.35 Q12.05 8.8 11.7 9.3Z" />
      <circle cx="8" cy="7.5" r="1.15" />
      <path d="M8 8.65 V14.1" />
    </svg>
  ),
  'arrow-linear': () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.22"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M2.7 8 H13.3 M9.5 4.3 L13.3 8 L9.5 11.7" />
    </svg>
  ),
  linear: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.22"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M2.7 8 H13.3 M9.5 4.3 L13.3 8 L9.5 11.7" />
    </svg>
  ),
  arrow: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.22"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M2.7 8 H13.3 M9.5 4.3 L13.3 8 L9.5 11.7" />
    </svg>
  ),
  'arrow-curved': () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.22"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M3 13.2 Q3.1 4.6 12.8 4.6 M10.3 2.2 L12.8 4.6 L10.3 7" />
    </svg>
  ),
  curved: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.22"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M3 13.2 Q3.1 4.6 12.8 4.6 M10.3 2.2 L12.8 4.6 L10.3 7" />
    </svg>
  ),
  'arrow-elbow': () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.22"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M3 13.2 V6.3 Q3 4.6 4.7 4.6 H13 M10.6 2.2 L13 4.6 L10.6 7" />
    </svg>
  ),
  elbow: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.22"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M3 13.2 V6.3 Q3 4.6 4.7 4.6 H13 M10.6 2.2 L13 4.6 L10.6 7" />
    </svg>
  ),
  'arrow-s-curve': () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.22"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M2.8 11.4 C6.2 11.4 6.4 4.6 9.8 4.6 H13 M10.6 2.2 L13 4.6 L10.6 7" />
    </svg>
  ),
  's-curve': () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.22"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M2.8 11.4 C6.2 11.4 6.4 4.6 9.8 4.6 H13 M10.6 2.2 L13 4.6 L10.6 7" />
    </svg>
  ),
  'shape-square': () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.26"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <rect x="2.13" y="2.13" width="11.73" height="11.75" rx="1.3" />
    </svg>
  ),
  square: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.26"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <rect x="2.13" y="2.13" width="11.73" height="11.75" rx="1.3" />
    </svg>
  ),
  shape: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.26"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <rect x="2.13" y="2.13" width="11.73" height="11.75" rx="1.3" />
    </svg>
  ),
  'shape-circle': () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.26"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <circle cx="8" cy="8" r="5.9" />
    </svg>
  ),
  circle: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.26"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <circle cx="8" cy="8" r="5.9" />
    </svg>
  ),
  'shape-star': () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.22"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M8 2.3 L9.59 6.32 L13.9 6.58 L10.57 9.33 L11.64 13.52 L8 11.2 L4.36 13.52 L5.43 9.33 L2.1 6.58 L6.41 6.32Z" />
    </svg>
  ),
  star: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.22"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M8 2.3 L9.59 6.32 L13.9 6.58 L10.57 9.33 L11.64 13.52 L8 11.2 L4.36 13.52 L5.43 9.33 L2.1 6.58 L6.41 6.32Z" />
    </svg>
  ),
  'shape-actor': () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <circle cx="8" cy="3.9" r="1.75" />
      <path d="M8 5.65 V9.4 M4.2 7.3 H11.8 M8 9.4 L5.3 13.6 M8 9.4 L10.7 13.6" />
    </svg>
  ),
  actor: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <circle cx="8" cy="3.9" r="1.75" />
      <path d="M8 5.65 V9.4 M4.2 7.3 H11.8 M8 9.4 L5.3 13.6 M8 9.4 L10.7 13.6" />
    </svg>
  ),
  'shape-triangle': () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.24"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M7.2 3.4 Q8 2.2 8.8 3.4 L13.5 11.6 Q14.1 12.9 12.7 12.9 H3.3 Q1.9 12.9 2.5 11.6Z" />
    </svg>
  ),
  triangle: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.24"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M7.2 3.4 Q8 2.2 8.8 3.4 L13.5 11.6 Q14.1 12.9 12.7 12.9 H3.3 Q1.9 12.9 2.5 11.6Z" />
    </svg>
  ),
  'shape-diamond': () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.24"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M7.3 2.6 Q8 1.9 8.7 2.6 L13.4 7.3 Q14.1 8 13.4 8.7 L8.7 13.4 Q8 14.1 7.3 13.4 L2.6 8.7 Q1.9 8 2.6 7.3Z" />
    </svg>
  ),
  diamond: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.24"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M7.3 2.6 Q8 1.9 8.7 2.6 L13.4 7.3 Q14.1 8 13.4 8.7 L8.7 13.4 Q8 14.1 7.3 13.4 L2.6 8.7 Q1.9 8 2.6 7.3Z" />
    </svg>
  ),
  'shape-hexagon': () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.24"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M7.2 2.5 Q8 2.1 8.8 2.5 L12.4 4.6 Q13.2 5 13.2 5.9 V10.1 Q13.2 11 12.4 11.4 L8.8 13.5 Q8 13.9 7.2 13.5 L3.6 11.4 Q2.8 11 2.8 10.1 V5.9 Q2.8 5 3.6 4.6Z" />
    </svg>
  ),
  hexagon: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.24"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M7.2 2.5 Q8 2.1 8.8 2.5 L12.4 4.6 Q13.2 5 13.2 5.9 V10.1 Q13.2 11 12.4 11.4 L8.8 13.5 Q8 13.9 7.2 13.5 L3.6 11.4 Q2.8 11 2.8 10.1 V5.9 Q2.8 5 3.6 4.6Z" />
    </svg>
  ),
  'map-marker': () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.22"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M8 14.1 C8 14.1 3.2 10 3.2 6.6 A4.8 4.8 0 0 1 12.8 6.6 C12.8 10 8 14.1 8 14.1Z" />
      <circle cx="8" cy="6.6" r="1.7" />
    </svg>
  ),
  marker: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.22"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d="M8 14.1 C8 14.1 3.2 10 3.2 6.6 A4.8 4.8 0 0 1 12.8 6.6 C12.8 10 8 14.1 8 14.1Z" />
      <circle cx="8" cy="6.6" r="1.7" />
    </svg>
  ),
  'chevron-down-sm': (size = 16) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.31"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.02 6.98 L7.99 9.05 L9.98 6.98" opacity={0.5} />
    </svg>
  ),
  chevronDownSm: (size = 16) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.31"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.02 6.98 L7.99 9.05 L9.98 6.98" opacity={0.5} />
    </svg>
  ),
  chevronDown: (size = 14) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),

  // Existing UI & action icons
  ruler: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2" />
      <path d="m11.5 9.5 2-2" />
      <path d="m8.5 6.5 2-2" />
      <path d="m17.5 15.5 2-2" />
    </svg>
  ),
  undo: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  ),
  redo: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
    </svg>
  ),
  chevronLeft: (size = 14) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  chevronRight: (size = 14) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  chevronUp: (size = 14) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  ),
  chevronsLeft: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m11 17-5-5 5-5" />
      <path d="m18 17-5-5 5-5" />
    </svg>
  ),
  chevronsRight: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 17 5-5-5-5" />
      <path d="m13 17 5-5-5-5" />
    </svg>
  ),
  chevronsUp: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m17 11-5-5-5 5" />
      <path d="m17 18-5-5-5 5" />
    </svg>
  ),
  chevronsDown: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7 6 5 5 5-5" />
      <path d="m7 13 5 5 5-5" />
    </svg>
  ),
  check: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2563eb"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  more: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
    </svg>
  ),
  plus: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  radius: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20V11a7 7 0 0 1 7-7h9" />
    </svg>
  ),
  dash: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" strokeDasharray="3 3" />
    </svg>
  ),
  alignLeft: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="21" x2="3" y1="6" y2="6" />
      <line x1="15" x2="3" y1="12" y2="12" />
      <line x1="17" x2="3" y1="18" y2="18" />
    </svg>
  ),
  alignCenter: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="21" x2="3" y1="6" y2="6" />
      <line x1="17" x2="7" y1="12" y2="12" />
      <line x1="19" x2="5" y1="18" y2="18" />
    </svg>
  ),
  alignRight: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="21" x2="3" y1="6" y2="6" />
      <line x1="21" x2="9" y1="12" y2="12" />
      <line x1="21" x2="7" y1="18" y2="18" />
    </svg>
  ),
  bold: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 12h9a4 4 0 0 1 0 8H6v-8Zm0 0V4h8a4 4 0 0 1 0 8H6Z" />
    </svg>
  ),
  italic: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" x2="10" y1="4" y2="4" />
      <line x1="14" x2="5" y1="20" y2="20" />
      <line x1="15" x2="9" y1="4" y2="20" />
    </svg>
  ),
  underline: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
      <line x1="4" x2="20" y1="21" y2="21" />
    </svg>
  ),
  bullets: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="9" x2="21" y1="6" y2="6" />
      <line x1="9" x2="21" y1="12" y2="12" />
      <line x1="9" x2="21" y1="18" y2="18" />
      <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  moreVertical: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  ),
  trash: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
  sidebar: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.16"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1.49" y="3.04" width="12.81" height="10.92" rx="2.19" />
      <path d="M10.73 6.5 V10.25" />
    </svg>
  ),
  close: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  strokeWidth: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      <line x1="3" x2="21" y1="6" y2="6" strokeWidth="1" />
      <line x1="3" x2="21" y1="12" y2="12" strokeWidth="2.5" />
      <line x1="3" x2="21" y1="18" y2="18" strokeWidth="4" />
    </svg>
  ),

  // Label positions
  top: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="13" x="3" y="8" rx="1" />
      <path d="m15 2-3 3-3-3" />
      <rect width="7" height="13" x="14" y="8" rx="1" />
    </svg>
  ),
  center: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="6" x="5" y="16" rx="2" />
      <rect width="10" height="6" x="7" y="2" rx="2" />
      <path d="M2 12h20" />
    </svg>
  ),
  bottom: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="13" x="3" y="3" rx="1" />
      <path d="m9 22 3-3 3 3" />
      <rect width="7" height="13" x="14" y="3" rx="1" />
    </svg>
  ),

  // Context menu & z-order icons
  duplicate: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="13" height="13" x="9" y="9" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  bringToFront: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="8" x="8" y="8" rx="1.5" fill="currentColor" fillOpacity="0.18" />
      <path d="M4 10a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2" />
      <path d="M14 20a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2" />
    </svg>
  ),
  bringForward: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 15-6-6-6 6" />
      <path d="M4 5h16" />
    </svg>
  ),
  sendBackward: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
      <path d="M4 19h16" />
    </svg>
  ),
  sendToBack: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="8" x="8" y="8" rx="1.5" strokeDasharray="2 2" />
      <path d="M4 10a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2" />
      <path d="M14 20a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2" />
    </svg>
  ),
  edit: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
  lock: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  unlock: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  fitSelection: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9V5a2 2 0 0 1 2-2h4" />
      <path d="M21 15v4a2 2 0 0 1-2 2h-4" />
      <path d="M15 3h6v6" />
      <path d="m21 3-7 7" />
      <path d="M9 21H3v-6" />
      <path d="m3 21 7-7" />
    </svg>
  ),
}
