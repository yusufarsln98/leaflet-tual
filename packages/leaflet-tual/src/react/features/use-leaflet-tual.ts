'use client'

import { useEffect, useRef } from 'react'
import type { Controller, CreateLeafletTualOptions, InternalController } from '../../core/index.js'
import { createController } from '../../core/index.js'
import { useControllerState } from './use-controller-state.js'

export function useLeafletTual(options: CreateLeafletTualOptions = {}): Controller {
  const controllerRef = useRef<Controller | null>(null)
  if (!controllerRef.current) {
    controllerRef.current = createController(options)
  }
  const controller = controllerRef.current

  useControllerState(controller)

  const prevValueRef = useRef(options.value)
  useEffect(() => {
    if (options.value !== undefined && options.value !== prevValueRef.current) {
      prevValueRef.current = options.value
      ;(controller as InternalController)._updateControlledDoc?.(options.value)
    }
  }, [options.value, controller])

  useEffect(() => {
    if (options.readOnly !== undefined && options.readOnly !== controller.readOnly) {
      controller.setReadOnly(options.readOnly)
    }
  }, [options.readOnly, controller])

  const prevTranslationsRef = useRef(options.translations)
  useEffect(() => {
    if (options.translations && options.translations !== prevTranslationsRef.current) {
      prevTranslationsRef.current = options.translations
      controller.setTranslations(options.translations)
    }
  }, [options.translations, controller])

  useEffect(() => {
    if (options.theme !== undefined && options.theme !== controller.theme) {
      controller.setTheme(options.theme)
    }
  }, [options.theme, controller])

  return controller
}

