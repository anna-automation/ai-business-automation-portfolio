import { BarChart3, Layers, Zap } from 'lucide-react'
import { cn } from '../../lib/utils.js'

/**
 * „O mně“ ve spodní části kontaktní stránky — vlevo tvrzení a tři přínosy,
 * vpravo pracovní zátiší. Fotka má vlastní pozadí i stůl, do stránky ji tedy
 * pouští měkká maska po okrajích (.lp-zatisi).
 */
const PRINOSY = [
  { icon: Zap, titulek: 'Automatizace', popis: 'procesů' },
  { icon: Layers, titulek: 'Propojení', popis: 'nástrojů a dat' },
  { icon: BarChart3, titulek: 'Měřitelný', popis: 'výsledek' },
]

export default function ContactAbout() {
  return (
    <section id="o-mne" className="relative z-10 scroll-mt-28">
      <div className="mx-auto w-full max-w-[82rem] px-5 pb-14 pt-10 sm:px-8 lg:pb-20 lg:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,53%)] lg:gap-6">
          {/* ── Text ─────────────────────────────────────────────────── */}
          <div>
            <p className="lp-eyebrow flex items-center gap-4">
              O mně
              <span aria-hidden className="h-px w-10 bg-[var(--lp-pink)]" />
            </p>

            <h2 className="mt-5 max-w-[16ch] text-[clamp(1.9rem,3.6vw,2.9rem)]">
              Spojuji technologie
              <br />s <span className="text-[var(--lp-pink)]">reálným byznysem</span>
            </h2>

            {/* užší sloupec drží odstavec na třech řádcích jako na předloze */}
            <p className="mt-7 max-w-[26rem] text-[clamp(1rem,1.25vw,1.08rem)] leading-[1.6] text-white/75">
              Pomáhám firmám zbavit se rutiny, automatizovat procesy a chytře využít AI tak, aby
              šetřila čas, peníze a kapacity.
            </p>

            <ul className="mt-11 flex max-w-[34rem] flex-wrap items-stretch gap-y-5">
              {PRINOSY.map((p, i) => (
                <li
                  key={p.titulek}
                  className={cn(
                    'flex min-w-[9rem] flex-1 items-center gap-3 pr-4 sm:pr-6',
                    // na mobilu se položky zalomí do dvou řádků a čára by pak
                    // visela na začátku řádku jako osiřelá
                    i > 0 && 'sm:border-l sm:border-white/[0.1] sm:pl-6'
                  )}
                >
                  <p.icon
                    size={26}
                    strokeWidth={1.9}
                    className="shrink-0 text-[var(--lp-pink)]"
                    aria-hidden
                  />
                  <span className="leading-tight">
                    <span className="block text-[0.98rem] font-semibold text-white">
                      {p.titulek}
                    </span>
                    <span className="block text-[0.92rem] text-white/60">{p.popis}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Zátiší ──────────────────────────────────────────────── */}
          <img
            src="/media/pracovni-sestava.webp"
            alt=""
            width={1600}
            height={900}
            loading="lazy"
            draggable={false}
            className="lp-zatisi pointer-events-none order-first w-full select-none lg:order-none"
          />
        </div>
      </div>
    </section>
  )
}
