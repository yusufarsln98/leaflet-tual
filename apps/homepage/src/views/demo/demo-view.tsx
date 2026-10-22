'use client'

import { DemoWorkbench } from './demo-workbench'
import type { DemoViewProps } from './types'

export function DemoView(_props: DemoViewProps) {
  return (
    <div className="flex-1 w-full h-[calc(100vh-3.5rem)] flex flex-col min-h-0 overflow-hidden bg-bg-app">
      <DemoWorkbench mode="fullscreen" />
    </div>
  )
}
