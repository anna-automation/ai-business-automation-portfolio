import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils.js'

/**
 * Drobné díly landing page: růžová pilulka, hlavička sekce a světelné pozadí.
 * Všechno počítá s tím, že běží uvnitř .lp — barvy bere z tamních proměnných.
 */

const PILL_SIZES = {
  md: 'h-12 px-6 text-[1.02rem]',
  lg: 'h-14 px-7 text-[1.1rem]',
}

/** Hlavní akce stránky — růžová pilulka se šipkou. */
export function PillButton({ children, to, href, size = 'md', className, icon = true, ...rest }) {
  const classes = cn(
    'lp-pill inline-flex select-none items-center gap-[0.6rem]',
    PILL_SIZES[size] ?? PILL_SIZES.md,
    className
  )

  // `icon` smí být i konkrétní ikona — true znamená výchozí šipku, false žádnou.
  const Ikona = icon === true ? ChevronRight : icon || null

  const content = (
    <>
      <span>{children}</span>
      {Ikona && (
        <Ikona
          size={size === 'lg' ? 20 : 18}
          strokeWidth={2.6}
          className="-mr-1 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
        />
      )}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={cn('group', classes)} {...rest}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={cn('group', classes)} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" className={cn('group', classes)} {...rest}>
      {content}
    </button>
  )
}

/**
 * Hlavička sekce v levém sloupci: růžový mikro-label, bílý nadpis, růžová
 * linka. Část nadpisu se dá zvýraznit růžově přes `accent`.
 */
export function SectionLead({ eyebrow, title, accent, className }) {
  return (
    <div className={cn('shrink-0', className)}>
      <p className="lp-eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-[clamp(1.75rem,4.2vw,2.5rem)]">
        {title}
        {accent && (
          <>
            {' '}
            <span className="text-[var(--lp-pink)]">{accent}</span>
          </>
        )}
      </h2>
      <span aria-hidden className="lp-underline mt-5" />
    </div>
  )
}

/**
 * Světelné pozadí celé stránky: růžová a tyrkysová záře po okrajích plus
 * jemná technická mřížka. Čistě dekorace, proto aria-hidden.
 */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* základní spád — nahoře o něco světlejší než dole */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#0b0a1a_0%,#07060f_38%,#050410_100%)]" />

      {/* technická mřížka, sotva viditelná */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.028)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.028)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(85%_70%_at_50%_30%,#000,transparent)]" />

      {/* růžová záře vlevo nahoře a dole */}
      <div className="absolute -left-[22%] top-[6%] size-[46rem] rounded-full bg-[radial-gradient(circle,rgb(255_20_102/0.26)_0%,transparent_62%)] blur-[20px]" />
      <div className="absolute -left-[16%] top-[58%] size-[38rem] rounded-full bg-[radial-gradient(circle,rgb(216_0_79/0.22)_0%,transparent_64%)] blur-[20px]" />
      <div className="absolute -left-[13%] top-[70%] size-[32rem] rounded-full bg-[radial-gradient(circle,rgb(255_20_102/0.26)_0%,transparent_62%)] blur-[20px]" />

      {/* tyrkysová záře vpravo */}
      <div className="absolute -right-[18%] top-[32%] size-[42rem] rounded-full bg-[radial-gradient(circle,rgb(34_211_238/0.16)_0%,transparent_64%)] blur-[20px]" />
      <div className="absolute -right-[24%] bottom-[2%] size-[40rem] rounded-full bg-[radial-gradient(circle,rgb(124_58_237/0.2)_0%,transparent_64%)] blur-[20px]" />

      {/* Světelné stopy po okrajích. Na předloze to nejsou linky, ale měkké
          pruhy světla, které se otřou o kraj stránky — proto široká stopa plus
          rozostření. Trasy drží v okrajích a pod bannerem, aby přes obsah
          nešel ostrý proužek. */}
      <svg
        className="absolute inset-0 size-full opacity-80"
        viewBox="0 0 1440 2400"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="lp-arc-pink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff1466" stopOpacity="0" />
            <stop offset="0.45" stopColor="#ff1466" stopOpacity="0.5" />
            <stop offset="1" stopColor="#c026d3" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lp-arc-cyan" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="0.5" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
          <filter id="lp-arc-soft" x="-40%" y="-15%" width="180%" height="130%">
            <feGaussianBlur stdDeviation="20" />
          </filter>
        </defs>
        <g filter="url(#lp-arc-soft)">
          {/* levý kraj vedle hero a karet */}
          <path
            d="M-190 1180 C -40 1000, 30 840, -10 600"
            stroke="url(#lp-arc-pink)"
            strokeWidth="34"
            strokeLinecap="round"
            fill="none"
          />
          {/* pod závěrečným bannerem, zleva doprava */}
          <path
            d="M-180 2150 C 120 2090, 380 2020, 620 1930"
            stroke="url(#lp-arc-pink)"
            strokeWidth="30"
            strokeLinecap="round"
            fill="none"
          />
          {/* pravý kraj u sekce Propojit */}
          <path
            d="M1580 1460 C 1420 1560, 1370 1700, 1410 1880"
            stroke="url(#lp-arc-cyan)"
            strokeWidth="28"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  )
}
