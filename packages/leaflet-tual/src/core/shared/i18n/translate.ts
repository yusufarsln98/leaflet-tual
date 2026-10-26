import { DEFAULT_TRANSLATION_TOKENS } from './tokens.js'
import type { TranslationTokens } from './types.js'

export function translate(
  tokens: TranslationTokens,
  token: keyof TranslationTokens | (string & {}),
  params?: Record<string, string | number>,
  fallback?: string,
): string {
  let val =
    tokens[token] ??
    fallback ??
    (DEFAULT_TRANSLATION_TOKENS[token] as string | undefined) ??
    token

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
  }

  return val
}

