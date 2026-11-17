import './landing.css'
import { Backdrop } from './parts.jsx'
import LandingHeader from './LandingHeader.jsx'
import LandingHero from './LandingHero.jsx'
import WhatRunsItself from './WhatRunsItself.jsx'
import BeforeAfter from './BeforeAfter.jsx'
import Integrations from './Integrations.jsx'
import FinalCta from './FinalCta.jsx'
import LandingFooter from './LandingFooter.jsx'

/**
 * Úvodní stránka MAKÁSAMO — vlastní vizuální svět, který si nese i svoji
 * hlavičku a patičku. Zbytek webu běží dál na svých tokenech.
 *
 * Příznak `data-landing` na <html> (nastavuje ho App podle routy) přebarví
 * kurzor, ukazatel scrollu a lištu cookies do růžové a sjednotí barvu plochy
 * za stránkou, aby při přetažení neproblikla světlá.
 */
export default function Landing() {
  return (
    <div className="lp min-h-screen">
      <Backdrop />
      <LandingHeader />
      <LandingHero />
      <WhatRunsItself />
      <BeforeAfter />
      <Integrations />
      <FinalCta />
      <LandingFooter />
    </div>
  )
}
