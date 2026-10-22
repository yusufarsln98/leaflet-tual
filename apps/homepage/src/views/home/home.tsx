'use client'

import './home.css'
import { VERSION } from 'leaflet-tual'
import {
  HeroSection,
  PillarsSection,
  QuickstartSection,
} from './components'
import { Footer } from '../../components/footer'

export function Home() {
  const appVersion = VERSION

  return (
    <div className="oh-root flex flex-col min-h-screen">
      {/* 1. Surveyor’s folio hero */}
      <HeroSection appVersion={appVersion} />

      {/* 2. Core engine primitives (numbered index) */}
      <PillarsSection />

      {/* 3. Developer quickstart (plate workshop) */}
      <QuickstartSection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
