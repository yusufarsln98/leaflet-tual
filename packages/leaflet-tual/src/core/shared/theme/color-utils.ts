import type { ColorName } from '../../types/index.js'

export const PRESET_COLORS: { name: ColorName; hex: string }[] = [
  { name: 'ink', hex: '#1F2A30' },
  { name: 'taupe', hex: '#4A5560' },
  { name: 'blue', hex: '#1B4CC0' },
  { name: 'red', hex: '#8F2323' },
  { name: 'green', hex: '#0B6B49' },
  { name: 'purple', hex: '#4A2C80' },
  { name: 'gray', hex: '#6B7280' },
  { name: 'orange', hex: '#EA580C' },
  { name: 'yellow', hex: '#D97706' },
  { name: 'pink', hex: '#DB2777' },
]

export interface RgbaColor {
  r: number
  g: number
  b: number
  a: number
}

export function parseColorString(val?: string): RgbaColor {
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
    return parseColorString(preset.hex)
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
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x]
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

