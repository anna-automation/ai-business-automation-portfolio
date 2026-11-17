import { ArrowRight, CalendarCheck } from 'lucide-react'
import { PillButton } from '../landing/parts.jsx'
import { posunNaPrvek } from '../../lib/scroll.js'

/**
 * Závěrečný pruh kontaktní stránky. Tlačítko nevede jinam — vrací k formuláři
 * nahoře na téže stránce, proto posouvá místo odkazu.
 */
export default function ContactCta() {
  const naFormular = () => {
    const el = document.getElementById('napiste-nam')
    if (el) posunNaPrvek(el)
  }

  return (
    <section className="relative z-10">
      <div className="mx-auto w-full max-w-[82rem] px-5 pb-20 pt-14 sm:px-8 lg:pb-24 lg:pt-20">
        <div
          className="lp-neon rounded-[1.5rem]"
          style={{
            '--lp-neon-width': '2px',
            '--lp-neon-blur': '20px',
            '--lp-neon-glow': '0.85',
            '--lp-neon-gradient':
              'linear-gradient(100deg,#ff1466 0%,#ff1466 42%,#d8004f 72%,#ff1466 100%)',
          }}
        >
          <div className="flex flex-col gap-7 rounded-[1.5rem] px-7 py-10 sm:px-10 lg:flex-row lg:items-center lg:gap-11 lg:px-14 lg:py-14">
            <CalendarCheck
              size={52}
              strokeWidth={1.6}
              aria-hidden
              className="shrink-0 text-[var(--lp-pink)] lg:ml-1"
            />

            <span aria-hidden className="hidden h-20 w-px shrink-0 bg-white/[0.14] lg:block" />

            <h2 className="text-[clamp(1.5rem,2.6vw,2.05rem)] leading-[1.25]">
              Pojďme společně najít řešení,
              <br className="hidden sm:block" /> které vám{' '}
              <span className="text-[var(--lp-pink)]">ušetří čas.</span>
            </h2>

            <PillButton
              size="lg"
              icon={ArrowRight}
              onClick={naFormular}
              className="shrink-0 self-start lg:ml-auto lg:self-auto"
            >
              Napsat mi zprávu
            </PillButton>
          </div>
        </div>
      </div>
    </section>
  )
}
