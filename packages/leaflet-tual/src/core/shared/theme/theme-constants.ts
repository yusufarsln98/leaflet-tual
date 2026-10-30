import type { ColorName, Style } from '../../types/items.js'

export const DEFAULT_PALETTE: Record<ColorName, string> = {
  ink: '#1D1D1B',
  gray: '#8A857E',
  taupe: '#B5ADA3',
  red: '#E5484D',
  orange: '#F76B15',
  yellow: '#F5C518',
  green: '#30A46C',
  blue: '#2F6FEB',
  purple: '#8E4EC6',
  pink: '#D6409F',
}

export const NOTE_SURFACES: Record<ColorName, { bg: string; text: string; border: string }> = {
  yellow: { bg: '#FFF1A1', text: '#4A4020', border: '#EAD67A' },
  blue: { bg: '#DBEAFE', text: '#1E3A8A', border: '#BFDBFE' },
  green: { bg: '#D1FAE5', text: '#064E3B', border: '#A7F3D0' },
  red: { bg: '#FEE2E2', text: '#7F1D1D', border: '#FECACA' },
  orange: { bg: '#FFEDD5', text: '#7C2D12', border: '#FED7AA' },
  purple: { bg: '#F3E8FF', text: '#581C87', border: '#E9D5FF' },
  pink: { bg: '#FCE7F3', text: '#831843', border: '#FBCFE8' },
  taupe: { bg: '#EFECE6', text: '#3E3A35', border: '#DDD8CE' },
  gray: { bg: '#F1F0EE', text: '#383531', border: '#E0DFDC' },
  ink: { bg: '#E5E4E2', text: '#1D1D1B', border: '#C8C7C5' },
}

export const DEFAULT_TOOL_STYLES: Record<string, Style> = {
  freedraw: { color: 'ink', width: 'm', dash: 'solid' },
  pen: { color: 'ink', width: 'm', dash: 'solid' },
  arrow: { color: 'blue', width: 'm', dash: 'solid' },
  ruler: { color: 'ink', width: 'm', dash: 'solid' },
  shape: { color: 'blue', fill: 'tint', width: 'm', dash: 'solid', size: 's', radius: 8 },
  note: { color: 'yellow', fill: 'solid', width: 's', dash: 'solid', size: 'm', radius: 8 },
  text: { color: 'ink', size: 'm' },
}
