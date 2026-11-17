import { toolbelt } from '../../data/site.js'
import { usePrefs } from '../../lib/prefs.jsx'
import { useT } from '../../lib/i18n.jsx'

/**
 * Nekonečný pás nástrojů. Dvě kopie seznamu vedle sebe a posun o 50 % —
 * tím vznikne smyčka bez skoku. Při omezeném pohybu se pás jen zalomí do mřížky.
 */
export default function ToolMarquee() {
  const { reducedMotion } = usePrefs()
  const { lang } = useT()

  const label = lang === 'en' ? 'Tools I actually use' : 'Nástroje, se kterými pracuji'

  if (reducedMotion) {
    return (
      <section className="border-y border-line bg-bg-sunk py-6">
        <div className="mx-auto w-full max-w-[82rem] px-5 sm:px-7">
          <p className="label-mono">{label}</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {toolbelt.map((tool) => (
              <li key={tool} className="font-display text-[1.05rem] text-text-soft">
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }

  return (
    <section
      className="relative overflow-hidden border-y border-line bg-bg-sunk py-7"
      aria-label={label}
    >
      <div className="relative flex">
        <div
          className="flex shrink-0 items-center gap-10 pr-10"
          style={{ animation: 'abl-marquee 42s linear infinite' }}
        >
          {[...toolbelt, ...toolbelt].map((tool, i) => (
            <span key={`${tool}-${i}`} className="flex shrink-0 items-center gap-10">
              <span className="font-display text-[1.25rem] font-medium text-text-soft transition-colors duration-300 hover:text-text">
                {tool}
              </span>
              <span aria-hidden className="size-1 shrink-0 rounded-full bg-accent/60" />
            </span>
          ))}
        </div>
      </div>

      {/* zastínění okrajů, aby pás nevypadal odstřižený */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bg-sunk to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bg-sunk to-transparent"
      />

      <style>{`
        @keyframes abl-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
