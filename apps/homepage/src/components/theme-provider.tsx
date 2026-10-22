'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'

interface ThemeContextValue {
  theme: 'light' | 'dark'
  mounted: boolean
  toggleTheme: (event?: React.MouseEvent<HTMLButtonElement>) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  mounted: false,
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = useState(false)

  // Read saved theme from localStorage or fallback to system preference (default dark for leaflet canvas)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('leaflet-canvas-theme')
      if (saved === 'dark' || saved === 'light') {
        setTheme(saved)
      } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        setTheme('light')
      } else {
        setTheme('dark')
      }
    } catch {
      // localStorage unavailable
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
    if (meta) meta.content = theme
    localStorage.setItem('leaflet-canvas-theme', theme)
  }, [theme, mounted])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, mounted, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

