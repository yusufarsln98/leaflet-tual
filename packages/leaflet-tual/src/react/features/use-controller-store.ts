'use client'

import { useStore } from 'zustand'
import type { Controller, ControllerState } from '../../core/index.js'

export function useControllerStore<T>(
  controller: Controller,
  selector: (state: ControllerState) => T,
): T {
  return useStore(controller.store, selector)
}
