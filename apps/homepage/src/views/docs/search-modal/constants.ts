import { BookOpen, Zap, Layers, Terminal, Cpu } from 'lucide-react'

export const QUICK_LINKS = [
  {
    id: 'introduction',
    title: 'Introduction & Architecture',
    category: 'Overview',
    icon: BookOpen,
  },
  { id: 'quickstart', title: 'Quick Start & Installation', category: 'Guide', icon: Zap },
  { id: 'tree-layout', title: 'Binary Tree Topology & Splits', category: 'Core', icon: Layers },
  { id: 'state-controller', title: 'Controller & State Engine', category: 'Core', icon: Terminal },
  {
    id: 'pane-customization',
    title: 'BYO-UI & Component Architecture',
    category: 'Core',
    icon: Layers,
  },
  {
    id: 'advanced-features',
    title: 'Persistence, Tabs & Popouts',
    category: 'Advanced',
    icon: Cpu,
  },
  {
    id: 'api-reference',
    title: 'Complete API & Utility Reference',
    category: 'API',
    icon: Terminal,
  },
] as const

export function getCategoryLabel(cat: string): string {
  switch (cat) {
    case 'overview':
      return 'Overview'
    case 'core':
      return 'Core Concepts'
    case 'advanced':
      return 'Advanced Features'
    case 'api':
      return 'API Reference'
    default:
      return cat
  }
}

