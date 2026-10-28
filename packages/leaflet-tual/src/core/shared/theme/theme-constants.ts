import type { ColorName, Style } from '../../types/items.js'
import type { Scheme } from '../../types/theme.js'

export const DEFAULT_PALETTE: Record<ColorName, { light: string; dark: string }> = {
  ink: { light: '#1D1D1B', dark: '#F2F0EC' },
  gray: { light: '#8A857E', dark: '#A8A39B' },
  taupe: { light: '#B5ADA3', dark: '#8F877D' },
  red: { light: '#E5484D', dark: '#FF6369' },
  orange: { light: '#F76B15', dark: '#FF8B3E' },
  yellow: { light: '#F5C518', dark: '#FFD43B' },
  green: { light: '#30A46C', dark: '#3DD68C' },
  blue: { light: '#2F6FEB', dark: '#6AA5FF' },
  purple: { light: '#8E4EC6', dark: '#BF7AF0' },
  pink: { light: '#D6409F', dark: '#F76BC6' },
}

export const DEFAULT_SCHEME: { light: Scheme; dark: Scheme } = {
  light: {
    surface: '#FFFFFF',
    surfaceHover: '#F4F4F5',
    border: '#E4E4E7',
    text: '#18181B',
    muted: '#71717A',
    activeBg: '#DBEAFE',
    activeFg: '#2563EB',
    shadow: '0 4px 16px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
    artboardFill: '#FFFFFF',
    artboardBorder: '#E4E4E7',
    handle: '#2563EB',
  },
  dark: {
    surface: '#18181B',
    surfaceHover: '#27272A',
    border: '#2E2E33',
    text: '#F4F4F5',
    muted: '#A1A1AA',
    activeBg: '#1E3A8A',
    activeFg: '#60A5FA',
    shadow: '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
    artboardFill: '#27272A',
    artboardBorder: '#3F3F46',
    handle: '#60A5FA',
  },
}

export const NOTE_SURFACES: Record<
  ColorName,
  {
    light: { bg: string; text: string; border: string }
    dark: { bg: string; text: string; border: string }
  }
> = {
  yellow: {
    light: { bg: '#FFF1A1', text: '#4A4020', border: '#EAD67A' },
    dark: { bg: '#3D3516', text: '#FFD43B', border: '#5C5020' },
  },
  blue: {
    light: { bg: '#DBEAFE', text: '#1E3A8A', border: '#BFDBFE' },
    dark: { bg: '#1E293B', text: '#93C5FD', border: '#334155' },
  },
  green: {
    light: { bg: '#D1FAE5', text: '#064E3B', border: '#A7F3D0' },
    dark: { bg: '#132E22', text: '#6EE7B7', border: '#1C4A36' },
  },
  red: {
    light: { bg: '#FEE2E2', text: '#7F1D1D', border: '#FECACA' },
    dark: { bg: '#3B181A', text: '#FCA5A5', border: '#5C2427' },
  },
  orange: {
    light: { bg: '#FFEDD5', text: '#7C2D12', border: '#FED7AA' },
    dark: { bg: '#3B2313', text: '#FDBA74', border: '#5A341B' },
  },
  purple: {
    light: { bg: '#F3E8FF', text: '#581C87', border: '#E9D5FF' },
    dark: { bg: '#2D1B3E', text: '#D8B4FE', border: '#4A2A68' },
  },
  pink: {
    light: { bg: '#FCE7F3', text: '#831843', border: '#FBCFE8' },
    dark: { bg: '#381628', text: '#F9A8D4', border: '#59223F' },
  },
  taupe: {
    light: { bg: '#EFECE6', text: '#3E3A35', border: '#DDD8CE' },
    dark: { bg: '#2B2824', text: '#D4CEBF', border: '#3F3B35' },
  },
  gray: {
    light: { bg: '#F1F0EE', text: '#383531', border: '#E0DFDC' },
    dark: { bg: '#262523', text: '#D6D3CD', border: '#3A3937' },
  },
  ink: {
    light: { bg: '#E5E4E2', text: '#1D1D1B', border: '#C8C7C5' },
    dark: { bg: '#242322', text: '#F2F0EC', border: '#3A3937' },
  },
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

