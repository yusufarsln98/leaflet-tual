'use client'

import { useEffect, useRef, useState } from 'react'
import type { Controller, CreateLeafletTualOptions } from '../../core/index.js'
import { createController } from '../../core/index.js'

export function useLeafletTual(options: CreateLeafletTualOptions = {}): Controller {
  const [, setTick] = useState(0)

  // Stable controller instance across renders
  const controllerRef = useRef<Controller | null>(null)
  if (!controllerRef.current) {
    controllerRef.current = createController(options)
  }
  const controller = controllerRef.current

  // Subscribe to controller state changes to trigger re-renders
  useEffect(() => {
    return controller.on('state', () => {
      setTick((n) => n + 1)
    })
  }, [controller])

  // Sync controlled value prop
  const prevValueRef = useRef(options.value)
  useEffect(() => {
    if (options.value !== undefined && options.value !== prevValueRef.current) {
      prevValueRef.current = options.value
      ;(controller as any)._updateControlledDoc?.(options.value)
    }
  }, [options.value, controller])

  // Sync readOnly prop
  useEffect(() => {
    if (options.readOnly !== undefined && options.readOnly !== controller.readOnly) {
      controller.setReadOnly(options.readOnly)
    }
  }, [options.readOnly, controller])

  // Sync translations prop
  const prevTranslationsRef = useRef(options.translations)
  useEffect(() => {
    if (options.translations && options.translations !== prevTranslationsRef.current) {
      prevTranslationsRef.current = options.translations
      controller.setTranslations(options.translations)
    }
  }, [options.translations, controller])

  // Sync theme prop
  useEffect(() => {
    if (options.theme !== undefined && options.theme !== controller.theme) {
      controller.setTheme(options.theme)
    }
  }, [options.theme, controller])

  return controller
}
