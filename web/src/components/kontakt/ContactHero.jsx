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
  { icon: Zap, titulek: 'Rychlá odpověď', popis: 'do 24 h' },
  { icon: CalendarCheck, titulek: 'Konzultace', popis: 'zdarma' },
  { icon: ShieldCheck, titulek: 'Bez závazků', popis: 'a prodejního tlaku' },
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
              <p className="lp-signature text-[clamp(2.6rem,4vw,3.4rem)] leading-none text-white">
                Anna
              </p>
              <span aria-hidden className="mt-1 block h-[2px] w-[7.5rem] bg-[var(--lp-pink)]" />
              <p className="mt-3 text-[0.98rem] text-white/70">Automatizace &amp; AI</p>
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
                  <v.icon size={26} strokeWidth={1.8} className="text-[var(--lp-pink)]" />
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
            <span className="absolute left-1/2 top-[40%] block aspect-[3/4] w-[160%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_20_102/0.55)_0%,rgb(216_0_79/0.26)_44%,transparent_70%)] blur-[52px]" />

            {/* Silueta je vyříznutá už v souboru — žádná maska navíc,
                fotka zůstává přesně taková, jaká je v předloze. */}
            <img
              src="/media/anna-kontakt.png"
              alt=""
              width={316}
              height={611}
              className="relative block w-full"
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
