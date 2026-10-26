import type { ReactNode } from 'react'

export interface CollapsibleProps {
  title: ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  headerClassName?: string
  contentClassName?: string
  children: ReactNode
}

