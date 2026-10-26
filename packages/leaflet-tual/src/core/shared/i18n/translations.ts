import { DEFAULT_TRANSLATION_TOKENS } from './tokens.js'
import { translate } from './translate.js'
import type { TranslationTokens, Translator } from './types.js'

let globalTranslations: TranslationTokens = { ...DEFAULT_TRANSLATION_TOKENS }

export function getDefaultTranslations(): TranslationTokens {
  return { ...globalTranslations }
}

export function setDefaultTranslations(patch: Partial<TranslationTokens>): void {
  globalTranslations = { ...globalTranslations, ...patch } as TranslationTokens
}

export function resetDefaultTranslations(): void {
  globalTranslations = { ...DEFAULT_TRANSLATION_TOKENS }
}

export function resolveTranslations(
  overrides?: Partial<TranslationTokens> | null,
): TranslationTokens {
  if (!overrides) return getDefaultTranslations()
  return { ...getDefaultTranslations(), ...overrides } as TranslationTokens
}

export function createTranslator(
  tokensOrOverrides?: TranslationTokens | Partial<TranslationTokens>,
): Translator {
  const resolved = tokensOrOverrides
    ? resolveTranslations(tokensOrOverrides)
    : getDefaultTranslations()
  return (token, params, fallback) => translate(resolved, token, params, fallback)
}
