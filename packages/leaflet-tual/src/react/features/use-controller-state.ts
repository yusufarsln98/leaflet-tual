'use client'

import { useEffect, useState } from 'react'
import type { Controller } from '../../core/index.js'

export function useControllerState(controller: Controller, onState?: () => void) {
  const [, setTick] = useState(0)
  useEffect(() => {
    return controller.on('state', () => {
      setTick((n) => n + 1)
      onState?.()
    })
  }, [controller, onState])
}
