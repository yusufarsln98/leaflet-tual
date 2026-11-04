'use client'

import { useContext, useEffect, useMemo, useState } from 'react'
import type { Controller } from '../../../core/index.js'
import { createTranslator, getDefaultTranslations } from '../../../core/index.js'
import { TranslationContext } from './TranslationContext.js'
import type { TranslationContextValue } from './types.js'

export function useTranslation(controller?: Controller): TranslationContextValue {
  const contextValue = useContext(TranslationContext)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!controller) return
    const unsub = controller.on('translations', () => {
      setTick((t) => t + 1)
    })
    return unsub
  }, [controller])

  return useMemo<TranslationContextValue>(() => {
    if (controller?.translations) {
      return {
        tokens: controller.translations,
        t: createTranslator(controller.translations),
      }
    }
    if (contextValue) {
      return contextValue
    }
    const defaults = getDefaultTranslations()
    return {
      tokens: defaults,
      t: createTranslator(defaults),
    }
  }, [controller?.translations, contextValue, tick])
}

