'use client'

import type L from 'leaflet'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ColorName } from '../../../core/types/index.js'
import { useWheelGuard } from './use-wheel-guard.js'

export interface ColorDropdownProps {
  title?: string
  mode: 'stroke' | 'fill'
  allowCustom?: boolean
  currentColor?: string
  currentFill?: 'none' | 'tint' | 'solid'
  scheme: 'light' | 'dark'
  map?: L.Map
  onSelectColor: (color: ColorName | string, hex: string) => void
  onSelectFillMode?: (mode: 'none' | 'tint' | 'solid') => void
  onClose?: () => void
}

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

function parseColorString(
  val?: string,
  scheme: 'light' | 'dark' = 'light',
): { r: number; g: number; b: number; a: number } {
  if (!val) return { r: 217, g: 119, b: 6, a: 1 } // default warm yellow
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

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
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

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max
  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h *= 60
  }
  return [Math.round(h), s, v]
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function formatResultColor(r: number, g: number, b: number, a: number): string {
  if (a >= 0.995) {
    return rgbToHex(r, g, b)
  }
  const cleanAlpha = Math.round(a * 100) / 100
  return `rgba(${r}, ${g}, ${b}, ${cleanAlpha})`
}

export function ColorDropdown({
  mode,
  allowCustom = mode === 'fill',
  currentColor,
  currentFill = 'solid',
  scheme,
  map,
  onSelectColor,
  onSelectFillMode,
  onClose,
}: ColorDropdownProps) {
  const guardRef = useWheelGuard<HTMLDivElement>()

  const initialParsed = parseColorString(currentColor, scheme)
  const [initialH, initialS, initialV] = rgbToHsv(
    initialParsed.r,
    initialParsed.g,
    initialParsed.b,
  )

  const isCustomColor =
    Boolean(currentColor) &&
    (currentColor!.startsWith('#') || currentColor!.startsWith('rgb')) &&
    !PRESET_COLORS.some((p) => p.light === currentColor || p.dark === currentColor)

  const [activeTab, setActiveTab] = useState<'theme' | 'custom'>(
    allowCustom && isCustomColor ? 'custom' : 'theme',
  )

  const [hue, setHue] = useState(initialH)
  const [sat, setSat] = useState(initialS)
  const [val, setVal] = useState(initialV)
  const [opacity, setOpacity] = useState(initialParsed.a)
  const [hexInput, setHexInput] = useState(() =>
    rgbToHex(initialParsed.r, initialParsed.g, initialParsed.b),
  )

  const satBoxRef = useRef<HTMLDivElement>(null)
  const hueSliderRef = useRef<HTMLDivElement>(null)
  const alphaSliderRef = useRef<HTMLDivElement>(null)

  const [currentR, currentG, currentB] = hsvToRgb(hue, sat, val)

  useEffect(() => {
    setHexInput(rgbToHex(currentR, currentG, currentB))
  }, [currentR, currentG, currentB])

  useEffect(() => {
    const handleUp = () => {
      map?.dragging?.enable()
    }
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchend', handleUp)
    return () => {
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchend', handleUp)
      map?.dragging?.enable()
    }
  }, [map])

  const emitColor = useCallback(
    (h: number, s: number, v: number, a: number) => {
      const [r, g, b] = hsvToRgb(h, s, v)
      const formatted = formatResultColor(r, g, b, a)
      if (mode === 'fill' && onSelectFillMode && currentFill === 'none') {
        onSelectFillMode('solid')
      }
      onSelectColor(formatted, formatted)
    },
    [mode, onSelectFillMode, currentFill, onSelectColor],
  )

  const handleSatPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (!satBoxRef.current) return
    const rect = satBoxRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    setSat(x)
    setVal(1 - y)
    emitColor(hue, x, 1 - y, opacity)
  }

  const handleHuePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (!hueSliderRef.current) return
    const rect = hueSliderRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newHue = Math.round(x * 360)
    setHue(newHue)
    emitColor(newHue, sat, val, opacity)
  }

  const handleAlphaPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (!alphaSliderRef.current) return
    const rect = alphaSliderRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newAlpha = Math.round(x * 100) / 100
    setOpacity(newAlpha)
    emitColor(hue, sat, val, newAlpha)
  }

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setHexInput(raw)
    const clean = raw.trim()
    if (/^#?[0-9A-Fa-f]{6}$/.test(clean)) {
      const formatted = clean.startsWith('#') ? clean : `#${clean}`
      const p = parseColorString(formatted, scheme)
      const [newH, newS, newV] = rgbToHsv(p.r, p.g, p.b)
      setHue(newH)
      setSat(newS)
      setVal(newV)
      emitColor(newH, newS, newV, opacity)
    }
  }

  const handleOpacityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10)
    if (!isNaN(num)) {
      const clamped = Math.max(0, Math.min(100, num)) / 100
      setOpacity(clamped)
      emitColor(hue, sat, val, clamped)
    }
  }

  return (
    <div
      ref={guardRef}
      className={`tual-popover tual-color-popover ${allowCustom ? 'tual-color-popover-with-tabs' : ''}`}
      onPointerDown={(e) => {
        e.stopPropagation()
        map?.dragging?.disable()
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        map?.dragging?.disable()
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {allowCustom && (
        <div className="tual-color-tabs" onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="tual-color-tab"
            data-active={activeTab === 'theme'}
            onClick={() => setActiveTab('theme')}
          >
            Theme
          </button>
          <button
            type="button"
            className="tual-color-tab"
            data-active={activeTab === 'custom'}
            onClick={() => setActiveTab('custom')}
          >
            Custom
          </button>
        </div>
      )}

      {activeTab === 'theme' ? (
        <div className="tual-color-list" onPointerDown={(e) => e.stopPropagation()}>
          {mode === 'fill' && onSelectFillMode && (
            <button
              type="button"
              className="tual-color-row"
              data-active={currentFill === 'none'}
              onClick={() => {
                onSelectFillMode('none')
              }}
            >
              <div className="tual-no-fill-swatch" />
              <span className="tual-color-label">No fill</span>
              {currentFill === 'none' && <span className="tual-check">✓</span>}
            </button>
          )}

          {PRESET_COLORS.map((c) => {
            const hex = scheme === 'dark' ? c.dark : c.light
            const isSelected = currentColor === c.name || currentColor === hex
            return (
              <button
                key={c.name}
                type="button"
                className="tual-color-row"
                data-active={isSelected && (mode !== 'fill' || currentFill !== 'none')}
                onClick={() => {
                  if (mode === 'fill' && onSelectFillMode && currentFill === 'none') {
                    onSelectFillMode('solid')
                  }
                  onSelectColor(c.name, hex)
                }}
              >
                <div className="tual-color-swatch-box" style={{ backgroundColor: hex }} />
                <span className="tual-color-label">{hex.toUpperCase()}</span>
                {isSelected && (mode !== 'fill' || currentFill !== 'none') && (
                  <span className="tual-check">✓</span>
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="tual-color-custom-panel" onPointerDown={(e) => e.stopPropagation()}>
          {/* Saturation / Brightness 2D Area */}
          <div
            ref={satBoxRef}
            className="tual-color-sat-box"
            style={{
              backgroundColor: `hsl(${hue}, 100%, 50%)`,
            }}
            onPointerDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
              map?.dragging?.disable()
              try {
                e.currentTarget.setPointerCapture(e.pointerId)
              } catch {}
              handleSatPointer(e)
            }}
            onPointerMove={(e) => {
              e.stopPropagation()
              if (e.buttons > 0) handleSatPointer(e)
            }}
            onPointerUp={(e) => {
              e.stopPropagation()
              map?.dragging?.enable()
              try {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                  e.currentTarget.releasePointerCapture(e.pointerId)
                }
              } catch {}
            }}
            onPointerCancel={(e) => {
              e.stopPropagation()
              map?.dragging?.enable()
            }}
          >
            <div className="tual-color-sat-white" />
            <div className="tual-color-sat-black" />
            <div
              className="tual-color-picker-thumb"
              style={{
                left: `${Math.round(sat * 100)}%`,
                top: `${Math.round((1 - val) * 100)}%`,
              }}
            />
          </div>

          {/* Hue Rainbow Slider */}
          <div
            ref={hueSliderRef}
            className="tual-color-slider-track tual-color-hue-track"
            onPointerDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
              map?.dragging?.disable()
              try {
                e.currentTarget.setPointerCapture(e.pointerId)
              } catch {}
              handleHuePointer(e)
            }}
            onPointerMove={(e) => {
              e.stopPropagation()
              if (e.buttons > 0) handleHuePointer(e)
            }}
            onPointerUp={(e) => {
              e.stopPropagation()
              map?.dragging?.enable()
              try {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                  e.currentTarget.releasePointerCapture(e.pointerId)
                }
              } catch {}
            }}
            onPointerCancel={(e) => {
              e.stopPropagation()
              map?.dragging?.enable()
            }}
          >
            <div
              className="tual-color-slider-thumb"
              style={{
                left: `${Math.round((hue / 360) * 100)}%`,
                backgroundColor: `hsl(${hue}, 100%, 50%)`,
              }}
            />
          </div>

          {/* Opacity Checkerboard + Color Gradient Slider */}
          <div
            ref={alphaSliderRef}
            className="tual-color-slider-track tual-color-alpha-track"
            onPointerDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
              map?.dragging?.disable()
              try {
                e.currentTarget.setPointerCapture(e.pointerId)
              } catch {}
              handleAlphaPointer(e)
            }}
            onPointerMove={(e) => {
              e.stopPropagation()
              if (e.buttons > 0) handleAlphaPointer(e)
            }}
            onPointerUp={(e) => {
              e.stopPropagation()
              map?.dragging?.enable()
              try {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                  e.currentTarget.releasePointerCapture(e.pointerId)
                }
              } catch {}
            }}
            onPointerCancel={(e) => {
              e.stopPropagation()
              map?.dragging?.enable()
            }}
          >
            <div
              className="tual-color-alpha-gradient"
              style={{
                background: `linear-gradient(to right, rgba(${currentR}, ${currentG}, ${currentB}, 0), rgb(${currentR}, ${currentG}, ${currentB}))`,
              }}
            />
            <div
              className="tual-color-slider-thumb"
              style={{
                left: `${Math.round(opacity * 100)}%`,
                backgroundColor: `rgba(${currentR}, ${currentG}, ${currentB}, ${opacity})`,
              }}
            />
          </div>

          {/* Unified Hex & Opacity Input Bar */}
          <div
            className="tual-color-inputs-bar"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              className="tual-color-hex-field"
              value={hexInput}
              onChange={handleHexChange}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              aria-label="Hex color"
              placeholder="#000000"
            />
            <div className="tual-color-input-divider" />
            <div className="tual-color-opacity-field">
              <input
                type="number"
                min="0"
                max="100"
                className="tual-color-opacity-num"
                value={Math.round(opacity * 100)}
                onChange={handleOpacityInputChange}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                aria-label="Opacity percentage"
              />
              <span className="tual-color-percent-sign">%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
