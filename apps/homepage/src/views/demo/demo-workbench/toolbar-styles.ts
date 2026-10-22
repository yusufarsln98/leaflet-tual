import type { LeafletCanvasStyles } from 'leaflet-tual/react'

export function getToolbarStyles(isDark: boolean): Partial<LeafletCanvasStyles> {
  return {
    toolbarPrimary: {
      backgroundColor: isDark ? 'rgba(22, 31, 48, 0.94)' : 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(16px)',
      border: isDark ? '1px solid rgba(229, 231, 235, 0.14)' : '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '10px',
      padding: '3px 4px',
      gap: '3px',
      boxShadow: isDark
        ? '0 18px 40px -10px rgba(0, 0, 0, 0.65), 0 4px 16px rgba(0, 0, 0, 0.4)'
        : '0 12px 30px -8px rgba(15, 23, 42, 0.14), 0 4px 12px rgba(15, 23, 42, 0.06)',
      color: isDark ? '#F9FAFB' : '#0F172A',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    toolbarSecondary: {
      backgroundColor: isDark ? 'rgba(22, 31, 48, 0.94)' : 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(16px)',
      border: isDark ? '1px solid rgba(229, 231, 235, 0.14)' : '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '9px',
      padding: '4px 8px',
      fontSize: '12px',
      boxShadow: isDark
        ? '0 14px 34px -8px rgba(0, 0, 0, 0.55), 0 4px 14px rgba(0, 0, 0, 0.35)'
        : '0 10px 24px -6px rgba(15, 23, 42, 0.12), 0 3px 10px rgba(15, 23, 42, 0.05)',
      color: isDark ? '#F9FAFB' : '#0F172A',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    toolButton: {
      backgroundColor: 'transparent',
      border: '1px solid transparent',
      color: isDark ? '#F3F4F6' : '#1E293B',
      borderRadius: '7px',
      padding: '4px 8px',
      fontSize: '12px',
      lineHeight: '16px',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      fontWeight: 500,
      transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    toolButtonActive: {
      backgroundColor: isDark ? '#B6F03C' : '#4D7C0F',
      color: isDark ? '#111827' : '#FFFFFF',
      border: '1px solid transparent',
      borderRadius: '7px',
      padding: '4px 8px',
      fontSize: '12px',
      lineHeight: '16px',
      boxShadow: isDark
        ? '0 2px 10px rgba(182, 240, 60, 0.35)'
        : '0 2px 8px rgba(77, 124, 15, 0.25)',
      fontWeight: 600,
    },
    toolbarDivider: {
      backgroundColor: isDark ? 'rgba(229, 231, 235, 0.15)' : 'rgba(0, 0, 0, 0.12)',
    },
    toolbarCollapseButton: {
      backgroundColor: 'transparent',
      border: '1px solid transparent',
      color: isDark ? '#F3F4F6' : '#1E293B',
      borderRadius: '7px',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      transition: 'all 0.15s ease',
    },
    toolbarCollapsed: {
      backgroundColor: isDark ? 'rgba(22, 31, 48, 0.94)' : 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(16px)',
      border: isDark ? '1px solid rgba(229, 231, 235, 0.14)' : '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '10px',
      color: isDark ? '#F9FAFB' : '#0F172A',
      boxShadow: isDark
        ? '0 12px 28px -6px rgba(0, 0, 0, 0.55)'
        : '0 8px 20px -4px rgba(15, 23, 42, 0.12)',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    },
    actionButton: {
      backgroundColor: 'transparent',
      border: '1px solid transparent',
      color: isDark ? '#F3F4F6' : '#1E293B',
      borderRadius: '7px',
      padding: '4px 8px',
      fontSize: '12px',
      lineHeight: '16px',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      fontWeight: 500,
      transition: 'all 0.15s ease',
    },
    actionButtonDisabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
    deleteButton: {
      backgroundColor: isDark ? 'rgba(248, 113, 113, 0.16)' : 'rgba(239, 68, 68, 0.12)',
      color: isDark ? '#FCA5A5' : '#DC2626',
      border: isDark ? '1px solid rgba(248, 113, 113, 0.28)' : '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '8px',
      fontWeight: 600,
    },
  }
}

