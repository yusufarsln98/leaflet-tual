'use client'

import { DemoWorkbench } from './demo-workbench'

export function DemoView() {
  return (
    <div className="flex-1 w-full h-[calc(100vh-3.5rem)] flex flex-col min-h-0 overflow-hidden bg-bg-app">
      <DemoWorkbench mode="fullscreen" />
    </div>
  )
}
