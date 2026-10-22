'use client'

import dynamic from 'next/dynamic'

const DemoView = dynamic(
  () => import('./demo/demo-view').then((mod) => ({ default: mod.DemoView })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-[#0B0F17] flex items-center justify-center text-text-muted text-xs font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span>Initializing Leaflet Map Canvas...</span>
        </div>
      </div>
    ),
  },
)

export function Demo() {
  return <DemoView />
}

