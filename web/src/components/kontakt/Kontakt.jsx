import '../landing/landing.css'
import LandingHeader from '../landing/LandingHeader.jsx'
import LandingFooter from '../landing/LandingFooter.jsx'
import { Backdrop } from '../landing/parts.jsx'
import ContactHero from './ContactHero.jsx'
import ContactAbout from './ContactAbout.jsx'
import ContactBilling from './ContactBilling.jsx'
import ContactCta from './ContactCta.jsx'

/**
 * Kontaktní stránka. Běží ve stejném vizuálním světě jako úvodka — nese si
 * tedy i její hlavičku, pozadí a patičku.
 *
 * Skládá se podle předloh v pages/kontakt: nahoře nadpis s formulářem, dole
 * „o mně“ se zátiším, fakturační údaje a závěrečná výzva.
 */
export default function Kontakt() {
  return (
    <div className="lp min-h-screen">
      <Backdrop />
      <LandingHeader />
      <ContactHero />
      <ContactAbout />
      <ContactBilling />
      <ContactCta />
      <LandingFooter />
    </div>
  )
}
