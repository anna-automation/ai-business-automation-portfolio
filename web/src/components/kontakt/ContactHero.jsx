import { CalendarCheck, ShieldCheck, Zap } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import PoptavkovyFormular from './PoptavkovyFormular.jsx'

/**
 * Horní část kontaktní stránky — nadpis a fotka vlevo, formulář vpravo.
 * Vizuál vychází z předlohy v pages/kontakt a drží se světa landing page
 * (třída .lp a její proměnné). Formulář si veze vlastní stav, tahle část
 * je jen rozvržení.
 */

const VYHODY = [
  { icon: Zap, titulek: 'Rychlá odpověď', popis: 'do 24 h', barva: 'text-[var(--lp-pink)]' },
  { icon: CalendarCheck, titulek: 'Konzultace', popis: 'zdarma', barva: 'text-[var(--lp-cyan)]' },
  { icon: ShieldCheck, titulek: 'Bez závazků', popis: 'a prodejního tlaku', barva: 'text-[#a78bfa]' },
]

export default function ContactHero() {
  return (
    <section className="lp-contact relative z-10 pt-28 sm:pt-32 lg:pt-36">
      <div className="mx-auto w-full max-w-[84rem] px-5 pb-16 sm:px-6 lg:pb-20">
        <div className="relative grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,39rem)] lg:gap-8">
          {/* ── Levý sloupec ─────────────────────────────────────────── */}
          <div className="relative z-10 lg:pb-6 lg:pt-6">
            <p className="lp-eyebrow flex items-center gap-4">
              Kontakt
              <span aria-hidden className="h-px w-10 bg-[var(--lp-pink)]" />
            </p>

            {/* Zalomení drží tři řádky jako na předloze; text-balance by je
                přerovnal podle své logiky, proto je tu vypnutý. */}
            <h1 className="mt-5 max-w-[12ch] text-[clamp(2.4rem,5vw,3.7rem)] [text-wrap:nowrap]">
              Máte nápad,
              <br />
              proces nebo{' '}
              <span className="text-[var(--lp-pink)]">problém?</span>
            </h1>

            <p className="mt-6 max-w-[26rem] text-[clamp(1rem,1.25vw,1.08rem)] leading-[1.6] text-white/75">
              Napište nám a do 24 hodin se ozveme s konkrétním návrhem, jak to vyřešit.
            </p>

            {/* podpis */}
            <div className="mt-12 lg:mt-16">
              <p className="lp-signature text-[clamp(3rem,4.6vw,4rem)] leading-none text-white">
                Anna
              </p>
            </div>

            {/* tři důvody, proč napsat — drží se v levé polovině, aby se
                nepodlezly pod fotku */}
            <ul className="mt-12 flex max-w-[34rem] flex-wrap items-stretch gap-x-0 gap-y-6 lg:mt-24">
              {VYHODY.map((v, i) => (
                <li
                  key={v.titulek}
                  className={cn(
                    // na úzkém displeji se tři sloupce vejdou jen takhle těsně
                    'flex min-w-[6.5rem] flex-1 flex-col items-center gap-2 px-2 text-center sm:min-w-[8rem] sm:px-5',
                    i > 0 && 'border-l border-white/[0.1]'
                  )}
                >
                  <v.icon size={26} strokeWidth={1.8} className={v.barva} />
                  <p className="mt-1 text-[0.98rem] font-semibold leading-tight text-white">
                    {v.titulek}
                  </p>
                  <p className="text-[0.92rem] leading-tight text-white/60">{v.popis}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Fotka ────────────────────────────────────────────────────
              Kotví se horní hranou k hornímu okraji formuláře. Kdyby visela
              u spodku, odjížděla by dolů pokaždé, když formulář naroste
              (chybová hláška, delší příloha). */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[40.5%] top-0 hidden w-[22%] max-w-[22rem] -translate-x-1/2 select-none lg:block"
          >
            {/* růžová záře za postavou */}
            <span className="absolute left-1/2 top-[40%] block aspect-[3/4] w-[160%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(124_58_237/0.42)_0%,rgb(255_20_102/0.2)_46%,transparent_72%)] blur-[56px]" />

            {/* Výřez z předlohy i s pozadím — vystřihávat siluetu se neosvědčilo,
                vlasům i notebooku to ukousávalo okraje. Do stránky se fotka
                pouští měkkou maskou (.lp-contact-foto). */}
            <img
              src="/media/anna-kontakt.webp"
              alt=""
              width={604}
              height={1269}
              className="lp-contact-foto relative block w-full"
              draggable={false}
            />
          </div>

          {/* ── Formulář ─────────────────────────────────────────────── */}
          <PoptavkovyFormular />
        </div>
      </div>
    </section>
  )
}
