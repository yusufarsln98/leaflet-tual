'use client'

import { useEffect, useRef, useState } from 'react'
import type { Controller, CreateLeafletTualOptions, Doc } from '../../core/types/index.js'
import { createController } from '../../core/features/controller.js'

export function useLeafletTual(
  options: CreateLeafletTualOptions = {},
): Controller {
  const [, setTick] = useState(0)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const controllerRef = useRef<Controller | null>(null)
  if (!controllerRef.current) {
    controllerRef.current = createController(options)
  }
  const controller = controllerRef.current

  // Subscribe to controller state mutations to trigger React re-renders
  useEffect(() => {
    const unsub = controller.on('state', () => {
      setTick((t) => t + 1)
    })
    return unsub
  }, [controller])

  // Sync controlled value prop
  const prevValueRef = useRef<Doc | undefined>(options.value)
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

  return controller
}
