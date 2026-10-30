'use client'

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import type L from 'leaflet'
import {
  hsvToRgb,
  parseColorString,
  rgbToHex,
  rgbToHsv,
} from '../../../core/index.js'
import { useTranslation } from '../../features/i18n/index.js'
import { Divider } from '../divider/index.js'
import { NumberField, TextField } from '../input/index.js'
import type { CustomColorPickerProps } from './types.js'

function DragTrack({
  className,
  style,
  map,
  onChange,
  children,
}: {
  className: string
  style?: CSSProperties
  map?: L.Map | null
  onChange: (nx: number, ny: number) => void
  children: ReactNode
}) {
  const emit = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    onChange(nx, ny)
  }

  return (
    <div
      className={className}
      style={style}
      onPointerDown={(e) => {
        e.stopPropagation()
        e.preventDefault()
        map?.dragging?.disable()
        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {}
        emit(e)
      }}
      onPointerMove={(e) => {
        e.stopPropagation()
        if (e.buttons > 0) emit(e)
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
      {children}
    </div>
  )
}

export function CustomColorPicker({
  currentColor,
  map,
  onSelectColor,
}: CustomColorPickerProps) {
  const { t } = useTranslation()
  const parsed = parseColorString(currentColor)
  const [initialH, initialS, initialV] = rgbToHsv(parsed.r, parsed.g, parsed.b)

  const [hue, setHue] = useState(initialH)
  const [sat, setSat] = useState(initialS)
  const [val, setVal] = useState(initialV)
  const [opacity, setOpacity] = useState(parsed.a)
  const [hexInput, setHexInput] = useState(() => rgbToHex(parsed.r, parsed.g, parsed.b))

  useEffect(() => {
    const p = parseColorString(currentColor)
    const [h, s, v] = rgbToHsv(p.r, p.g, p.b)
    setHue(h)
    setSat(s)
    setVal(v)
    setOpacity(p.a)
    setHexInput(rgbToHex(p.r, p.g, p.b))
  }, [currentColor])

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

  const handleHexChange = (raw: string) => {
    setHexInput(raw)
    const clean = raw.trim()
    if (/^#?[0-9A-Fa-f]{6}$/.test(clean)) {
      const formatted = clean.startsWith('#') ? clean : `#${clean}`
      const p = parseColorString(formatted)
      const [newH, newS, newV] = rgbToHsv(p.r, p.g, p.b)
      setHue(newH)
      setSat(newS)
      setVal(newV)
      emitColor(newH, newS, newV, opacity)
    }
  }

  return (
    <div className="tual-color-custom-panel" onPointerDown={(e) => e.stopPropagation()}>
      <DragTrack
        className="tual-color-sat-box"
        style={{ backgroundColor: `hsl(${hue}, 100%, 50%)` }}
        map={map}
        onChange={(nx, ny) => {
          const nextV = 1 - ny
          setSat(nx)
          setVal(nextV)
          emitColor(hue, nx, nextV, opacity)
        }}
      >
        <div className="tual-color-sat-white" />
        <div className="tual-color-sat-black" />
        <div
          className="tual-color-picker-thumb"
          style={{ left: `${Math.round(sat * 100)}%`, top: `${Math.round((1 - val) * 100)}%` }}
        />
      </DragTrack>

      <DragTrack
        className="tual-color-slider-track tual-color-hue-track"
        map={map}
        onChange={(nx) => {
          const nextHue = Math.round(nx * 360) % 360
          setHue(nextHue)
          emitColor(nextHue, sat, val, opacity)
        }}
      >
        <div
          className="tual-color-slider-thumb"
          style={{
            left: `${Math.round((hue / 360) * 100)}%`,
            backgroundColor: `hsl(${hue}, 100%, 50%)`,
          }}
        />
      </DragTrack>

      <DragTrack
        className="tual-color-slider-track tual-color-alpha-track"
        map={map}
        onChange={(nx) => {
          const nextAlpha = Math.round(nx * 100) / 100
          setOpacity(nextAlpha)
          emitColor(hue, sat, val, nextAlpha)
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
      </DragTrack>

      <div
        className="tual-color-inputs-bar"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <TextField
          className="tual-color-hex-field"
          value={hexInput}
          onChange={handleHexChange}
          aria-label={t('hexColor')}
          placeholder="#000000"
        />
        <Divider variant="input" />
        <NumberField
          min={0}
          max={100}
          step={1}
          stepIcons={false}
          wrapperClassName="tual-color-opacity-field"
          className="tual-color-opacity-num"
          unitClassName="tual-color-percent-sign"
          unit="%"
          value={Math.round(opacity * 100)}
          onChange={(num) => {
            const clamped = Math.max(0, Math.min(100, num)) / 100
            setOpacity(clamped)
            emitColor(hue, sat, val, clamped)
          }}
          aria-label={t('opacityPercentage', undefined, 'Opacity percentage')}
        />
      </div>
    </div>
  )
}


