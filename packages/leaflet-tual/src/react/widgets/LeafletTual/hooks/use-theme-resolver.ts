import { useEffect, useState } from 'react'
import type { Theme } from '../../../../core/types.js'
import {
  getSystemTheme,
  resolveTheme,
  subscribeSystemTheme,
  type ResolvedTheme,
} from '../../../../shared/theme/theme.js'

export { getSystemTheme, resolveTheme, subscribeSystemTheme }

export function useThemeResolver(theme: Theme = 'system'): ResolvedTheme {
  const [systemScheme, setSystemScheme] = useState<ResolvedTheme>(() => getSystemTheme())

  useEffect(() => {
    return subscribeSystemTheme((scheme) => setSystemScheme(scheme))
  }, [])

  if (theme === 'dark') return 'dark'
  if (theme === 'light') return 'light'
  return systemScheme
}

