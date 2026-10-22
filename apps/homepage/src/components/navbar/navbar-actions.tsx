'use client'

import { Sun, Moon, Menu, X, Search } from 'lucide-react'
import { BrandIcon } from '../brand-icon'
import { useTheme } from '../theme-provider'

interface NavbarActionsProps {
  mobileMenuOpen: boolean
  onToggleMobileMenu: () => void
  onOpenSearch: () => void
}

export function NavbarActions({
  mobileMenuOpen,
  onToggleMobileMenu,
  onOpenSearch,
}: NavbarActionsProps) {
  const { theme, toggleTheme, mounted } = useTheme()

  return (
    <div className="relative flex items-center gap-2">
      {/* Search Trigger */}
      <button
        onClick={onOpenSearch}
        className="flex items-center justify-between gap-3 px-2.5 py-1.5 bg-bg-pane border border-border-secondary rounded-[2px] text-xs text-text-muted hover:text-text-primary hover:border-text-muted transition-colors cursor-pointer font-medium w-36 lg:w-48"
        aria-label="Search documentation"
      >
        <div className="flex items-center gap-2 truncate">
          <Search className="h-3.5 w-3.5 text-accent shrink-0" />
          <span className="truncate">Search docs...</span>
        </div>
        <kbd className="kbd text-[9px]">⌘K</kbd>
      </button>

      {/* Theme Switcher */}
      <button
        onClick={toggleTheme}
        className="p-1.5 rounded-[2px] border border-border-secondary bg-bg-pane text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors cursor-pointer"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        aria-label="Toggle theme"
      >
        {mounted && theme === 'light' ? (
          <Moon className="w-4 h-4 text-accent" />
        ) : (
          <Sun className="w-4 h-4 text-amber-400" />
        )}
      </button>

      {/* External Links */}
      <div className="hidden sm:flex items-center gap-2 border-l border-border-primary pl-2.5">
        <a
          href="https://www.npmjs.com/package/leaflet-canvas"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded-[2px] border border-border-secondary bg-bg-pane text-text-secondary hover:text-[#cb3837] hover:border-text-muted transition-colors"
          title="View on NPM"
        >
          <BrandIcon name="npm" size={18} />
        </a>
        <a
          href="https://github.com/yusufarsln98/leaflet-canvas"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded-[2px] border border-border-secondary bg-bg-pane text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors"
          title="GitHub repository"
        >
          <BrandIcon name="github" size={18} />
        </a>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={onToggleMobileMenu}
        className="md:hidden p-1.5 rounded-[2px] border border-border-secondary bg-bg-pane text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>
    </div>
  )
}
