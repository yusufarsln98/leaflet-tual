import type { LeafletCanvasStyles } from 'leaflet-canvas/react'

export function getModalAndControlStyles(isDark: boolean): Partial<LeafletCanvasStyles> {
  return {
    arrowDropdownMenu: {
      backgroundColor: isDark ? 'rgba(22, 31, 48, 0.96)' : 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(16px)',
      border: isDark ? '1px solid rgba(229, 231, 235, 0.14)' : '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '12px',
      boxShadow: isDark
        ? '0 18px 40px -10px rgba(0, 0, 0, 0.65), 0 4px 16px rgba(0, 0, 0, 0.4)'
        : '0 14px 32px -8px rgba(15, 23, 42, 0.14), 0 4px 12px rgba(15, 23, 42, 0.06)',
      color: isDark ? '#F9FAFB' : '#0F172A',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    },
    arrowDropdownItem: {
      color: isDark ? '#9CA3AF' : '#475569',
      borderRadius: '8px',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      fontWeight: 500,
      transition: 'all 0.15s ease',
    },
    arrowDropdownItemActive: {
      backgroundColor: isDark ? '#B6F03C' : '#4D7C0F',
      color: isDark ? '#111827' : '#FFFFFF',
      fontWeight: 700,
    },
    shapesModal: {
      backgroundColor: isDark ? 'rgba(22, 31, 48, 0.96)' : 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(16px)',
      border: isDark ? '1px solid rgba(229, 231, 235, 0.14)' : '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '14px',
      boxShadow: isDark
        ? '0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 6px 18px rgba(0, 0, 0, 0.45)'
        : '0 16px 36px -8px rgba(15, 23, 42, 0.15), 0 6px 14px rgba(15, 23, 42, 0.06)',
      color: isDark ? '#F9FAFB' : '#0F172A',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    },
    shapesModalHeader: {
      color: isDark ? '#9CA3AF' : '#64748B',
      fontFamily: 'var(--font-mono, monospace)',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.06em',
    },
    shapesModalGrid: {
      gap: '5px',
    },
    shapesModalItem: {
      color: isDark ? '#9CA3AF' : '#475569',
      borderRadius: '8px',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      fontWeight: 500,
      transition: 'all 0.15s ease',
    },
    shapesModalItemActive: {
      backgroundColor: isDark ? '#B6F03C' : '#4D7C0F',
      color: isDark ? '#111827' : '#FFFFFF',
      border: '1px solid transparent',
      boxShadow: isDark
        ? '0 2px 10px rgba(182, 240, 60, 0.4)'
        : '0 2px 8px rgba(77, 124, 15, 0.3)',
      fontWeight: 700,
    },
    swatchButton: {
      borderRadius: '9999px',
      boxShadow: isDark ? '0 1px 3px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.15)',
      transition: 'transform 0.15s ease',
    },
    swatchButtonActive: {
      outline: isDark ? '2px solid #B6F03C' : '2px solid #4D7C0F',
      outlineOffset: '2px',
      transform: 'scale(1.12)',
    },
    toolbarInput: {
      backgroundColor: isDark ? '#111827' : '#F8FAFC',
      color: isDark ? '#F9FAFB' : '#0F172A',
      border: isDark ? '1px solid rgba(229, 231, 235, 0.18)' : '1px solid rgba(0, 0, 0, 0.14)',
      borderRadius: '7px',
      fontFamily: 'var(--font-mono, monospace)',
      fontSize: '11px',
    },
    toolbarSelect: {
      backgroundColor: isDark ? '#111827' : '#F8FAFC',
      color: isDark ? '#F9FAFB' : '#0F172A',
      border: isDark ? '1px solid rgba(229, 231, 235, 0.18)' : '1px solid rgba(0, 0, 0, 0.14)',
      borderRadius: '7px',
      fontFamily: 'var(--font-mono, monospace)',
      fontSize: '11px',
    },
  }
}

