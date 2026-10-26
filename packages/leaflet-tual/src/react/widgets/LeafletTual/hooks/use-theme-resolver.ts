import { useEffect, useState } from 'react'
import type { Theme } from '../../../../core/types/index.js'

export function useThemeResolver(theme: Theme = 'system'): 'light' | 'dark' {
  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])

  if (theme === 'dark') return 'dark'
  if (theme === 'light') return 'light'
  return systemDark ? 'dark' : 'light'
}
