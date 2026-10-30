'use client'

import { createContext, useMemo } from 'react'
import {
  createTranslator,
  resolveTranslations,
} from '../../../core/index.js'
import type { TranslationContextValue, TranslationProviderProps } from './types.js'

export const TranslationContext = createContext<TranslationContextValue | null>(null)

export function TranslationProvider({ translations, children }: TranslationProviderProps) {
  const value = useMemo<TranslationContextValue>(() => {
    const resolved = resolveTranslations(translations)
    return {
      tokens: resolved,
      t: createTranslator(resolved),
    }
  }, [translations])

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

