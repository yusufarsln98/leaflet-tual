'use client'

import { ThemeProvider } from './theme-provider'
import { FpsProvider } from '@/hooks/use-fps'
import { Navbar } from './navbar'
import { usePathname } from 'next/navigation'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDemo = pathname === '/demo'

  return (
    <ThemeProvider>
      <FpsProvider>
        <div
          className={`flex flex-col text-text-primary transition-colors duration-200 ${
            isDemo
              ? 'h-screen overflow-hidden bg-bg-app'
              : 'min-h-screen bg-bg-app'
          }`}
        >
          <Navbar />
          <main className="flex-1 min-w-0 w-full min-h-0 flex flex-col">{children}</main>
        </div>
      </FpsProvider>
    </ThemeProvider>
  )
}

