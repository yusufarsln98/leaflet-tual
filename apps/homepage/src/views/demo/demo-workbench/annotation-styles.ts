import type { LeafletCanvasStyles } from 'leaflet-tual/react'

export function getAnnotationCardStyles(isDark: boolean): Partial<LeafletCanvasStyles> {
  return {
    noteCard: {
      borderRadius: '12px',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    },
    noteCollapsed: {
      borderRadius: '20px',
    },
    noteCardSelected: {
      border: '1.5px solid #2563EB',
      boxShadow: '0 12px 28px -6px rgba(37, 99, 235, 0.28), 0 0 0 2px rgba(37, 99, 235, 0.2)',
    },
    noteHeader: {
      borderRadius: '10px 10px 0 0',
    },
    noteTitleInput: {
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      fontWeight: 600,
    },
    noteHeaderButton: {
      backgroundColor: 'transparent',
      borderRadius: '5px',
    },
    noteDeleteButton: {
      color: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '5px',
    },
    noteTextarea: {
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    },
    textWrapper: {
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    },
    textWrapperSelected: {
      outline: '2px dashed #2563EB',
      outlineOffset: '4px',
      borderRadius: '4px',
    },
    textControls: {
      backgroundColor: isDark ? 'rgba(22, 31, 48, 0.96)' : 'rgba(255, 255, 255, 0.98)',
      color: isDark ? '#F9FAFB' : '#0F172A',
      border: isDark ? '1px solid rgba(229, 231, 235, 0.14)' : '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      boxShadow: isDark
        ? '0 10px 25px -4px rgba(0, 0, 0, 0.6)'
        : '0 8px 20px -4px rgba(15, 23, 42, 0.14)',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    },
    textControlButton: {
      color: isDark ? '#9CA3AF' : '#475569',
      backgroundColor: 'transparent',
      borderRadius: '6px',
    },
    textControlButtonActive: {
      backgroundColor: isDark ? '#B6F03C' : '#4D7C0F',
      color: isDark ? '#111827' : '#FFFFFF',
      fontWeight: 700,
    },
    textInput: {
      border: '1.5px solid #2563EB',
      borderRadius: '6px',
      boxShadow: '0 0 10px rgba(37, 99, 235, 0.25)',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    },
    textDisplay: {
      borderRadius: '6px',
      backdropFilter: 'blur(8px)',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    },
  }
}

