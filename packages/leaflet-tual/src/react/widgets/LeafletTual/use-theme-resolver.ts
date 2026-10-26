import { useEffect, useState } from 'react'
import type { Theme } from '../../../core/index.js'

export function useThemeResolver(theme?: Theme): 'light' | 'dark' {
  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    if (theme !== 'system' && theme !== undefined) return
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [theme])

  return theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : systemDark ? 'dark' : 'light'
}

