import type React from 'react'
import type { ToolbarPosition, ToolbarToolGroupId } from '../../types/index.js'

export const DEFAULT_ENABLED_TOOLS: readonly ToolbarToolGroupId[] = [
  'select',
  'freedraw',
  'arrow',
  'shape',
  'ruler',
  'note',
  'text',
]

export const POSITION_STYLES: Record<ToolbarPosition, React.CSSProperties> = {
  top: {
    top: '14px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  bottom: {
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  left: {
    top: '50%',
    left: '14px',
    transform: 'translateY(-50%)',
  },
  right: {
    top: '50%',
    right: '14px',
    transform: 'translateY(-50%)',
  },
  'top-center': {
    top: '14px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  'bottom-center': {
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  'left-center': {
    top: '50%',
    left: '14px',
    transform: 'translateY(-50%)',
  },
  'right-center': {
    top: '50%',
    right: '14px',
    transform: 'translateY(-50%)',
  },
}
