'use client'

import type L from 'leaflet'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  hsvToRgb,
  parseColorString,
  rgbToHex,
  rgbToHsv,
} from './color-utils.js'

export interface CustomColorPickerProps {
  currentColor?: string
  scheme: 'light' | 'dark'
  map?: L.Map
  onSelectColor: (color: string, hex: string) => void
}

export function CustomColorPicker({
  currentColor,
  scheme,
  map,
  onSelectColor,
}: CustomColorPickerProps) {
  const satBoxRef = useRef<HTMLDivElement>(null)
  const hueSliderRef = useRef<HTMLDivElement>(null)
  const alphaSliderRef = useRef<HTMLDivElement>(null)

  const parsed = parseColorString(currentColor, scheme)
  const [initialH, initialS, initialV] = rgbToHsv(parsed.r, parsed.g, parsed.b)

  const [hue, setHue] = useState(initialH)
  const [sat, setSat] = useState(initialS)
  const [val, setVal] = useState(initialV)
  const [opacity, setOpacity] = useState(parsed.a)
  const [hexInput, setHexInput] = useState(() => rgbToHex(parsed.r, parsed.g, parsed.b))

  useEffect(() => {
    const p = parseColorString(currentColor, scheme)
    const [h, s, v] = rgbToHsv(p.r, p.g, p.b)
    setHue(h)
    setSat(s)
    setVal(v)
    setOpacity(p.a)
    setHexInput(rgbToHex(p.r, p.g, p.b))
  }, [currentColor, scheme])

  const [currentR, currentG, currentB] = hsvToRgb(hue, sat, val)

  const emitColor = useCallback(
    (h: number, s: number, v: number, a: number) => {
      const [r, g, b] = hsvToRgb(h, s, v)
      const hex = rgbToHex(r, g, b)
      setHexInput(hex)
      onSelectColor(a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : hex, hex)
    },
    [onSelectColor],
  )

  const handleSatPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = satBoxRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const newSat = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newVal = 1 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    setSat(newSat); setVal(newVal)
    emitColor(hue, newSat, newVal, opacity)
  }

  const handleHuePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = hueSliderRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const newHue = Math.round(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 360) % 360
    setHue(newHue)
    emitColor(newHue, sat, val, opacity)
  }

  const handleAlphaPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = alphaSliderRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const newAlpha = Math.round(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100) / 100
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
      setHue(newH); setSat(newS); setVal(newV)
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

  const createDragHandlers = (onDrag: (e: React.PointerEvent<HTMLDivElement>) => void) => ({
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation()
      e.preventDefault()
      map?.dragging?.disable()
      try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
      onDrag(e)
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation()
      if (e.buttons > 0) onDrag(e)
    },
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation()
      map?.dragging?.enable()
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId)
        }
      } catch {}
    },
    onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation()
      map?.dragging?.enable()
    },
  })

  return (
    <div className="tual-color-custom-panel" onPointerDown={(e) => e.stopPropagation()}>
      <div
        ref={satBoxRef}
        className="tual-color-sat-box"
        style={{ backgroundColor: `hsl(${hue}, 100%, 50%)` }}
        {...createDragHandlers(handleSatPointer)}
      >
        <div className="tual-color-sat-white" />
        <div className="tual-color-sat-black" />
        <div className="tual-color-picker-thumb" style={{ left: `${Math.round(sat * 100)}%`, top: `${Math.round((1 - val) * 100)}%` }} />
      </div>

      <div ref={hueSliderRef} className="tual-color-slider-track tual-color-hue-track" {...createDragHandlers(handleHuePointer)}>
        <div className="tual-color-slider-thumb" style={{ left: `${Math.round((hue / 360) * 100)}%`, backgroundColor: `hsl(${hue}, 100%, 50%)` }} />
      </div>

      <div ref={alphaSliderRef} className="tual-color-slider-track tual-color-alpha-track" {...createDragHandlers(handleAlphaPointer)}>
        <div className="tual-color-alpha-gradient" style={{ background: `linear-gradient(to right, rgba(${currentR}, ${currentG}, ${currentB}, 0), rgb(${currentR}, ${currentG}, ${currentB}))` }} />
        <div className="tual-color-slider-thumb" style={{ left: `${Math.round(opacity * 100)}%`, backgroundColor: `rgba(${currentR}, ${currentG}, ${currentB}, ${opacity})` }} />
      </div>

      <div className="tual-color-inputs-bar" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
        <input
          type="text"
          className="tual-color-hex-field"
          value={hexInput}
          onChange={handleHexChange}
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
            onKeyDown={(e) => e.stopPropagation()}
            aria-label="Opacity percentage"
          />
          <span className="tual-color-percent-sign">%</span>
        </div>
      </div>
    </div>
  )
}
