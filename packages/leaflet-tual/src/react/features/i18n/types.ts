import type { ReactNode } from 'react'
import type { TranslationTokens, Translator } from '../../../core/index.js'

export interface TranslationContextValue {
  tokens: TranslationTokens
  t: Translator
}

export interface TranslationProviderProps {
  translations?: Partial<TranslationTokens>
  children: ReactNode
}

