import type { ColorName } from '../../../../core/types/index.js'

export const PRESET_COLORS: { name: ColorName; light: string; dark: string }[] = [
  { name: 'ink', light: '#1F2A30', dark: '#ECEAE6' },
  { name: 'taupe', light: '#4A5560', dark: '#9CA3AF' },
  { name: 'blue', light: '#1B4CC0', dark: '#60A5FA' },
  { name: 'red', light: '#8F2323', dark: '#F87171' },
  { name: 'green', light: '#0B6B49', dark: '#34D399' },
  { name: 'purple', light: '#4A2C80', dark: '#A78BFA' },
  { name: 'gray', light: '#6B7280', dark: '#9CA3AF' },
  { name: 'orange', light: '#EA580C', dark: '#FB923C' },
  { name: 'yellow', light: '#D97706', dark: '#FBBF24' },
  { name: 'pink', light: '#DB2777', dark: '#F472B6' },
]

export interface RgbaColor {
  r: number
  g: number
  b: number
  a: number
}

export function parseColorString(
  val?: string,
  scheme: 'light' | 'dark' = 'light',
): RgbaColor {
  if (!val) return { r: 217, g: 119, b: 6, a: 1 }
  const trimmed = val.trim()

  if (trimmed.startsWith('#')) {
    let hex = trimmed.slice(1)
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16) || 0,
        g: parseInt(hex.slice(2, 4), 16) || 0,
        b: parseInt(hex.slice(4, 6), 16) || 0,
        a: 1,
      }
    }
    if (hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16) || 0,
        g: parseInt(hex.slice(2, 4), 16) || 0,
        b: parseInt(hex.slice(4, 6), 16) || 0,
        a: (parseInt(hex.slice(6, 8), 16) || 255) / 255,
      }
    }
  }

  const rgbaMatch = trimmed.match(
    /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/,
  )
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1,
    }
  }

  const preset = PRESET_COLORS.find((c) => c.name === trimmed)
  if (preset) {
    const hex = scheme === 'dark' ? preset.dark : preset.light
    return parseColorString(hex, scheme)
  }

  return { r: 217, g: 119, b: 6, a: 1 }
}

export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(1, s))
  v = Math.max(0, Math.min(1, v))
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0,
    g = 0,
    b = 0
  if (h < 60) {
    r = c
    g = x
    b = 0
  } else if (h < 120) {
    r = x
    g = c
    b = 0
  } else if (h < 180) {
    r = 0
    g = c
    b = x
  } else if (h < 240) {
    r = 0
    g = x
    b = c
  } else if (h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max

  if (d !== 0) {
    if (max === r) {
      h = (g - b) / d + (g < b ? 6 : 0)
    } else if (max === g) {
      h = (b - r) / d + 2
    } else {
      h = (r - g) / d + 4
    }
    h *= 60
  }

  return [Math.round(h), s, v]
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
